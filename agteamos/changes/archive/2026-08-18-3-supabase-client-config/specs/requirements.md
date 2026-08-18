# Requirements: TASK-3-supabase-client-config

Fuente: issue [#3](https://github.com/oclaw74-lang/ZarpeIslands/issues/3), `agteamos/product/backlog-detail.md` (A2).

## Historia de usuario

**Como** desarrollador, **necesito** un cliente Supabase configurado y variables de entorno tipadas, **para** que cualquier feature pueda leer/escribir a Postgres/Auth/Storage sin repetir configuración.

## Acceptance Criteria (RFC 2119)

1. `supabase.auth`, `supabase.from(...)` y `supabase.storage` DEBEN funcionar contra el proyecto Supabase real de desarrollo (`whirvyqwwvawzbnvlsbf.supabase.co`).
2. Si falta una variable de entorno requerida, la app DEBE mostrar un error claro al arrancar (no un crash silencioso ni un error críptico de red).
3. `.env` DEBE estar en `.gitignore`; `.env.example` queda como única referencia versionada (sin valores reales).

## Fuera de alcance

- Login/registro de usuarios (Epic B).
- Esquema de tablas en Postgres (Epic B en adelante crea `companies`, `company_members`, etc. — este ticket no crea tablas).
- PowerSync (A4).
