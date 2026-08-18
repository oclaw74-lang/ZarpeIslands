# Technical Design: TASK-12-schema-companies-punches

## Approach

Migración SQL única (`supabase migration new schema_companies_punches`) con las 3 tablas mínimas + una función helper `current_company_member_id()` (evita repetir el mismo subquery en cada política RLS) + políticas RLS básicas. Formato y convenciones ya establecidas en `agteamos/devops/INFRASTRUCTURE.md` (migración por dominio, sin Docker, `supabase db push` directo contra el proyecto remoto).

## Files to Create

| File | Description |
|------|--------------|
| `supabase/migrations/<timestamp>_schema_companies_punches.sql` | `companies`, `company_members`, `punches`, función helper, RLS |
| `agteamos/specs/deltas/companies.md` | Delta ADDED contra spec maestra (todavía no existe — primera vez que se toca este dominio) |
| `agteamos/specs/deltas/punches.md` | Delta ADDED contra spec maestra |

## Esquema SQL (resumen — detalle completo en la migración)

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  default_currency text default 'USD',
  default_language text default 'en',
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
  access_role text not null check (access_role in ('owner','manager','supervisor','secretary','crew')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, auth_user_id)
);

create table punches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  company_member_id uuid not null references company_members(id) on delete cascade,
  boat_assignment_id uuid, -- sin FK todavía (Epic E crea boat_assignments)
  punch_type text not null check (punch_type in ('in','out')),
  device_timestamp timestamptz not null,
  synced_at timestamptz,
  latitude numeric,
  longitude numeric,
  created_offline boolean not null default false,
  flagged_out_of_schedule boolean not null default false,
  created_at timestamptz not null default now()
);

create function current_company_member_id() returns uuid
  language sql stable security definer as $$
    select id from company_members where auth_user_id = auth.uid() limit 1;
$$;
```

## RLS (resumen)

- `companies`: `SELECT` si `id` coincide con la empresa del `company_member` del usuario.
- `company_members`: `SELECT` de la propia fila (`auth_user_id = auth.uid()`) — reglas más amplias por rol (Owner/Manager ven todo) se agregan en B5, no acá.
- `punches`: `SELECT`/`INSERT`/`UPDATE` solo donde `company_member_id = current_company_member_id()`.

## Database Changes

Ver arriba — 3 tablas nuevas, 1 función helper.

## Security Considerations

- `current_company_member_id()` es `SECURITY DEFINER` para poder leer `company_members` dentro de la política RLS de `punches` sin recursión de RLS. Se limita a una sola fila (`limit 1`), sin exponer más que el propio `id`.
- Esta RLS es intencionalmente mínima (no la matriz completa de `documents/04`) — Epic B5 la completa cuando se agreguen los demás roles y alcances.
