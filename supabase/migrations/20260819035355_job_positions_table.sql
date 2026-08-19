-- C2: catálogo de puestos de trabajo. AC#1 pide que venga pre-cargado por
-- default — se hace con un trigger AFTER INSERT en companies en vez de
-- meterlo dentro de bootstrap_company() (B2), para no acoplar la creación
-- de la empresa con la siembra del catálogo: funciona sin importar el
-- camino por el que se cree una company en el futuro.

create table job_positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  is_required_per_shift boolean not null default false,
  rotation_repeat_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reutiliza set_updated_at() creada en A4b.
create trigger job_positions_set_updated_at
  before update on job_positions
  for each row
  execute function set_updated_at();

create function seed_default_job_positions() returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into job_positions (company_id, name, is_required_per_shift, rotation_repeat_allowed)
  values
    (new.id, 'Captain/Skipper', true, true),
    (new.id, 'Deckhand', false, false),
    (new.id, 'Mechanic', false, false),
    (new.id, 'Tour Guide', false, false),
    (new.id, 'Other', false, false);
  return new;
end;
$$;

create trigger companies_seed_default_job_positions
  after insert on companies
  for each row
  execute function seed_default_job_positions();

alter table job_positions enable row level security;

create policy "job_positions_select_own_company" on job_positions
  for select
  using (
    company_id in (select company_id from company_members where auth_user_id = auth.uid())
  );

create policy "job_positions_insert_owner_manager" on job_positions
  for insert
  with check (
    company_id in (
      select company_id from company_members
      where auth_user_id = auth.uid() and access_role in ('owner', 'manager')
    )
  );

create policy "job_positions_update_owner_manager" on job_positions
  for update
  using (
    company_id in (
      select company_id from company_members
      where auth_user_id = auth.uid() and access_role in ('owner', 'manager')
    )
  )
  with check (
    company_id in (
      select company_id from company_members
      where auth_user_id = auth.uid() and access_role in ('owner', 'manager')
    )
  );
