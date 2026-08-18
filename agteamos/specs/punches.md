# Spec maestra: punches

**Última actualización**: 2026-08-18 (ticket [#12](https://github.com/oclaw74-lang/ZarpeIslands/issues/12), A4a)
**Estado**: Parcial — schema base, sin lógica de negocio ni FK de `boat_assignment_id` todavía

## Tabla `punches`
- `id` uuid PK
- `company_id` uuid FK → companies
- `company_member_id` uuid FK → company_members
- `boat_assignment_id` uuid — **sin FK todavía** (tabla `boat_assignments` no existe hasta Epic E1)
- `punch_type` text check (in/out)
- `device_timestamp` timestamptz not null
- `synced_at` timestamptz
- `latitude`, `longitude` numeric
- `created_offline` boolean default false
- `flagged_out_of_schedule` boolean default false
- `created_at` timestamptz

**Pendiente**: FK real a `boat_assignment_id` (Epic E1), lógica de `flagged_out_of_schedule` (Epic D4), cola offline y reconciliación de `device_timestamp`/`synced_at` (Epic D2/D3, A4c).

## RLS
- SELECT/INSERT/UPDATE limitados a `company_member_id = current_company_member_id()`.
- Verificado con test cruzado de 2 usuarios (ver tarea archivada [#12](../changes/archive/2026-08-18-12-schema-companies-punches/)): un usuario nunca ve filas de otro.

## Historial de cambios
- 2026-08-18 (#12): creación de la tabla y RLS base.
