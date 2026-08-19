# Technical Design: TASK-30-job-positions-catalog

## Approach

AC#1 pide un catálogo **pre-cargado por defecto**. En vez de modificar
`bootstrap_company()` (B2) para que además siembre posiciones — acoplando
dos responsabilidades en una función — se agrega un trigger
`AFTER INSERT ON companies` que siembra los 5 puestos default. Funciona sin
importar el camino por el que se cree la empresa (bootstrap de B2 hoy,
cualquier otro en el futuro), y mantiene `bootstrap_company()` enfocada en
una sola cosa.

Mismo patrón de RLS que C1: SELECT abierto a cualquier miembro de la
empresa, INSERT/UPDATE acotados a Owner/Manager.

## Files to Create

| File | Description |
|------|--------------|
| `supabase/migrations/<ts>_job_positions_table.sql` | Tabla + trigger de siembra default + RLS |
| `src/features/job-positions/api/jobPositionService.ts` | `listJobPositions`, `createJobPosition`, `updateJobPosition` |
| Tests | `jobPositionService.test.ts` |
| `src/features/job-positions/screens/JobPositionsListScreen.tsx` | Lista + botón crear (owner/manager) |
| `src/features/job-positions/screens/JobPositionFormScreen.tsx` | Crear/editar |
| Tests de las screens | Happy path + error + edge |
| `src/app/job-positions/index.tsx`, `new.tsx`, `[id]/edit.tsx` | Rutas delgadas |

## Files to Modify

| File | What changes |
|------|--------------|
| `src/features/home/screens/HomeScreen.tsx` | Link temporal a `/job-positions` |

## Database Changes

```sql
create table job_positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  is_required_per_shift boolean not null default false,
  rotation_repeat_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
Trigger `set_updated_at()` reutilizada (A4b). Trigger nuevo
`seed_default_job_positions()` `AFTER INSERT ON companies FOR EACH ROW`
inserta: Captain/Skipper (`is_required_per_shift=true`,
`rotation_repeat_allowed=true`), Deckhand, Mechanic, Tour Guide, Other
(los 4 últimos con ambos flags en `false`).

RLS: `job_positions_select_own_company`,
`job_positions_insert_owner_manager`, `job_positions_update_owner_manager`
— mismo patrón que `boats` (C1).

## Security Considerations (STRIDE)

Igual que C1: Elevation of Privilege cubierto por la RLS de INSERT/UPDATE
acotada a `access_role in ('owner','manager')`.
