# Technical Design: TASK-14-watermelondb-client

## Approach

`@nozbe/watermelondb` con adapter SQLite, configurado en Expo vía config plugin de comunidad (`@lovesworking/watermelondb-expo-plugin-sdk-52-plus` + `expo-build-properties`). Un solo modelo `Punch` por ahora (única tabla sincronizada hasta que Epic F/G agreguen `tips`/`requests`). El `synchronize()` de WatermelonDB llama a `pull_changes`/`push_changes` (A4b) vía `supabase.rpc(...)`. Trigger de sync: al recuperar conectividad (`@react-native-community/netinfo`) + botón manual de prueba (hasta que Epic D2 tenga la UI real de ponche).

**Riesgo conocido**: WatermelonDB no confirma soporte explícito para Expo SDK 57/New Architecture — se valida con un build real antes de dar el ticket por bueno (ver `progress.md`).

## Files to Create

| File | Description |
|------|--------------|
| `src/lib/watermelon/schema.ts` | `appSchema` — tabla `punches` local, columnas espejo de Postgres (menos `id`, que WatermelonDB maneja aparte) |
| `src/lib/watermelon/models/Punch.ts` | Modelo WatermelonDB |
| `src/lib/watermelon/database.ts` | Instancia de `Database` con `SQLiteAdapter` |
| `src/lib/watermelon/sync.ts` | `synchronizeApp()` — envuelve `synchronize()` de WatermelonDB, llamando `pull_changes`/`push_changes` vía `supabase.rpc` |
| `src/lib/watermelon/useAutoSync.ts` | Hook: escucha `NetInfo`, dispara `synchronizeApp()` al recuperar conexión |
| `src/features/home/components/SyncTestPanel.tsx` | Panel de prueba temporal (crear punch local, ver estado, sincronizar manual) — placeholder hasta Epic D2 |
| `src/lib/watermelon/__tests__/sync.test.ts` | Tests de `synchronizeApp` (mockeando `supabase.rpc` y WatermelonDB) |

## Files to Modify

| File | What changes |
|------|--------------|
| `app.json` | + plugin `@lovesworking/watermelondb-expo-plugin-sdk-52-plus`, `expo-build-properties` |
| `package.json` | + `@nozbe/watermelondb`, plugin de Expo, `expo-build-properties`, `@react-native-community/netinfo` |
| `src/features/home/screens/HomeScreen.tsx` | Agrega `<SyncTestPanel />` |

## Database Changes

Ninguno (ya cubierto en A4a/A4b).

## Verificación planeada (orden)

1. Instalar dependencias + plugin, correr `expo prebuild --clean` + `expo run:android` — **primer punto de falla posible**, si no compila se reevalúa el enfoque con el usuario.
2. Si compila: probar AC#1 (modo avión, escritura local).
3. Probar AC#2 (reconectar, sync automático).
4. Probar AC#3 (aislamiento heredado de A4b, confirmado end-to-end con 2 sesiones).

## Security Considerations

- La sesión de Supabase (JWT) usada por `supabase.rpc(...)` en el sync ya trae el `auth.uid()` correcto — ninguna lógica nueva de autorización acá, se apoya en A4b.
