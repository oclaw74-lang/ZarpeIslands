# Progress: B1. Login y recuperación de contraseña

**Ticket**: [#21](https://github.com/oclaw74-lang/ZarpeIslands/issues/21) — Epic B: [#20](https://github.com/oclaw74-lang/ZarpeIslands/issues/20)
**Branch**: `feature/21-login-password-recovery`

## Next Action

Ejecutar Step 6 (@architect: design.md).

## Decisions Made

- **Scope de routing**: B1 agrega un gate mínimo (¿hay sesión de Supabase? → Home, si no → Welcome) para poder cumplir AC#1. El routing completo por rol (5 roles, Home distinto por rol) es de B3 — acá el Home sigue siendo el placeholder único que ya existe.
- **Verificación end-to-end de login real**: dado el bug conocido de A4 (usuarios sembrados por SQL no pueden loguearse via GoTrue), para QA se crea un usuario de prueba usando la Admin API de Supabase (`service_role` key, provista por el usuario, usada solo vía curl local — nunca commiteada) en vez de INSERT directo — así se valida el flujo real de login sin heredar ese problema. El usuario de prueba (`b1-qa-test@zarpeislands.dev`) se borró al terminar de verificar.
- **Pantalla de bienvenida (pedido del usuario, no estaba en el ticket original)**: antes de mostrar el Login se agrega `WelcomeScreen` — patrón estándar de onboarding (un solo screen enfocado en valor, no un carrusel, según la investigación hecha para esta tarea) con fondo ilustrado, logo y "Get started". El gate de `index.tsx` redirige a `/welcome` en vez de `/login` directo cuando no hay sesión.
- **Identidad visual de Login/Forgot/Reset**: paleta fija de `agteamos/design/DESIGN_SYSTEM.md` (Deep Ocean / Sand White) en vez de `ThemedView` — son parte de la identidad de marca, no del tema claro/oscuro del sistema (mismo criterio que `WelcomeScreen`).
- **Bug encontrado y corregido en el propio flujo de reset**: `ResetPasswordScreen` inicialmente leía los tokens del deep link con `Linking.getInitialURL()` únicamente. Probado con un link de recovery REAL (generado vía Admin API `generate_link` + siguiendo el redirect con curl para extraer `access_token`/`refresh_token`, luego inyectado con `adb shell am start -a android.intent.action.VIEW`), el flujo fallaba con "link inválido" apenas la app ya estaba abierta — `getInitialURL()` solo sirve para arranque en frío; con la app corriendo, expo-router ya consume el evento `url` nativo para rutear ANTES de que la screen llegue a montarse y suscribirse. Fix: `useAuthDeepLinkRedirect` (hook nuevo, corre en `_layout.tsx` desde el arranque) escucha tanto `getInitialURL()` como el evento `url`, parsea los tokens y re-navega a `/reset-password` pasándolos como query params (`useLocalSearchParams`), no como fragmento. Re-testeado con un segundo link real de principio a fin — funcionó.
- **Hallazgo operativo (no bloquea el código, pendiente de configuración en el dashboard)**: al generar el link de recovery real, Supabase devolvió `redirect_to: http://localhost:3000` en vez de `zarpeislands://reset-password` — el proyecto no tiene ese esquema en su allowlist de "Redirect URLs" (Auth → URL Configuration). Sin agregarlo ahí, un email de recovery real ignorará nuestro `redirectTo` y no abrirá la app. Requiere acceso al dashboard o un personal access token (`sbp_...`) para el Management API — no se pudo resolver con la `service_role` key que se usó para QA. **Queda como pendiente explícito antes de que B1 funcione con emails reales fuera de este test manual.**

- **Rediseño visual completo de Welcome/Login/Forgot/Reset (pedido del usuario tras ver la v1)**: la primera versión de `LoginScreen` (fondo sólido Sand White, sin foto) le pareció "muy fea" al usuario. Se rediseñó con patrón glassmorphism (fondo con foto + `blurRadius`, overlay oscuro semitransparente, tarjeta translúcida con sombra) siguiendo la tendencia vigente confirmada por búsqueda web (frosted glass card sobre fondo con imagen, ver fuentes abajo). Assets nuevos provistos por el usuario (no generados por mí): `assets/images/zarpeisland-welcome-modern-mobile.png` (foto de yate/isla/atardecer para Welcome/Login/Forgot/Reset) y `assets/images/zarpeisland-app-icon-boat-island-exact.svg` (recortado a `assets/images/auth-badge.png`, usado como badge circular en las 4 pantallas). El resto de los SVG "exact" que pasó (logo con fondo claro/oscuro, monocromo, ícono "Z") no se usaron en este ticket — quedan disponibles en `assets/images/` para uso futuro.
- **Tipografía Sora**: instalado `@expo-google-fonts/sora`, cargada vía `useFonts` en `_layout.tsx` (gatea el render del `Stack` hasta que termina de cargar, junto al splash existente). `ThemedText` y las screens de auth usan `BrandFont` (`constants/theme.ts`) en vez de la fuente del sistema.
- **Bug de branding encontrado de paso**: `AnimatedSplashOverlay` (el splash animado que se ve después del splash nativo, antes de esta tarea) todavía mostraba el logo de Expo del template y el azul de Expo — se me había pasado en el PR de identidad de marca anterior. Corregido para usar `auth-badge.png` y la paleta navy/teal.

Fuentes consultadas para el patrón de diseño (glassmorphism sobre foto, tendencia 2025 vigente): [userguiding.com/blog/onboarding-screens](https://userguiding.com/blog/onboarding-screens), [designstudiouiux.com/blog/what-is-glassmorphism-ui-trend](https://www.designstudiouiux.com/blog/what-is-glassmorphism-ui-trend/), [uxpilot.ai/blogs/glassmorphism-ui](https://uxpilot.ai/blogs/glassmorphism-ui).

## Files Modified

- `src/features/auth/api/authService.ts` — `signIn`, `requestPasswordReset`, `updatePassword`, `hasActiveSession`, `parseRecoveryTokensFromUrl`, `setRecoverySession`.
- `src/features/auth/hooks/useAuthDeepLinkRedirect.ts` — captura el deep link de recovery (frío y caliente) y re-navega con los tokens como query params.
- `src/features/auth/screens/WelcomeScreen.tsx`, `LoginScreen.tsx`, `ForgotPasswordScreen.tsx`, `ResetPasswordScreen.tsx`.
- `src/app/welcome.tsx`, `login.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `index.tsx` (gate), `_layout.tsx` (hook de deep link).
- `src/lib/i18n/locales/{en,es}/auth.json` + registro en `src/lib/i18n/index.ts`.
- `assets/images/zarpeisland-welcome-modern-mobile.png`, `zarpeisland-welcome-modern-tablet.png`, `auth-badge.png` — assets provistos por el usuario para Welcome/Login/Forgot/Reset (ver "Decisions Made").
- `src/components/animated-icon.tsx` — splash animado corregido a la marca real (ya no Expo logo/azul).
- `src/constants/theme.ts`, `src/components/themed-text.tsx` — `BrandFont` (Sora) integrado en `ThemedText`.
- `package.json` — nueva dependencia `@expo-google-fonts/sora` (pedido explícito del usuario: "de tipografia usa sora").
- `assets/brand/hero-background.svg` (v1 del fondo, ya no usado en pantalla pero se deja como referencia de diseño — el resto de `assets/brand/*.svg` sigue en uso para el ícono de la app).
- `package.json` — `moduleNameMapper` de Jest ampliado con `^@/assets/(.*)$` (faltaba, rompía cualquier test que importe una imagen vía el alias).
- Tests: `authService.test.ts`, `useAuthDeepLinkRedirect.test.ts`, `LoginScreen.test.tsx`, `WelcomeScreen.test.tsx`, `ResetPasswordScreen.test.tsx`, `src/lib/i18n/__tests__/auth.test.ts`.

## Evidence

- `evidence/android-emulator-b1-1-welcome.png` — Welcome screen.
- `evidence/android-emulator-b1-2-login.png` — Login screen.
- `evidence/android-emulator-b1-3-invalid-credentials.png` — AC#2 real contra Supabase Auth (usuario inexistente), error genérico.
- `evidence/android-emulator-b1-4-forgot-password-form.png`, `-5-forgot-password-sent.png` — AC#3 (mitad 1), `resetPasswordForEmail` real, sin filtrar si el email existe.
- `evidence/android-emulator-b1-6-valid-login-home.png` — AC#1 completo, login real con usuario de prueba → Home.
- `evidence/android-emulator-b1-7-reset-password-form.png`, `-8-reset-password-success.png` — AC#3 (mitad 2), deep link real de Supabase → sesión de recovery → nueva contraseña. Verificado además a nivel de API que la contraseña nueva autentica.
- `npx jest`, `npx tsc --noEmit`, `npx eslint src --max-warnings=0` — 51/51 tests, sin errores, 1 warning preexistente no relacionado.
