-- C1: CRUD de barcos. RLS de escritura acotada a Owner/Manager desde el
-- día uno (no se difiere a C4 — ver design.md de esta tarea): C4 agrega
-- después el acotamiento de LECTURA por boat_supervisors para Encargado,
-- un refinamiento distinto de esta base.

create table boats (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  registration_number text,
  boat_type text not null check (boat_type in ('excursion', 'rental', 'mixed')),
  capacity integer,
  status text not null default 'active' check (status in ('active', 'in_maintenance', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reutiliza set_updated_at() creada en A4b (20260818172540_punches_sync_columns.sql).
create trigger boats_set_updated_at
  before update on boats
  for each row
  execute function set_updated_at();

alter table boats enable row level security;

create policy "boats_select_own_company" on boats
  for select
  using (
    company_id in (select company_id from company_members where auth_user_id = auth.uid())
  );

create policy "boats_insert_owner_manager" on boats
  for insert
  with check (
    company_id in (
      select company_id from company_members
      where auth_user_id = auth.uid() and access_role in ('owner', 'manager')
    )
  );

create policy "boats_update_owner_manager" on boats
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
