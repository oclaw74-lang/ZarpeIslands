# Technical Design: TASK-22-company-bootstrap

## Approach

`companies`/`company_members` ya existen (A4a) con RLS de solo lectura de la
fila propia — falta la capacidad de crear la primera. La creación se hace con
una función Postgres `bootstrap_company` (`SECURITY DEFINER`, mismo patrón
que `current_company_member_id()`): un solo `plpgsql` body es una sola
transacción — si el insert de `company_members` falla, el de `companies` se
revierte solo, sin necesitar una transacción explícita del lado del cliente.

**Descubrimiento que cambia el flujo**: `mailer_autoconfirm: false` en el
proyecto real (verificado vía `GET /auth/v1/settings`) — `signUp()` no
entrega sesión hasta que el usuario confirma el email. El bootstrap NO puede
ir pegado al submit del formulario de registro. Diseño:

1. `RegisterScreen` — email, password, nombre de la empresa. Llama a
   `supabase.auth.signUp()` guardando `company_name` en
   `options.data` (`user_metadata`) — sobrevive al hueco sin sesión entre el
   registro y la confirmación, sin tabla temporal propia.
2. Sin sesión todavía → `CheckEmailScreen` ("confirmá tu email").
3. El link de confirmación de Supabase entrega tokens con `type=signup` en el
   fragmento — mismo mecanismo de deep link que el recovery de B1.
   `useAuthDeepLinkRedirect` se extiende: `type=signup` (o cualquier tipo que
   no sea `recovery`) → establece la sesión y redirige a `/` (no a
   `/reset-password`).
4. El gate de `index.tsx` (B1) se extiende: con sesión, antes de mostrar Home,
   chequea si el usuario ya tiene fila en `company_members`
   (`getCompanyMembership()`). Si no la tiene → `/onboarding`
   (`CompanyOnboardingScreen`), que lee `company_name` de
   `user.user_metadata` y llama a `bootstrap_company()`. Si por algún motivo
   no hay `company_name` en metadata (usuario que llegó por otro camino,
   ej. Google OAuth sin pasar por registro), pide el nombre en un form
   simple antes de llamar a la función.

## Files to Create

| File | Description |
|------|--------------|
| `supabase/migrations/<ts>_bootstrap_company_function.sql` | Función `bootstrap_company`, `grant execute` |
| `src/features/company/api/companyService.ts` | `getCompanyMembership()`, `bootstrapCompany()` |
| `src/features/company/api/__tests__/companyService.test.ts` | Tests |
| `src/features/auth/screens/RegisterScreen.tsx` | Formulario de registro |
| `src/features/auth/screens/CheckEmailScreen.tsx` | Pantalla "confirmá tu email" |
| `src/features/company/screens/CompanyOnboardingScreen.tsx` | Bootstrap automático o manual |
| `src/app/register.tsx`, `check-email.tsx`, `onboarding.tsx` | Rutas delgadas |
| Tests de las screens nuevas | Happy path + error + edge |

## Files to Modify

| File | What changes |
|------|--------------|
| `src/features/auth/api/authService.ts` | `signUp(email, password, companyName)` |
| `src/features/auth/hooks/useAuthDeepLinkRedirect.ts` | Maneja `type=signup` además de `type=recovery` |
| `src/app/index.tsx` | Gate: sesión + sin `company_members` → `/onboarding` |
| `src/features/auth/screens/LoginScreen.tsx` | Link "Crear cuenta" → `/register` |
| `src/lib/i18n/locales/{en,es}/auth.json`, nuevo namespace `company` | Strings nuevos |

## Database Changes

Nueva función `bootstrap_company(p_name, p_full_name, p_country, p_default_currency, p_default_language, p_timezone)` — ver migración. No se tocan columnas existentes.

## Security Considerations (STRIDE)

- **Elevation of Privilege**: `bootstrap_company` verifica explícitamente que
  el usuario NO tenga ya una fila en `company_members` antes de crear una
  empresa nueva — evita que alguien spamee empresas fantasma para sí mismo
  repetidamente, y evita que un usuario ya perteneciente a una empresa se
  auto-asigne como owner de otra sin querer.
- **Information Disclosure**: la función no expone datos de otras empresas;
  `SECURITY DEFINER` se usa solo para el insert atómico, no para lectura
  arbitraria.
- RLS completa de `companies`/`company_members` (todos los roles, alcance por
  `boat_supervisors`, etc.) es explícitamente B5 — acá solo lo mínimo para
  que el bootstrap funcione.
