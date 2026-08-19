-- A4a: schema mínimo para probar el mecanismo de sync offline-first (WatermelonDB, ADR-004).
-- Alcance intencionalmente reducido — ver agteamos/changes/12-schema-companies-punches/specs/requirements.md
-- "Fuera de alcance". El modelo completo de company_members, boat_assignments, etc. se agrega
-- en sus propios tickets de epic (B/C/E, ver agteamos/product/backlog-detail.md).

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  default_currency text not null default 'USD',
  default_language text not null default 'en',
  timezone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  access_role text not null check (access_role in ('owner', 'manager', 'supervisor', 'secretary', 'crew')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, auth_user_id)
);

create table punches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  company_member_id uuid not null references company_members(id) on delete cascade,
  -- boat_assignment_id: sin FK todavía, boat_assignments no existe hasta Epic E.
  boat_assignment_id uuid,
  punch_type text not null check (punch_type in ('in', 'out')),
  device_timestamp timestamptz not null,
  synced_at timestamptz,
  latitude numeric,
  longitude numeric,
  created_offline boolean not null default false,
  flagged_out_of_schedule boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helper: id de company_members del usuario autenticado. SECURITY DEFINER para poder leer
-- company_members dentro de la política RLS de punches sin recursión de RLS.
create function current_company_member_id() returns uuid
  language sql
  stable
  security definer
  set search_path = public
as $$
  select id from company_members where auth_user_id = auth.uid() limit 1;
$$;

alter table companies enable row level security;
alter table company_members enable row level security;
alter table punches enable row level security;

-- companies: solo la propia empresa del usuario.
create policy "companies_select_own" on companies
  for select
  using (
    id in (select company_id from company_members where auth_user_id = auth.uid())
  );

-- company_members: solo la propia fila. Alcance por rol (Owner/Manager ven todo) se agrega en B5.
create policy "company_members_select_own" on company_members
  for select
  using (auth_user_id = auth.uid());

-- punches: CRUD limitado al propio company_member_id.
create policy "punches_select_own" on punches
  for select
  using (company_member_id = current_company_member_id());

create policy "punches_insert_own" on punches
  for insert
  with check (company_member_id = current_company_member_id());

create policy "punches_update_own" on punches
  for update
  using (company_member_id = current_company_member_id())
  with check (company_member_id = current_company_member_id());
