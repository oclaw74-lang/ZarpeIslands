# Spec maestra: job_positions

**Última actualización**: 2026-08-19 (ticket [#30](https://github.com/oclaw74-lang/ZarpeIslands/issues/30), C2)
**Estado**: Completo — catálogo por empresa con seeding automático de defaults

## Tabla `job_positions`
- `id` uuid PK
- `company_id` uuid FK → companies, `on delete cascade`
- `name` text not null
- `is_required_per_shift` boolean not null, default `false`
- `rotation_repeat_allowed` boolean not null, default `false`
- `created_at`, `updated_at` timestamptz (trigger `set_updated_at()`, reutilizada de A4b)

**Consumido por**: B4 (`company_members.job_position_id` referenciará esta tabla) y Epic E (validación de cobertura mínima por turno, usa `is_required_per_shift`).

## Seeding automático
- Trigger `companies_seed_default_job_positions` (`AFTER INSERT ON companies`) ejecuta `seed_default_job_positions()` (`SECURITY DEFINER`).
- Inserta 5 puestos por defecto para toda empresa nueva:
  - Captain/Skipper — `is_required_per_shift: true`, `rotation_repeat_allowed: true`
  - Deckhand, Mechanic, Tour Guide, Other — ambos flags `false`
- Funciona para cualquier vía de creación de empresa (no depende de `bootstrap_company()`).

## RLS
- `job_positions_select_own_company`: SELECT para cualquier `company_members` de la propia empresa.
- `job_positions_insert_owner_manager` / `job_positions_update_owner_manager`: INSERT/UPDATE solo si `access_role in ('owner', 'manager')` en la propia empresa.

## Historial de cambios
- 2026-08-19 (#30, C2): creación del modelo, seeding de defaults y RLS de escritura owner/manager.
