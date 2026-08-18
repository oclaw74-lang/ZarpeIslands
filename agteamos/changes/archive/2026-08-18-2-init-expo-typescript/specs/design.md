# Technical Design: TASK-2-init-expo-typescript

## Approach

**Actualizado tras investigación de patrones recomendados (ver `progress.md` → Decisions Made).** En vez de React Navigation manual, se usa **Expo Router** (ruteo por archivos, estándar oficial desde Expo SDK 51+, mismo modelo mental que Next.js) combinado con el patrón **Bulletproof React adaptado a Expo**: `app/` es una capa de ruteo delgada (solo importa y renderiza), toda la lógica de negocio vive en `src/features/<dominio>/`, y el código compartido vive en directorios de nivel superior dentro de `src/`.

Fuentes: [Expo blog — folder structure best practices](https://expo.dev/blog/expo-app-folder-structure-best-practices), [Expo Router core concepts](https://docs.expo.dev/router/basics/core-concepts/), [Designing a Scalable Expo Router Folder Structure](https://dev.to/sachinrupani/designing-a-scalable-react-native-expo-router-folder-structure-3dnj).

## Files to Create

| File | Description |
|------|-------------|
| `app.json`, `package.json`, `tsconfig.json`, `babel.config.js`, `.gitignore` (parcial) | Generados por `create-expo-app` (template default, incluye Expo Router) |
| `app/_layout.tsx` | Layout raíz (capa de ruteo, sin lógica de negocio) |
| `app/index.tsx` | Ruta Home — importa el placeholder real desde `src/features/home/` |
| `src/features/home/screens/HomeScreen.tsx` | Placeholder de Home (se reemplaza por Home real por rol en Epic B) |
| `src/components/.gitkeep` | Componentes UI reutilizables cross-feature |
| `src/features/.gitkeep` | Módulos de negocio por dominio (auth, boats, punch, etc. — se llenan en epics futuras) |
| `src/hooks/.gitkeep` | Custom hooks globales |
| `src/lib/.gitkeep` | Clientes de servicios (Supabase en A2, PowerSync en A4, i18n en A3) |
| `src/store/.gitkeep` | Estado global (a definir librería en epic que lo requiera) |
| `src/types/.gitkeep` | Tipos TypeScript globales |
| `src/constants/.gitkeep` | Theme/tokens de `DESIGN_SYSTEM.md`, config |
| `src/utils/.gitkeep` | Funciones helper puras |
| `src/README.md` | Documenta la convención de carpetas y la regla de dependencia (`app/` no contiene lógica; `features/` no importa de otra `feature/` directo, solo vía `shared`) (AC #3) |
| `.eslintrc.js`, `.prettierrc` | Configuración de lint/format |
| `__tests__/App.test.tsx` | Test smoke mínimo (happy path de render de `app/index.tsx`) |

## Files to Modify

| File | What changes |
|------|--------------|
| `package.json` | Agregar scripts `lint`, `test`, `typecheck`, dependencias de ESLint/Prettier/Jest/React Navigation |
| `.gitignore` (raíz) | Agregar entradas estándar de Expo/Node (`node_modules`, `.expo`, `dist`, etc.) sin tocar las 2 líneas ya existentes de `agteamos` |

## Database Changes

Ninguno.

## API Changes

Ninguno.

## Environment Variables

Ninguna nueva en este ticket (las de Supabase/PowerSync se agregan en A2/A4, ya reservadas en `.env.example`).

## Security Considerations

Ninguna superficie nueva — scaffold sin lógica de negocio ni datos sensibles todavía.
