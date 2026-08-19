# Tasks checklist: TASK-30-job-positions-catalog

- [ ] Migración: tabla `job_positions` + trigger de siembra default + RLS
- [ ] `jobPositionService.ts` + tests
- [ ] `JobPositionsListScreen` + tests
- [ ] `JobPositionFormScreen` + tests
- [ ] Rutas `src/app/job-positions/*`
- [ ] Link desde Home
- [ ] Verificar contra Supabase real: bootstrap de una empresa nueva siembra los 5 puestos default con los flags correctos; crear/editar un puesto custom; RLS rechaza a un rol no-owner/manager
