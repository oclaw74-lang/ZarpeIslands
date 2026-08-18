# Requirements: TASK-6-push-notifications-wiring

Fuente: issue [#6](https://github.com/oclaw74-lang/ZarpeIslands/issues/6).

## Historia de usuario

**Como** usuario de cualquier rol, **necesito** que la app pueda pedir permiso y registrar mi dispositivo para notificaciones push, **para** recibir avisos de mantenimiento, solicitudes y turnos (Epic K construye sobre esto).

## Acceptance Criteria (RFC 2119)

1. La app DEBE solicitar permiso de notificaciones con un mensaje de contexto antes del prompt nativo.
2. DEBE obtenerse un Expo push token válido y loguearse/guardarse localmente para verificación manual en esta etapa.
3. ~~Una notificación de prueba enviada vía Expo push tool DEBE llegar al dispositivo.~~ **Diferido a Epic K** — requiere proyecto Firebase real (ver `progress.md`, Decisions Made).

## Fuera de alcance

- Envío/recepción real de notificaciones (AC#3, Epic K).
- Tabla `notifications` y guardado del token asociado a `company_member_id` en backend (Epic K1 — acá el guardado es solo local/log, dado que `company_members` recién existe mínimamente desde A4a y no hay login real todavía, Epic B1).
