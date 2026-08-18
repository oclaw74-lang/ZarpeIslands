# Requirements: TASK-2-init-expo-typescript

Fuente: issue [#2](https://github.com/oclaw74-lang/ZarpeIslands/issues/2), `agteamos/product/backlog-detail.md` (A1).

## Historia de usuario

**Como** equipo de desarrollo, **necesito** un proyecto Expo con TypeScript, linting y estructura de carpetas definida, **para** tener una base consistente donde construir cada feature.

## Acceptance Criteria (RFC 2119)

1. El proyecto DEBE correr `npm run lint`, `npm test` y `npx tsc --noEmit` sin errores sobre el scaffold vacío.
2. La app DEBE arrancar en un emulador/dispositivo Android vía Expo Go o dev build sin errores en consola.
3. La estructura de carpetas DEBE documentarse en un `README.md` corto dentro de `src/`.
4. El job de CI (`.github/workflows/ci.yml`) DEBE pasar a ejecutar lint/test reales en vez de saltarse por falta de `package.json`.

## Fuera de alcance

- Cliente Supabase (A2), i18n (A3), PowerSync (A4), push notifications (A5) — scaffolds separados que dependen de este.
- Pantallas reales de negocio (Auth, Home por rol, etc.) — empiezan en Epic B.
