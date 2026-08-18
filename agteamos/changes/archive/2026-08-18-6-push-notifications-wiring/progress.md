# Progress: A5. Wiring de push notifications

**Ticket**: [#6](https://github.com/oclaw74-lang/ZarpeIslands/issues/6) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/6-push-notifications-wiring`

## Next Action

Ejecutar Step 6 (@architect: design.md).

## Decisions Made

- **2026-08-18**: Investigado y confirmado — Android push (fuera de Expo Go) requiere un proyecto Firebase real + `google-services.json` sin importar el proveedor (Expo Push Service internamente sigue necesitando FCM con la identidad de la app registrada). No hay atajo.
- **2026-08-18**: Decisión del usuario: **diferir la creación del proyecto Firebase hasta Epic K** (notificaciones), que es cuando realmente se necesita enviar pushes reales de negocio (mantenimiento, solicitudes, turnos). No tiene sentido configurar Firebase ahora solo para probar "algo llega" sin contenido real que mandar.
- **Alcance ajustado de A5 (v1)**: se implementan AC#1 (permiso con contexto) y AC#2 (obtención de Expo push token, requiere solo un `projectId` de EAS — gratis, sin Firebase). **AC#3 (notificación de prueba real) queda explícitamente diferido a Epic K**, donde se crea el proyecto Firebase y se verifica end-to-end junto con el primer envío real.
- **2026-08-18 (corrección tras verificación en emulador real)**: al probar AC#2 en un build dev-client de Android, `getExpoPushTokenAsync` falla con *"Default FirebaseApp is not initialized... Did you configure googleServicesFile"* — es decir, **Android requiere Firebase inicializado nativamente incluso solo para mintear el token**, no solo para recibir un push real como se asumió en la decisión anterior. Se le presentó este hallazgo al usuario.
- **2026-08-18**: Decisión final del usuario: **AC#2 se verifica solo por código/tests unitarios** (mockeando `getExpoPushTokenAsync`), no end-to-end en el emulador. La verificación end-to-end real de AC#2 (token real emitido) y de AC#3 (push real recibido) quedan ambas diferidas a Epic K, junto con la creación del proyecto Firebase. El código de `PushNotificationsPanel` distingue este bloqueo esperado (`blocked-firebase`) de un error genérico, para que quede documentado en la UI de prueba que el permiso sí se concedió y que lo único pendiente es Firebase.

## Files Modified

- `app.json` — plugin `expo-notifications` agregado.
- `src/lib/notifications/pushToken.ts` — `registerForPushNotificationsAsync()`.
- `src/lib/notifications/__tests__/pushToken.test.ts` — 4 tests (happy path x2, denied, projectId faltante).
- `src/features/home/components/PushNotificationsPanel.tsx` — panel de prueba temporal, incluye estado `blocked-firebase`.
- `src/features/home/screens/HomeScreen.tsx` — integra el panel.

## Evidence

- `evidence/android-emulator-a5-1-context.png` — mensaje de contexto mostrado ANTES del prompt nativo (AC#1).
- `evidence/android-emulator-a5-3-prompt.png` — prompt nativo real de Android ("Allow Zarpe Islands to send you notifications?") tras tocar "Habilitar notificaciones" (AC#1 confirmado end-to-end).
- `evidence/android-emulator-a5-4-token.png` — tras conceder el permiso, error real de Firebase no configurado, mostrado en el estado `blocked-firebase` (documenta el límite conocido, no un bug).
- `npm test -- pushToken` — 4/4 tests verdes (AC#2 verificado por código, según decisión del usuario).
