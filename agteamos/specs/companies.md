# Spec maestra: companies

**Última actualización**: 2026-08-18 (ticket [#12](https://github.com/oclaw74-lang/ZarpeIslands/issues/12), A4a)
**Estado**: Parcial — modelo mínimo, se amplía en Epic B4/C2

## Tabla `companies`
- `id` uuid PK
- `name` text not null
- `country` text
- `default_currency` text default 'USD'
- `default_language` text default 'en'
- `timezone` text
- `is_active` boolean default true
- `created_at` timestamptz default now()

## Tabla `company_members` (mínimo)
- `id` uuid PK
- `company_id` uuid FK → companies
- `auth_user_id` uuid FK → auth.users
- `full_name`, `email` text not null
- `access_role` text check (owner/manager/supervisor/secretary/crew)
- `is_active` boolean default true
- `created_at` timestamptz
- unique (company_id, auth_user_id)

**Pendiente** (ver `documents/05` sección 3.2 para el modelo completo): `job_position_id` (Epic C2), `fixed_boat_id` (Epic E), `preferred_language`, `hired_at` (Epic B4).

## RLS
- `companies`: SELECT solo de la propia empresa (vía `company_members`).
- `company_members`: SELECT solo de la propia fila. Alcance ampliado por rol (Owner/Manager ven todas) pendiente de Epic B5.

## Función helper
- `current_company_member_id()`: retorna el `id` de `company_members` del usuario autenticado (`auth.uid()`). `SECURITY DEFINER`.
- `bootstrap_company(p_name, p_full_name, p_country, p_default_currency, p_default_language, p_timezone) returns company_members`
  (B2): crea `companies` + `company_members` (owner) para el usuario autenticado en una sola
  transacción. `SECURITY DEFINER`. Rechaza (`raise exception`) si `auth.uid()` ya tiene una
  membresía — evita duplicados sin depender de RLS de INSERT (esa llega completa en B5).
  `grant execute` a `authenticated`.

## Historial de cambios
- 2026-08-18 (#12): creación del modelo mínimo.
- 2026-08-18 (#22, B2): agregada `bootstrap_company()`.
