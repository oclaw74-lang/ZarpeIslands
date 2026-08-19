# Progress: C2. Catálogo de job_positions

**Ticket**: [#30](https://github.com/oclaw74-lang/ZarpeIslands/issues/30) — Epic C: [#28](https://github.com/oclaw74-lang/ZarpeIslands/issues/28)
**Branch**: `feature/30-job-positions-catalog`

## Decisions Made

- **Seeding de los 5 puestos por defecto vía trigger `AFTER INSERT ON companies`** (`seed_default_job_positions`, `SECURITY DEFINER`), no dentro de `bootstrap_company()` — así funciona para cualquier vía futura de creación de empresa, no solo el registro actual.
- **RLS de escritura (owner/manager) en este mismo ticket**, mismo patrón que `boats` (C1): SELECT abierto a cualquier miembro de la empresa, INSERT/UPDATE acotado a `access_role in ('owner','manager')`.
- **`rotation_repeat_allowed` y `is_required_per_shift` son flags de datos, no de negocio** — el algoritmo de cobertura mínima de turnos que los va a consumir es de Epic E; acá solo se persiste y edita el dato.

## Verificación (contra Supabase real)

1. Migración `20260819035355_job_positions_table.sql` aplicada al proyecto real vía `npx supabase db push`.
2. Usuario de prueba Owner (`c2-qa-owner@zarpeislands.test`) confirmado vía Admin API → bootstrap de empresa real (RPC de B2) → confirmado por REST directo que los 5 puestos por defecto se sembraron con los flags correctos (Captain/Skipper con ambos flags `true`, el resto `false`).
3. Login real en emulador (Android) con ese usuario → lista muestra los 5 puestos por defecto, botón "Add position" visible (rol owner).
4. Creado un puesto custom ("Bartender", `is_required_per_shift: true`) desde la UI → aparece en la lista con el badge correcto.
5. Editado ese mismo puesto desde la UI, apagando `is_required_per_shift` → guardado y reflejado correctamente en la lista (AC#3 — el dato es editable y se persiste).
6. **RLS verificado a nivel de política, no solo UI**: creado un segundo usuario con `access_role: crew` en la misma empresa → `SELECT` en `job_positions` vía API directa con su token real → `200 OK` (lectura abierta a todo miembro) → `INSERT` con el mismo token → rechazado con `"new row violates row-level security policy for table job_positions"` (HTTP 403).
7. Limpieza: usuario owner, usuario crew y la empresa de prueba borrados (cascada `companies` → `job_positions`/`company_members` confirmada).

## Files Modified

- `supabase/migrations/20260819035355_job_positions_table.sql` — tabla `job_positions`, trigger de seeding, RLS.
- `src/features/job-positions/api/jobPositionService.ts` + tests — `listJobPositions`, `getJobPosition`, `createJobPosition`, `updateJobPosition`.
- `src/features/job-positions/screens/JobPositionsListScreen.tsx`, `JobPositionFormScreen.tsx` + tests.
- `src/app/job-positions/index.tsx`, `new.tsx`, `[id]/edit.tsx`.
- `src/features/home/screens/HomeScreen.tsx` — link temporal a `/job-positions` (placeholder de navegación hasta B3).
- `src/lib/i18n/locales/{en,es}/jobPositions.json`.
- `agteamos/specs/job_positions.md` (spec maestra nueva).

## Evidence

- Verificación de seeding por REST directo (5 defaults con flags correctos) — ver arriba.
- Verificación de UI (crear/editar) y de RLS (403 real) hechas por interacción directa en emulador + API — no se guardaron capturas de pantalla en este ticket (verificación por `uiautomator dump` + curl, no por captura).
- `npx jest`, `npx tsc --noEmit`, `npx eslint src --max-warnings=0` — todos verdes (ver verify-report.md).
