# Spec maestra: punches

**Última actualización**: 2026-08-18 (ticket [#13](https://github.com/oclaw74-lang/ZarpeIslands/issues/13), A4b)
**Estado**: Parcial — schema + sync base, sin lógica de negocio de ponche todavía (Epic D)

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
- `updated_at` timestamptz not null default now() — mantenido por trigger `punches_set_updated_at`
- `deleted_at` timestamptz — soft delete

**Pendiente**: FK real a `boat_assignment_id` (Epic E1), lógica de `flagged_out_of_schedule` (Epic D4), orquestación de sync desde la app (A4c), UI de ponche (Epic D).

## RLS
- SELECT/INSERT/UPDATE limitados a `company_member_id = current_company_member_id()`.
- Verificado con test cruzado de 2 usuarios (ver tarea archivada [#12](../changes/archive/2026-08-18-12-schema-companies-punches/)): un usuario nunca ve filas de otro.

## Funciones de sync (WatermelonDB, ver ADR-004)

### `push_changes(changes jsonb)`
- `SECURITY DEFINER`. Recibe `{ punches: { created: [...], updated: [...], deleted: [...] } }`.
- Resuelve `company_id`/`company_member_id` del caller server-side — ignora esos campos si vienen en el payload.
- `updated`: conflicto resuelto por "gana el último cambio" comparando `device_timestamp`.
- `deleted`: soft delete (`deleted_at = now()`).
- Retorna `{ applied, skipped }`.

### `pull_changes(last_pulled_at timestamptz)`
- `SECURITY DEFINER`. Filtra siempre por `company_member_id` del caller.
- Retorna `{ punches: { created, updated, deleted }, timestamp }` desde `last_pulled_at`.

**Verificado** (ver tarea archivada [#13](../changes/archive/2026-08-18-13-postgres-push-pull/)): creación, conflicto last-write-wins, aislamiento cruzado (lectura y escritura), borrado lógico — todo contra la base real.

## Historial de cambios
- 2026-08-18 (#12): creación de la tabla y RLS base.
- 2026-08-18 (#13): + `updated_at`/`deleted_at`, funciones `push_changes`/`pull_changes`.
