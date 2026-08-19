# Tasks checklist: TASK-29-boats-crud

- [x] Migración: tabla `boats` + RLS
- [x] `boatService.ts` (`listBoats`, `getBoat`, `createBoat`, `updateBoat`) + tests
- [x] i18n namespace `boats`
- [x] `BoatsListScreen` + tests (toggle inactivos, botón crear solo owner/manager)
- [x] `BoatFormScreen` (crear + editar) + tests
- [x] Rutas `src/app/boats/*`
- [x] Link desde Home
- [x] Verificado contra Supabase real: crear barco, listar, editar status a inactive, ocultar de la lista por default, y confirmado que un rol crew no puede crear (RLS 403) pero sí puede leer
