# Progress: B7. Login con Google (OAuth)

**Ticket**: [#33](https://github.com/oclaw74-lang/ZarpeIslands/issues/33) — Epic B: [#20](https://github.com/oclaw74-lang/ZarpeIslands/issues/20)
**Branch**: `feature/33-google-oauth-login`
**schema: lite** — ticket chico, un solo dominio (frontend/auth), sin cambios de schema.

## Resumen

`signInWithGoogle()` nuevo en `authService.ts`: pide a Supabase la URL de
autorización (`signInWithOAuth` con `skipBrowserRedirect: true`), la abre con
`expo-web-browser` (`openAuthSessionAsync`), y al volver parsea los tokens de
la URL de callback con el mismo parser que ya existía para el reset de
contraseña de B1. Botón "Continuar con Google" agregado a `LoginScreen` con
un divisor "or/o".

**Bug de carrera evitado**: el listener global de deep links (`useAuthDeepLinkRedirect`,
de B1) parseaba CUALQUIER URL con `access_token`/`refresh_token`, incluida la
de retorno de este flujo de Google — que además ya la maneja
`openAuthSessionAsync` en el mismo lugar donde se dispara. Sin filtrar, ambos
código procesarían la misma URL y competirían por decidir a dónde navegar
(Home vs. `/reset-password`). Se agregó un chequeo de `type=recovery` en el
listener global para que ignore cualquier URL que no sea explícitamente de
recovery.

## Verificación

- Tests unitarios: happy path (URL de auth → sesión establecida), cancelado
  (AC#3, no debe mostrar error), error de Supabase (sin URL de auth).
- Test nuevo en `useAuthDeepLinkRedirect` que confirma que una URL de
  callback de Google (con tokens pero sin `type=recovery`) NO dispara el
  redirect a `/reset-password`.
- **Verificado en emulador contra Supabase real** (no solo mocks): tocar
  "Continuar con Google" abre un Custom Tab real apuntando al proyecto de
  Supabase, que responde `{"error":"...provider is not enabled"}` — confirma
  que el código llama correctamente a la API real. Cerrar el tab devuelve a
  Login sin mostrar un error falso (AC#3).
- **No se pudo verificar el happy path completo** (login real con una cuenta
  de Google) porque el provider de Google todavía no está habilitado en el
  proyecto de Supabase — requiere que el usuario cree un OAuth Client en
  Google Cloud Console y lo cargue en Auth → Providers → Google del
  dashboard. Documentado como pendiente explícito, mismo patrón que Firebase
  en A5.

## Files Modified

- `src/features/auth/api/authService.ts` — `signInWithGoogle`.
- `src/features/auth/api/__tests__/authService.test.ts` — 3 tests nuevos.
- `src/features/auth/hooks/useAuthDeepLinkRedirect.ts` — filtro `type=recovery` (fix de la carrera).
- `src/features/auth/hooks/__tests__/useAuthDeepLinkRedirect.test.ts` — test nuevo.
- `src/features/auth/screens/LoginScreen.tsx` — botón + divisor.
- `src/features/auth/screens/__tests__/LoginScreen.test.tsx` — 3 tests nuevos.
- `src/lib/i18n/locales/{en,es}/auth.json` — `orDivider`, `continueWithGoogle`, `googleCancelled`.

## Evidence

- `evidence/android-emulator-b7-1-login-with-google-button.png`
- `evidence/android-emulator-b7-2-real-supabase-oauth-call.png` — respuesta real "provider is not enabled".
- `evidence/android-emulator-b7-3-graceful-return-no-false-error.png`
- `npx jest` / `npx tsc --noEmit` / `npx eslint` — sin errores.

## Pendiente fuera de este ticket

Habilitar el provider de Google en Supabase (Auth → Providers → Google) con
un OAuth Client de Google Cloud Console — acción manual del usuario en dos
dashboards externos, no se puede hacer desde acá.
