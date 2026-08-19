# Requirements: TASK-12-schema-companies-punches

Fuente: issue [#12](https://github.com/oclaw74-lang/ZarpeIslands/issues/12).

## Historia de usuario

**Como** sistema, **necesito** las tablas mínimas de `companies`, `company_members` y `punches`, **para** tener algo real contra lo cual probar el mecanismo de sync offline-first (A4b/A4c).

## Acceptance Criteria (RFC 2119)

1. La migración aplicada (`supabase db push`) DEBE crear las 3 tablas con sus columnas y FKs.
2. RLS DEBE estar activa: un usuario solo puede leer/escribir filas de `punches` donde `company_member_id` le pertenece.
3. DEBE poder insertarse una fila de prueba en cada tabla desde el SQL editor de Supabase respetando las FKs.

## Fuera de alcance

- Modelo completo de `company_members` (con `job_position_id`, `fixed_boat_id`, etc. — Epic B/C/E).
- `boat_assignments` real (Epic E) — `punches.boat_assignment_id` queda nullable sin FK por ahora.
- Matriz de roles completa y segregación de funciones (Epic B5) — acá solo lo mínimo para que RLS no deje un hueco de seguridad evidente.
