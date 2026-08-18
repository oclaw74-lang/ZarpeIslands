# Technical Design: TASK-21-login-password-recovery

## Approach

Usar Supabase Auth directamente desde el cliente (ya configurado en A2, con
`persistSession: true` sobre AsyncStorage — la persistencia de sesión entre
reinicios ya viene gratis del SDK, B3 construye el routing por rol sobre esta
base, no la reimplementa).

Se agrega un **gate mínimo** en `src/app/index.tsx`: si hay sesión activa se
renderiza el `HomeScreen` que ya existe (placeholder único); si no, se
redirige a `/login`. El routing diferenciado por rol (5 roles → 5 Home
distintos) es explícitamente de B3 — acá no se crea infraestructura de roles.

Tres pantallas nuevas en `src/features/auth/`:
- `LoginScreen` — email + password, botón "olvidé mi contraseña".
- `ForgotPasswordScreen` — pide email, dispara `resetPasswordForEmail`.
- `ResetPasswordScreen` — recibe el deep link (`zarpeislands://reset-password#access_token=...&refresh_token=...&type=recovery`), fija la sesión con esos tokens y pide la nueva contraseña.

Todas las llamadas a Supabase Auth se centralizan en
`src/features/auth/api/authService.ts` (no se llama a `supabase.auth.*`
directo desde las screens) para poder testear la lógica sin mockear
componentes de UI.

## Files to Create

| File | Description |
|------|--------------|
| `src/features/auth/api/authService.ts` | `signIn`, `requestPasswordReset`, `updatePassword`, `getSession`, `parseAuthTokensFromUrl` (parseo del deep link de recovery) |
| `src/features/auth/api/__tests__/authService.test.ts` | Unit tests de las 4 funciones anteriores (mock de `@supabase/supabase-js`) |
| `src/features/auth/screens/LoginScreen.tsx` | Formulario de login |
| `src/features/auth/screens/ForgotPasswordScreen.tsx` | Formulario de solicitud de reset |
| `src/features/auth/screens/ResetPasswordScreen.tsx` | Formulario de nueva contraseña, consume el deep link |
| `src/features/auth/screens/__tests__/LoginScreen.test.tsx` | Happy path, error genérico, link a forgot-password |
| `src/app/login.tsx` | Ruta delgada → `LoginScreen` |
| `src/app/forgot-password.tsx` | Ruta delgada → `ForgotPasswordScreen` |
| `src/app/reset-password.tsx` | Ruta delgada → `ResetPasswordScreen` |
| `src/lib/i18n/locales/en/auth.json`, `.../es/auth.json` | Namespace `auth` nuevo (login, forgot-password, reset-password, errores) |

## Files to Modify

| File | What changes |
|------|--------------|
| `src/app/index.tsx` | Pasa de renderizar `HomeScreen` directo a un gate: `getSession()` → sesión activa renderiza `HomeScreen`, si no `<Redirect href="/login" />` |
| `src/lib/i18n/index.ts` | Registra el namespace `auth` en `resources` |
| `app.json` | Sin cambios — `scheme: "zarpeislands"` ya existe (usado por el deep link de recovery) |

## Database Changes

Ninguno — `auth.users` es manejado enteramente por Supabase Auth, no hay
tabla propia todavía (eso llega en B2 con `company_members`).

## API Changes

Ninguno propio — se consume la API de Supabase Auth (`signInWithPassword`,
`resetPasswordForEmail`, `setSession`, `updateUser`, `getSession`) vía el SDK
ya inicializado en A2.

## Environment Variables

Ninguna nueva.

## Security Considerations (STRIDE)

- **Spoofing**: la identidad la valida GoTrue (Supabase Auth) server-side; la
  app nunca implementa su propia verificación de contraseña.
- **Tampering**: los tokens de recovery viajan en el link del email (HTTPS
  hasta el deep link) y se validan server-side al llamar `setSession` —
  un token alterado simplemente falla ahí, no se confía en el contenido del
  link sin esa validación.
- **Repudiation**: fuera de alcance de este ticket (logs de Auth los maneja
  Supabase).
- **Information Disclosure (AC#2)**: el mensaje de error de credenciales
  inválidas es el genérico que ya devuelve GoTrue ("Invalid login
  credentials") traducido vía i18n — la app no hace una consulta adicional
  para distinguir "no existe el usuario" de "contraseña incorrecta".
- **Denial of Service**: rate limiting de intentos de login lo aplica
  Supabase Auth del lado del servidor (no se implementa uno propio en este
  ticket).
- **Elevation of Privilege**: no aplica todavía — no hay roles en este
  ticket (B3/B5).

## Addendum (post-implementación)

Dos cambios respecto al diseño original, ambos detallados con su motivo completo en `progress.md` → "Decisions Made":

1. **`WelcomeScreen` nueva** (`src/features/auth/screens/WelcomeScreen.tsx` + `src/app/welcome.tsx`) — pedido explícito del usuario tras ver el primer diseño de Login, fuera del alcance original del ticket. El gate de `index.tsx` redirige acá en vez de a `/login` directo.
2. **`useAuthDeepLinkRedirect`** (`src/features/auth/hooks/useAuthDeepLinkRedirect.ts`) — el diseño original asumía que `ResetPasswordScreen` podía leer los tokens del deep link directo con `Linking.getInitialURL()`. Probado con un link de recovery real, eso solo funciona en arranque en frío; con la app ya abierta, expo-router consume el evento `url` nativo antes de que la screen se monte. El parseo se movió a este hook, que corre desde `_layout.tsx` (montado desde el inicio) y re-navega con los tokens como query params en vez de dejarlos en el fragmento.

## Verificación planeada (Step 8)

El bug conocido de A4 (usuarios sembrados por `INSERT` directo en `auth.users`
no pueden loguearse via GoTrue — password hash correcto pero login rechazado)
significa que **no se puede sembrar el usuario de prueba por SQL**. Para
probar el login real end-to-end se crea un usuario de prueba con la Admin API
de Supabase (`service_role` key, script local en `scripts/`, no forma parte
del código de la app ni se commitea con el secret) — eso pasa por el mismo
código de GoTrue que usaría un signup real, evitando el bug conocido.
