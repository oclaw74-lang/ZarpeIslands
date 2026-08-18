# Requirements: TASK-14-watermelondb-client

Fuente: issue [#14](https://github.com/oclaw74-lang/ZarpeIslands/issues/14).

## Historia de usuario

**Como** personal de barco, **necesito** que la app escriba localmente y sincronice al recuperar señal, **para** ponchar/registrar propinas sin depender de tener conexión.

## Acceptance Criteria (RFC 2119)

1. Con el dispositivo en modo avión, una escritura de prueba a `punches` (WatermelonDB local) DEBE guardarse y ser legible localmente de inmediato.
2. Al recuperar conexión, la escritura pendiente DEBE sincronizarse a Supabase (`punches` real) automáticamente, sin acción manual del usuario.
3. Las reglas de sync DEBEN estar limitadas por `company_member_id` — un usuario no descarga localmente datos de otro compañero.

## Fuera de alcance

- UI real de ponche (botón grande in/out) — Epic D2.
- Login/sesión real de usuario — Epic B. Para esta verificación se usa una sesión de prueba.
