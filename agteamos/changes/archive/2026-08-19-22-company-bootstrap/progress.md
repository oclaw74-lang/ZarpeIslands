# Progress: B2. Bootstrap de empresa

**Ticket**: [#22](https://github.com/oclaw74-lang/ZarpeIslands/issues/22) — Epic B: [#20](https://github.com/oclaw74-lang/ZarpeIslands/issues/20)
**Branch**: `feature/22-company-bootstrap`

## Decisions Made

- **`mailer_autoconfirm: false` confirmado en el proyecto real** (`GET /auth/v1/settings`) — `signUp()` no da sesión de inmediato. Diseño: `RegisterScreen` → `CheckEmailScreen` si no hay sesión (caso real) → confirmación por deep link (`type=signup`, mismo mecanismo que el recovery de B1) → `/onboarding` (bootstrap automático usando `user_metadata.pending_company_name`).
- **Función `bootstrap_company` (`SECURITY DEFINER`)** en vez de políticas RLS de INSERT abiertas — un solo body `plpgsql` es una transacción atómica (AC#1), y la RLS completa de `companies`/`company_members` es explícitamente B5.
- **Hallazgo de testing real, no un bug**: Supabase rechaza `signUp()` con dominios como `.dev` o `example.com` (`email_address_invalid`) — confirmado con curl directo contra la API real. `gmail.com` sí es válido (llegó a `over_email_send_rate_limit` por la cantidad de tests de email de esta sesión). El Admin API (`service_role`) no aplica esta validación, así que se usó para crear un usuario confirmado y probar el bootstrap automático de punta a punta.
- **`getCompanyMembership()` distingue `null` (sin config/sesión) de `undefined` (con sesión, sin empresa)** — el gate de `index.tsx` solo redirige a `/onboarding` en el segundo caso.

## Verificación (contra Supabase real, no solo mocks)

1. Usuario de prueba creado vía Admin API con `email_confirm: true` y `user_metadata.pending_company_name` (simula el estado post-confirmación de un registro real).
2. Login real en el emulador con ese usuario → gate de `index.tsx` detectó "sin empresa" → `/onboarding` → bootstrap automático → Home. Confirmado con filas reales en `companies` y `company_members` (consultadas con `service_role`, no solo la UI).
3. AC#2 (no duplicar membresía): segundo intento de `bootstrap_company` para el mismo usuario autenticado → rechazado con `"user already belongs to a company"`.
4. Limpieza: usuario de prueba borrado (cascada limpió `company_members` sola, confirmado con un `SELECT` posterior), fila de `companies` borrada aparte.
5. `RegisterScreen` con dominio inválido (`.dev`) mostró el estado de error genérico correctamente (aunque el motivo real de esa verificación puntual fue un error de dominio de prueba, no del código) — capturado como evidencia de que el manejo de errores funciona con una respuesta real de Supabase, no un mock.

## Pendiente fuera de este ticket

- No se pudo verificar en vivo el camino completo `RegisterScreen → CheckEmailScreen` con un dominio de email real (rate limit de envío de emails del proyecto, acumulado por el testing de esta sesión). El código está cubierto por tests unitarios (`RegisterScreen.test.tsx`) que verifican la navegación a `/check-email` cuando `signUp` devuelve `sessionActive: false` — el comportamiento real ya se confirmó indirectamente al ver que Supabase acepta `gmail.com` y solo el rate limit lo bloqueó.

## Files Modified

- `supabase/migrations/20260818233244_bootstrap_company_function.sql` — función `bootstrap_company`.
- `src/features/company/api/companyService.ts` + tests — `getCompanyMembership`, `bootstrapCompany`.
- `src/features/company/screens/CompanyOnboardingScreen.tsx` + tests.
- `src/features/auth/api/authService.ts` — `signUp`.
- `src/features/auth/screens/RegisterScreen.tsx`, `CheckEmailScreen.tsx` + tests.
- `src/features/auth/hooks/useAuthDeepLinkRedirect.ts` — maneja `type=signup` además de `type=recovery`.
- `src/app/index.tsx` — gate extendido con chequeo de `company_members`.
- `src/app/register.tsx`, `check-email.tsx`, `onboarding.tsx`.
- `src/features/auth/screens/LoginScreen.tsx` — link "Crear cuenta".
- `src/lib/i18n/locales/{en,es}/auth.json` (namespace `register`/`checkEmail`), nuevo namespace `company.json`.
- `src/features/home/__tests__/rootGate.test.tsx` — test del gate (movido fuera de `src/app/` para no registrarse como ruta fantasma de expo-router).

## Evidence

- `evidence/android-emulator-b2-1-register-screen.png`
- `evidence/android-emulator-b2-2-invalid-domain-error.png` — error real de Supabase, manejado con gracia.
- `evidence/android-emulator-b2-3-login-to-home-after-bootstrap.png` — login real → bootstrap automático → Home (confirmado con filas reales en DB).
- `npx jest` (77 tests), `npx tsc --noEmit`, `npx eslint` — todos verdes.
