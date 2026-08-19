# Tasks checklist: TASK-22-company-bootstrap

- [x] Migración: función `bootstrap_company`
- [x] `companyService.ts` (`getCompanyMembership`, `bootstrapCompany`) + tests
- [x] `authService.signUp` + tests
- [x] `RegisterScreen` + `src/app/register.tsx` + tests
- [x] `CheckEmailScreen` + `src/app/check-email.tsx` + tests
- [x] `CompanyOnboardingScreen` + `src/app/onboarding.tsx` + tests
- [x] `useAuthDeepLinkRedirect`: manejar `type=signup`
- [x] `index.tsx`: gate de onboarding + test
- [x] Link "Crear cuenta" en `LoginScreen`
- [x] Verificado contra Supabase real: usuario confirmado vía Admin API → login real → bootstrap automático → filas reales en `companies`/`company_members` → AC#2 (duplicado rechazado) → limpieza
