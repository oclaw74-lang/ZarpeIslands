# Progress: A4b. Funciones Postgres push/pull para sync

**Ticket**: [#13](https://github.com/oclaw74-lang/ZarpeIslands/issues/13) — Parent: [#5](https://github.com/oclaw74-lang/ZarpeIslands/issues/5) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/5/13-postgres-push-pull`

## Next Action

Step 7-8 completos. Listo para Step 9 (close-task).

## Decisions Made

- **2026-08-18**: `punches` (A4a) no tenía `updated_at`/`deleted_at` — se agregan en este ticket porque el protocolo de sync de WatermelonDB (created/updated/deleted) los necesita. No se tocan otras columnas de A4a.
- **2026-08-18**: `company_id`/`company_member_id` del payload de `push_changes` se ignoran deliberadamente y se reemplazan por los del caller (resueltos server-side) — previene que un cliente comprometido escriba a nombre de otro miembro.
- **2026-08-18**: Verificación hecha con conexión Postgres directa simulando el rol/claims `authenticated` (misma técnica que A4a) en vez de un signup real de usuarios de prueba — evita depender de configuración de confirmación de email del proyecto, prueba el mismo camino que usa PostgREST internamente.

## Files Modified

| Archivo | Qué cambia |
|---|---|
| `supabase/migrations/20260818172540_punches_sync_columns.sql` | Nuevo — `updated_at`/`deleted_at` + trigger |
| `supabase/migrations/20260818172610_punches_push_pull_functions.sql` | Nuevo — `push_changes`, `pull_changes` |
| `agteamos/specs/deltas/punches.md` | Delta MODIFIED (columnas) + ADDED (funciones) |

## Verificación de Acceptance Criteria

| AC | Verificación | Resultado |
|---|---|---|
| #1 — push crea/actualiza/borra correctamente | Insert vía `push_changes` (created), soft-delete vía `push_changes` (deleted), ambos confirmados con SELECT posterior | ✅ Pass |
| #2 — pull filtrado por `company_member_id` | `pull_changes` de userB no incluye el punch de userA; `push_changes` de userB sobre el punch de userA no lo modifica (`skipped: 1`) | ✅ Pass |
| #3 — conflicto de `device_timestamp` resuelto con el más reciente | Update con `device_timestamp` más viejo se descarta silenciosamente; update con uno más nuevo sí se aplica | ✅ Pass |

## Evidence

Sin capturas de UI (funciones Postgres puras). Evidencia = output del script de verificación, documentado en la tabla de arriba.
