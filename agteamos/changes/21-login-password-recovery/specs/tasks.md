# Tasks checklist: TASK-21-login-password-recovery

- [x] `src/features/auth/api/authService.ts` + tests
- [x] i18n namespace `auth` (en/es) + registro en `src/lib/i18n/index.ts`
- [x] `WelcomeScreen` + `src/app/welcome.tsx` + tests (pedido del usuario, fuera del ticket original)
- [x] `LoginScreen` + `src/app/login.tsx` + tests
- [x] `ForgotPasswordScreen` + `src/app/forgot-password.tsx`
- [x] `ResetPasswordScreen` + `src/app/reset-password.tsx` + tests
- [x] `useAuthDeepLinkRedirect` (fix del bug de deep link en caliente) + tests
- [x] Gate de sesión en `src/app/index.tsx` (→ `/welcome` si no hay sesión)
- [x] Usuario de prueba vía Admin API (creado, usado, borrado — no commiteado)
- [x] Verificar en emulador con Supabase real: AC#1 (login válido → Home), AC#2 (login inválido → error genérico), AC#3 completo (forgot password → link real de recovery → nueva contraseña → verificado que autentica)
- [x] `npx jest` / `npx tsc --noEmit` / `npx eslint` sin errores

## Pendiente fuera de este ticket

- [ ] Agregar `zarpeislands://reset-password` a la allowlist de "Redirect URLs" en Auth → URL Configuration del dashboard de Supabase (hallazgo de QA — sin esto, el email de recovery real no abre la app). Requiere acceso al dashboard o un personal access token del Management API.
