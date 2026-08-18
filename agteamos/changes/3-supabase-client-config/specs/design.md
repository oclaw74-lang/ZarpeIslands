# Technical Design: TASK-3-supabase-client-config

## Approach

Cliente Supabase estándar para React Native/Expo (`@supabase/supabase-js` + `@react-native-async-storage/async-storage` como adaptador de persistencia de sesión, patrón oficial documentado por Supabase para Expo). Validación de entorno tipada y explícita: en vez de dejar que `createClient` falle con un error de red críptico si falta una env var, un módulo de config valida al importar y expone un estado claro (`ok` / `error`) que la UI puede mostrar como pantalla amigable en vez de un crash.

Vive en `src/lib/supabase/` (ver convención de `src/README.md` — `lib/` es para clientes de servicios).

Fuentes: [Supabase Auth quickstart for React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native), [Using Supabase - Expo Docs](https://docs.expo.dev/guides/using-supabase/).

## Files to Create

| File | Description |
|------|--------------|
| `src/lib/supabase/env.ts` | Lee y valida `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`; expone `getSupabaseEnv()` (retorna `{ ok: true, url, anonKey }` o `{ ok: false, missing: string[] }` — nunca lanza, para que la UI decida qué mostrar) |
| `src/lib/supabase/client.ts` | Crea y exporta `supabase` (instancia de `SupabaseClient`) solo si `getSupabaseEnv().ok`; si falta config, exporta `null` y el error se maneja en la UI, no en este módulo |
| `src/features/home/screens/MissingConfigScreen.tsx` | Pantalla clara ("Falta configuración: EXPO_PUBLIC_SUPABASE_URL") en vez de que la app crashee o quede en blanco |
| `src/lib/supabase/__tests__/env.test.ts` | Tests del validador de env |
| `src/lib/supabase/__tests__/client.test.ts` | Tests de creación del cliente (mockeando `createClient`) |

## Files to Modify

| File | What changes |
|------|--------------|
| `src/app/_layout.tsx` | Si `getSupabaseEnv().ok` es `false`, renderiza `MissingConfigScreen` en vez del `Stack` normal |
| `package.json` | Nuevas dependencias: `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill` |
| `.env.example` | Sin cambios de contenido (ya tiene las claves) — se confirma que sigue siendo la única referencia versionada |

## Database Changes

Ninguno (no se crean tablas en este ticket).

## API Changes

Ninguno (no hay endpoints propios — se usa la API de Supabase directamente).

## Environment Variables

Ya declaradas en `.env.example` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). El valor real vive en `.env` local (gitignored), con el proyecto Supabase de desarrollo real provisto por el usuario.

## Security Considerations

- La `anon key` de Supabase es pública por diseño (protegida por RLS en Postgres, no es un secreto) — es seguro que viva en el bundle de la app, a diferencia de una `service_role key` (que nunca debe usarse en la app móvil).
- La persistencia de sesión vía `AsyncStorage` es el patrón oficial documentado por Supabase para Expo. Dado que este proyecto maneja datos sensibles multi-tenant (`documents/05`), se deja registrado como candidato a revisión en Epic B (B1 Login): evaluar `expo-secure-store` para el token de sesión si el tamaño del payload lo permite (límite ~2KB en Keychain/Keystore) — fuera de alcance de este ticket, que solo configura el cliente base.
