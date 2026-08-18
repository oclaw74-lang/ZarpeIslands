# Requirements: TASK-13-postgres-push-pull

Fuente: issue [#13](https://github.com/oclaw74-lang/ZarpeIslands/issues/13).

## Historia de usuario

**Como** app móvil, **necesito** funciones RPC en Postgres que reciban cambios locales y devuelvan cambios remotos, **para** sincronizar WatermelonDB contra Supabase sin un servicio de terceros.

## Acceptance Criteria (RFC 2119)

1. `push_changes` DEBE insertar/actualizar/borrar correctamente en `punches` a partir de un payload de prueba.
2. `pull_changes` DEBE devolver solo filas del `company_member_id` del usuario autenticado, nunca de otro.
3. Un conflicto simulado (dos `device_timestamp` distintos para el mismo registro) DEBE resolverse con el más reciente, sin error.

## Fuera de alcance

- Sincronización de `tips`/`requests` (esas tablas no existen aún — Epic F1/G1). Este ticket solo cubre `punches`.
- Orquestación desde la app (llamar estas funciones vía `supabase.rpc(...)` y triggers de conectividad) — eso es A4c.
