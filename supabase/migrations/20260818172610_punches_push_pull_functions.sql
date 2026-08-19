-- A4b: funciones RPC de sync para WatermelonDB (ver ADR-004).
-- Ambas resuelven company_member_id/company_id del caller internamente
-- (nunca confían en lo que venga en el payload del cliente).

create function push_changes(changes jsonb) returns jsonb
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  caller_member_id uuid;
  caller_company_id uuid;
  rec jsonb;
  rec_id uuid;
  existing_device_ts timestamptz;
  incoming_device_ts timestamptz;
  applied_count int := 0;
  skipped_count int := 0;
begin
  caller_member_id := current_company_member_id();
  if caller_member_id is null then
    raise exception 'push_changes: no company_member found for current user';
  end if;

  select company_id into caller_company_id from company_members where id = caller_member_id;

  -- created
  for rec in select * from jsonb_array_elements(coalesce(changes -> 'punches' -> 'created', '[]'::jsonb))
  loop
    insert into punches (
      id, company_id, company_member_id, boat_assignment_id, punch_type,
      device_timestamp, latitude, longitude, created_offline, flagged_out_of_schedule
    ) values (
      coalesce((rec ->> 'id')::uuid, gen_random_uuid()),
      caller_company_id,
      caller_member_id,
      nullif(rec ->> 'boat_assignment_id', '')::uuid,
      rec ->> 'punch_type',
      (rec ->> 'device_timestamp')::timestamptz,
      nullif(rec ->> 'latitude', '')::numeric,
      nullif(rec ->> 'longitude', '')::numeric,
      coalesce((rec ->> 'created_offline')::boolean, true),
      coalesce((rec ->> 'flagged_out_of_schedule')::boolean, false)
    )
    on conflict (id) do nothing;
    applied_count := applied_count + 1;
  end loop;

  -- updated, con resolución de conflicto "gana el último cambio" por device_timestamp
  for rec in select * from jsonb_array_elements(coalesce(changes -> 'punches' -> 'updated', '[]'::jsonb))
  loop
    rec_id := (rec ->> 'id')::uuid;

    select device_timestamp into existing_device_ts
      from punches
      where id = rec_id and company_member_id = caller_member_id;

    if not found then
      -- fila no existe o no pertenece al caller — no se aplica.
      skipped_count := skipped_count + 1;
      continue;
    end if;

    incoming_device_ts := (rec ->> 'device_timestamp')::timestamptz;

    if existing_device_ts is not null and incoming_device_ts <= existing_device_ts then
      -- versión entrante no es más nueva — se descarta silenciosamente (last-write-wins).
      skipped_count := skipped_count + 1;
      continue;
    end if;

    update punches set
      punch_type = rec ->> 'punch_type',
      device_timestamp = incoming_device_ts,
      latitude = nullif(rec ->> 'latitude', '')::numeric,
      longitude = nullif(rec ->> 'longitude', '')::numeric,
      flagged_out_of_schedule = coalesce((rec ->> 'flagged_out_of_schedule')::boolean, flagged_out_of_schedule),
      synced_at = now()
    where id = rec_id and company_member_id = caller_member_id;

    applied_count := applied_count + 1;
  end loop;

  -- deleted (soft delete)
  for rec_id in select value::uuid from jsonb_array_elements_text(coalesce(changes -> 'punches' -> 'deleted', '[]'::jsonb)) as value
  loop
    update punches set deleted_at = now()
    where id = rec_id and company_member_id = caller_member_id;
  end loop;

  return jsonb_build_object('applied', applied_count, 'skipped', skipped_count);
end;
$$;

create function pull_changes(last_pulled_at timestamptz default null) returns jsonb
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  caller_member_id uuid;
  cutoff timestamptz;
  created_rows jsonb;
  updated_rows jsonb;
  deleted_ids jsonb;
begin
  caller_member_id := current_company_member_id();
  if caller_member_id is null then
    raise exception 'pull_changes: no company_member found for current user';
  end if;

  cutoff := coalesce(last_pulled_at, 'epoch'::timestamptz);

  select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) into created_rows
  from punches p
  where p.company_member_id = caller_member_id
    and p.created_at > cutoff
    and p.deleted_at is null;

  select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) into updated_rows
  from punches p
  where p.company_member_id = caller_member_id
    and p.updated_at > cutoff
    and p.created_at <= cutoff
    and p.deleted_at is null;

  select coalesce(jsonb_agg(p.id), '[]'::jsonb) into deleted_ids
  from punches p
  where p.company_member_id = caller_member_id
    and p.deleted_at > cutoff;

  return jsonb_build_object(
    'punches', jsonb_build_object(
      'created', created_rows,
      'updated', updated_rows,
      'deleted', deleted_ids
    ),
    'timestamp', now()
  );
end;
$$;

grant execute on function push_changes(jsonb) to authenticated;
grant execute on function pull_changes(timestamptz) to authenticated;
