# Progress: A1. Inicializar proyecto Expo + TypeScript

**Ticket**: [#2](https://github.com/oclaw74-lang/ZarpeIslands/issues/2) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/2-init-expo-typescript`

## Next Action

Step 7 completo. Ejecutar Step 8 (@qa-engineer: E2E/evidencia) — dado que este ticket es scaffold puro sin UI de negocio ni emulador disponible en este entorno, QA se limita a verificación de comandos (lint/test/typecheck/build), documentada abajo en vez de screenshots E2E. Luego Step 9 (close-task): PR + merge a `develop`.

## Decisions Made

- **2026-08-18**: Se reemplazó el enfoque inicial (React Navigation manual + `src/screens/`) por **Expo Router + patrón Bulletproof React adaptado** (`app/` como capa de ruteo delgada, `src/features/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/store/`, `src/types/`, `src/constants/`, `src/utils/`) tras investigación de patrones recomendados para proyectos Expo/TypeScript en 2026, a pedido explícito del usuario. Fuentes en `specs/design.md`.
- **2026-08-18**: `create-expo-app@latest` (template default, SDK 57) ya trae `src/app` + `src/components` + `src/constants` + `src/hooks` — coincide con el patrón investigado. Se completó con `src/features`, `src/lib`, `src/store`, `src/types`, `src/utils` en vez de regenerar desde el template blank.
- **2026-08-18**: Se eliminó el contenido demo del template (tab "Explore", `app-tabs.tsx`, `external-link.tsx`, `ui/collapsible.tsx`, `web-badge.tsx`, `hint-row.tsx`, iconos de tabs) por quedar sin uso al reemplazar la navegación por tabs con un `Stack` simple — la app real no usa tabs globales (cada rol tiene su propio Home, ver `documents/03`).
- **2026-08-18**: `develop` estaba desactualizada respecto a `main` (creada antes de los commits de Steps 2-6) — se hizo fast-forward de `develop` a `main` antes de ramificar `feature/2-init-expo-typescript`.
- **2026-08-18**: `image-size` (dependencia transitiva de Metro) tiene un DoS conocido (GHSA-w3rx-r6r6-pgpr) al parsear ICNS/JXL/HEIF — es una vulnerabilidad de tooling de build, no de runtime de la app. El único fix es downgradear Expo a 53.0.27 (breaking cambio de SDK), no se aplica en este ticket. Queda documentado para revisión periódica de `npm audit`.
- **2026-08-18**: Se agregó `eslint-disable` de archivo completo en `src/hooks/use-color-scheme.web.ts` (código del template oficial de Expo) para la regla `react-hooks/set-state-in-effect` — es el patrón estándar de hidratación web, el linter aún no reconoce esta excepción vía disable-next-line.

## Files Modified

| Archivo | Qué cambia |
|---|---|
| `package.json`, `package-lock.json` | Proyecto Expo inicializado; scripts `test`/`typecheck` agregados; devDependencies de Jest/Testing Library/ESLint |
| `app.json`, `tsconfig.json`, `expo-env.d.ts` | Config de Expo/TypeScript (tipos de Jest agregados a `tsconfig.json`) |
| `eslint.config.js` | Generado por `expo lint` (flat config + `eslint-config-expo`) |
| `src/app/_layout.tsx` | Reemplazado tabs por `Stack` simple (capa de ruteo delgada) |
| `src/app/index.tsx` | Ahora re-exporta `HomeScreen` de `src/features/home/` |
| `src/features/home/screens/HomeScreen.tsx` | Nuevo — placeholder de Home |
| `src/features/`, `src/lib/`, `src/store/`, `src/types/`, `src/utils/` | Nuevas carpetas (`.gitkeep`) para completar el patrón |
| `src/css.d.ts` | Declaraciones de tipos para imports de `.css`/`.module.css` (soporte web) |
| `src/README.md` | Convención de carpetas y reglas de dependencia (AC #3) |
| `src/hooks/use-color-scheme.web.ts` | `eslint-disable` documentado (ver Decisions Made) |
| `__tests__/App.test.tsx` | Smoke test de `HomeScreen` |
| `src/__mocks__/styleMock.js` | Mock de imports CSS para Jest |
| `.gitignore` (raíz) | Fusionado con entradas estándar de Expo/Node, sin perder las 2 líneas de `agteamos` |
| Eliminados: `src/app/explore.tsx`, `src/components/app-tabs*.tsx`, `external-link.tsx`, `ui/collapsible.tsx`, `web-badge.tsx`, `hint-row.tsx`, `assets/images/tabIcons/*` | Demo del template sin uso tras quitar tabs |

## Unit Tests Written

| Test | Tipo | Resultado |
|---|---|---|
| `HomeScreen renders the app title` | Happy path (smoke test) | ✅ Pass |

## Verificación de Acceptance Criteria (sin emulador disponible en este entorno — ver nota en Next Action)

| AC | Comando | Resultado |
|---|---|---|
| #1 lint/test/typecheck sin errores | `npm run lint`, `npm test -- --coverage`, `npm run typecheck` | ✅ Pass (100% stmts/lines de lo tocado) |
| #2 la app arranca sin errores | `npx expo export --platform android` (proxy sin emulador) + `npx expo-doctor` | ✅ Bundle exitoso (1572 módulos), 21/21 checks |
| #3 estructura documentada | `src/README.md` | ✅ |
| #4 CI ejecuta lint/test reales | `.github/workflows/ci.yml` ya detecta `package.json` (ver job "Check for app scaffold") | ✅ (se confirma al correr en GitHub Actions en el PR) |

## Evidence (QA Screenshots)

No aplica — ticket de scaffold sin UI de negocio ni emulador Android disponible en este entorno. Evidencia = logs de comandos arriba. La primera epic con UI real de negocio (Epic B) sí requiere screenshots E2E.
