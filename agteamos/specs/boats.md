# Spec maestra: boats

**Última actualización**: 2026-08-19 (ticket [#29](https://github.com/oclaw74-lang/ZarpeIslands/issues/29), C1)
**Estado**: Parcial — CRUD básico, alcance por `boat_supervisors` pendiente de C4

## Tabla `boats`
- `id` uuid PK
- `company_id` uuid FK → companies, `on delete cascade`
- `name` text not null
- `registration_number` text
- `boat_type` text check (`excursion`/`rental`/`mixed`)
- `capacity` integer
- `status` text check (`active`/`in_maintenance`/`inactive`), default `active`
- `notes` text
- `created_at`, `updated_at` timestamptz (trigger `set_updated_at()`, reutilizada de A4b)

**Pendiente**: alcance de lectura por `boat_supervisors` para el rol Encargado (Epic C4).

## RLS
- `boats_select_own_company`: SELECT para cualquier `company_members` de la propia empresa (sin acotar por rol todavía — C4 lo restringe para Encargado).
- `boats_insert_owner_manager` / `boats_update_owner_manager`: INSERT/UPDATE solo si `access_role in ('owner', 'manager')` en la propia empresa.

## Historial de cambios
- 2026-08-19 (#29, C1): creación del modelo y RLS de escritura owner/manager.
