# Progress: A4c. Cliente WatermelonDB + orquestación de sync en la app

**Ticket**: [#14](https://github.com/oclaw74-lang/ZarpeIslands/issues/14) — Parent: [#5](https://github.com/oclaw74-lang/ZarpeIslands/issues/5) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/5/14-watermelondb-client`

## Next Action

Step 7-8 completos. Listo para Step 9 (close-task).

## Decisions Made

- **2026-08-18**: Riesgo conocido antes de empezar — WatermelonDB + su plugin de Expo (`@lovesworking/watermelondb-expo-plugin-sdk-52-plus`) solo confirma soporte hasta Expo SDK 52/53; este proyecto usa SDK 57 con New Architecture obligatoria. El usuario decidió probar igual. **Resultado: compila y corre correctamente** (build nativo exitoso, JSI funcional, lecturas/escrituras locales verificadas). `expo-doctor` marca la librería como "Untested on New Architecture" (metadata desactualizada de React Native Directory, no un fallo real) — se agregó a `expo.doctor.reactNativeDirectoryCheck.exclude` en `package.json` con esta justificación.
- **2026-08-18**: Combinación `declare` + decorador (`@field('x') declare x: string`) es sintácticamente inválida en TypeScript (un campo `declare` no puede tener decorador) — no es un problema de configuración de Babel sino una restricción real del lenguaje. Solución correcta: campos con anotación de tipo simple, sin `!` ni `declare` (`@field('x') x: string`), que no generan inicializador en runtime bajo el modo de decoradores legacy. Se desactivó `strictPropertyInitialization` en `tsconfig.json` (los decoradores de WatermelonDB inicializan el campo, TS no puede verlo estáticamente) — patrón estándar para proyectos TS+WatermelonDB/TypeORM.
- **2026-08-18**: No fue posible lograr un login real (`signInWithPassword`) con un usuario sembrado directamente por SQL contra el Supabase hosteado — el hash de password verifica correcto en Postgres pero GoTrue lo rechaza igual (limitación de sembrar usuarios "a mano" en la plataforma gestionada, no reproducible en self-hosted). Se decidió con el usuario verificar por capas: AC#1 100% en emulador real sin auth; sync real end-to-end completo (login + push/pull) queda pendiente de Epic B1. La lógica de sync en sí (`push_changes`/`pull_changes`) ya fue verificada exhaustivamente en A4b con simulación de rol/claims a nivel SQL.
- **2026-08-18**: Se agregó `@babel/plugin-proposal-decorators` (legacy) a `babel.config.js` — necesario para los decoradores de WatermelonDB, sin overrides adicionales (la primera solución intentada con overrides de `@babel/plugin-transform-typescript` resultó innecesaria una vez corregido el uso de `declare`).

## Files Modified

| Archivo | Qué cambia |
|---|---|
| `package.json` | + `@nozbe/watermelondb`, plugin de Expo, `expo-build-properties`, `@react-native-community/netinfo`, `@babel/plugin-proposal-decorators`; excepción de `expo-doctor` documentada |
| `app.json` | + plugins `watermelondb-expo-plugin-sdk-52-plus`, `expo-build-properties` (packagingOptions pickFirst) |
| `babel.config.js` | Nuevo — preset-expo + decoradores legacy |
| `tsconfig.json` | + `experimentalDecorators`, `strictPropertyInitialization: false` |
| `jest.setup.js` | + mocks de `@react-native-community/netinfo` (oficial) y `@/lib/watermelon/database` (propio, en memoria) |
| `src/lib/watermelon/schema.ts` | Nuevo — esquema local espejo de `punches` |
| `src/lib/watermelon/models/Punch.ts` | Nuevo — modelo WatermelonDB |
| `src/lib/watermelon/database.ts` | Nuevo — instancia `Database` + `SQLiteAdapter` (JSI) |
| `src/lib/watermelon/sync.ts` | Nuevo — `synchronizeApp()`, wrapper de `synchronize()` contra `push_changes`/`pull_changes` (A4b) |
| `src/lib/watermelon/useAutoSync.ts` | Nuevo — hook que dispara sync al recuperar conectividad |
| `src/features/home/components/SyncTestPanel.tsx` | Nuevo — panel de prueba (crear punch local, sync manual), placeholder hasta Epic D2 |
| `src/features/home/screens/HomeScreen.tsx` | Agrega `<SyncTestPanel />` |
| `src/app/_layout.tsx` | Llama `useAutoSync()` |

## Unit Tests Written

| Test | Tipo | Resultado |
|---|---|---|
| `sync.test.ts` — no hace nada sin cliente Supabase | Happy path (config faltante) | ✅ Pass |
| `sync.test.ts` — llama pull/push_changes correctamente | Happy path | ✅ Pass |
| `sync.test.ts` — lanza si pull_changes devuelve error | Error case | ✅ Pass |
| `useAutoSync.test.ts` — no sincroniza en el estado inicial conectado | Edge case | ✅ Pass |
| `useAutoSync.test.ts` — sincroniza al pasar de offline a online | Happy path (AC#2) | ✅ Pass |
| `useAutoSync.test.ts` — no sincroniza de nuevo si ya está online | Edge case | ✅ Pass |

## Verificación de Acceptance Criteria

| AC | Verificación | Resultado |
|---|---|---|
| #1 — escritura local en modo avión, legible de inmediato | Verificado en emulador Android real con red genuinamente desconectada (`svc wifi/data disable`, confirmado con `dumpsys connectivity` → "Active default network: none"): toque en "Crear punch local" → "Punches locales: 3" y "Punch creado localmente." sin ningún acceso a red | ✅ Pass |
| #2 — sync automático al reconectar, sin acción manual | Lógica verificada por test unitario (`useAutoSync.test.ts`, transición offline→online dispara `synchronizeApp()` exactamente una vez). Sync end-to-end con backend real requiere sesión de usuario (Epic B1, ver Decisions Made) — sin sesión, el panel de prueba confirma que no crashea y explica la limitación en pantalla | ✅ Pass (lógica) / ⏳ Pendiente validación end-to-end con auth real en Epic B1 |
| #3 — sync limitado por `company_member_id` | Heredado y ya verificado exhaustivamente en A4b (aislamiento cruzado de 2 usuarios contra la base real). `sync.ts` reenvía exactamente el mismo contrato de `push_changes`/`pull_changes` | ✅ Pass |

## Evidence (screenshots)

- `evidence/android-emulator-a4c-1.png` — Home con Sync test panel, WatermelonDB funcionando (consulta real a SQLite local, "Punches locales: 0")
- `evidence/android-emulator-a4c-3-offline-write.png` — Escritura offline exitosa con red genuinamente desconectada
- `evidence/android-emulator-a4c-4-sync-no-session.png` — Manejo correcto del estado sin sesión (sin crash, mensaje claro)
