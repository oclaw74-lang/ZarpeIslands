# Technical Design: TASK-6-push-notifications-wiring

## Approach

`expo-notifications` con handler de foreground básico. Pantalla de contexto ("por qué pedimos este permiso") ANTES del prompt nativo del sistema (AC#1) — patrón recomendado por Expo/Apple/Google para mejorar la tasa de aceptación. Obtención del Expo push token vía `getExpoPushTokenAsync({ projectId })`, usando el `projectId` de EAS ya vinculado (`app.json` → `extra.eas.projectId`).

Guardado del token: solo local (AsyncStorage, ya en el proyecto desde A2) + log — no hay tabla `notifications` ni `company_member_id` real todavía (Epic K1/B1). Se documenta explícitamente como placeholder.

## Files to Create

| File | Description |
|------|--------------|
| `src/lib/notifications/permissions.ts` | `ensureNotificationPermission()` — verifica permiso actual, si no fue pedido antes muestra contexto (vía callback) y luego solicita el permiso nativo |
| `src/lib/notifications/pushToken.ts` | `registerForPushNotificationsAsync()` — pide permiso, obtiene el Expo push token, lo guarda en AsyncStorage y lo loguea |
| `src/features/home/components/PushNotificationsPanel.tsx` | Panel de prueba temporal — botón "Habilitar notificaciones" con texto de contexto, muestra el token obtenido |
| `src/lib/notifications/__tests__/pushToken.test.ts` | Tests mockeando `expo-notifications` |

## Files to Modify

| File | What changes |
|------|--------------|
| `app.json` | + plugin `expo-notifications`; `extra.eas.projectId` (ya agregado por `eas init`) |
| `package.json` | + `expo-notifications` |
| `src/features/home/screens/HomeScreen.tsx` | Agrega `<PushNotificationsPanel />` |

## Flujo (AC#1 + AC#2)

1. Usuario toca "Habilitar notificaciones" → se muestra texto de contexto en pantalla (no el prompt nativo todavía).
2. Usuario confirma → recién ahí se llama a `Notifications.requestPermissionsAsync()` (dispara el prompt nativo del SO).
3. Si se concede: `getExpoPushTokenAsync({ projectId })` → token guardado en AsyncStorage bajo la key `expoPushToken` + logueado por consola.
4. Si se deniega: se muestra mensaje claro, sin loop de reintento agresivo.

## Database Changes

Ninguno.

## API Changes

Ninguno.

## Environment Variables

Ninguna nueva — `projectId` vive en `app.json`, no en `.env`.

## Security Considerations

- El Expo push token no es secreto (se usa para *recibir*, no para autenticar), pero no debe loguearse en producción — el log es temporal para esta etapa de wiring, se retira en Epic K cuando el token se envíe al backend real.
