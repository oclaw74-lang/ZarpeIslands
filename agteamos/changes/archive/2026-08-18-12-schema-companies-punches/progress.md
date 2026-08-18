# Progress: A4a. Schema: companies, company_members (mínimo) y punches

**Ticket**: [#12](https://github.com/oclaw74-lang/ZarpeIslands/issues/12) — Parent: [#5](https://github.com/oclaw74-lang/ZarpeIslands/issues/5) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/5/12-schema-companies-punches`

## Next Action

Step 7-8 completos. Listo para Step 9 (close-task).

## Decisions Made

- **2026-08-18**: Se detectó que el CLI de Supabase quedó autenticado con una cuenta distinta a mitad de sesión (mismo patrón que el mismatch de cuentas de GitHub visto antes en el proyecto) — `supabase projects list` mostraba un proyecto ajeno ("PAUL"). El usuario corrió `supabase login` de nuevo con la cuenta correcta antes de aplicar la migración.
- **2026-08-18**: Verificación de AC#3 hecha con conexión Postgres directa (`pg`, superusuario) en vez del SQL editor del dashboard (equivalente funcional — inserta respetando FKs, sin necesidad de UI). Script temporal, no commiteado, datos de prueba limpiados al final.
- **2026-08-18**: Verificación de RLS (AC de aislamiento) simulada con `set local role authenticated; select set_config('request.jwt.claims', ...)` — técnica estándar para probar políticas RLS de Supabase vía SQL directo sin pasar por PostgREST.

## Files Modified

| Archivo | Qué cambia |
|---|---|
| `supabase/migrations/20260818164903_schema_companies_punches.sql` | Nuevo — tablas `companies`, `company_members`, `punches`, función `current_company_member_id()`, RLS |
| `agteamos/specs/deltas/companies.md` | Nuevo — delta ADDED |
| `agteamos/specs/deltas/punches.md` | Nuevo — delta ADDED |

## Verificación de Acceptance Criteria

| AC | Verificación | Resultado |
|---|---|---|
| #1 — migración crea las 3 tablas con FKs | `supabase db push` + `supabase migration list` (local == remoto) | ✅ Pass |
| #2 — RLS activa, aislamiento por `company_member_id` | Test con 2 usuarios simulados vía `pg` directo: userA con 1 punch propio + 1 punch de userB en la tabla, `select * from punches` bajo el rol/claims de userA devuelve únicamente su propia fila | ✅ Pass |
| #3 — insertar fila de prueba en cada tabla respetando FKs | Insert exitoso encadenado `auth.users → companies → company_members → punches`, luego cleanup completo (sin datos de prueba remanentes) | ✅ Pass |

## Evidence

Sin capturas de UI (ticket de schema/backend puro, sin componente visual). Evidencia = output de los scripts de verificación arriba, documentado en esta tabla.
