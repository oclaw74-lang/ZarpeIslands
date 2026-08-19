# Progress: UI-1. Sistema de diseño propio

**Ticket**: [#38](https://github.com/oclaw74-lang/ZarpeIslands/issues/38)
**Branch**: `feature/38-ui-design-system`

## Decisions Made

- **Sistema propio liviano sobre Tamagui/Gluestack-UI** — ver [ADR-005](../../architecture/adr/ADR-005-ui-design-system.md), decisión explícita del usuario tras research de mercado.
- **`@react-native-vector-icons/ionicons`** en vez de `@expo/vector-icons` (deprecado en Expo SDK 57).
- **`react-native-reanimated` (ya instalado) para animaciones**, sin librería nueva de animación.
- **Mock manual de reanimated en `jest.setup.js`** — el mock oficial de la librería (`react-native-reanimated/mock`) inicializa el módulo nativo real de `react-native-worklets` (arquitectura nueva de Reanimated 4), que no corre en Node. Se escribió un mock mínimo cubriendo solo las APIs usadas (`useSharedValue`, `useAnimatedStyle`, `withTiming`, `Animated.View`, `createAnimatedComponent`, `FadeInDown`).
- **`react-hooks/immutability` (React Compiler ESLint) es un falso positivo con el patrón `.value =` de SharedValue** — se documentó con `eslint-disable-next-line` + comentario explicando por qué, en vez de refactorizar `AppButton` a un patrón menos idiomático de Reanimated.

## Verificación

1. `npx jest src/components/ui` — 5 suites nuevas (Card, Badge, IconCircle, AppButton, EmptyState), todas verdes.
2. `npx jest` completo — 33 suites, 117 tests, todos verdes (sin regresión en boats/job-positions/home tras el refactor).
3. `npx tsc --noEmit` — limpio (tras regenerar `.expo/types/router.d.ts`, gotcha ya conocido).
4. `npx eslint src --max-warnings=0` — limpio salvo el warning preexistente de i18n.
5. **Verificación visual en emulador Android** (usuario QA temporal `ui1-qa-owner@zarpeislands.test`, empresa bootstrapeada real vía RPC):
   - Home: tarjetas con `IconCircle` (barco, maletín) en vez de links de texto.
   - Boats: `EmptyState` con ícono de barco outline; tras crear un barco, fila con `Card` + `IconCircle` (barco) + `Badge` verde "Active".
   - Job positions: 5 defaults mostrados con `Card` + `IconCircle` (maletín) + `Badge`s ("Required every shift" en tono primario, "Can repeat in rotation" en tono neutral).
   - Usuario y empresa de prueba eliminados al finalizar.

## Files Modified

- `src/constants/theme.ts` — agregados `Palette`, `Radius`, `Shadow`.
- `src/components/ui/{Card,Badge,IconCircle,AppButton,EmptyState,AnimatedListItem}.tsx` + tests.
- `src/features/boats/screens/BoatsListScreen.tsx`, `src/features/job-positions/screens/JobPositionsListScreen.tsx`, `src/features/home/screens/HomeScreen.tsx` — migrados a los nuevos componentes.
- `jest.setup.js` — mock manual de `react-native-reanimated`.
- `package.json` — nueva dependencia `@react-native-vector-icons/ionicons`.
- `agteamos/design/DESIGN_SYSTEM.md` — documentación nueva.
- `agteamos/architecture/adr/ADR-005-ui-design-system.md` — decisión documentada.

## Evidence

- Capturas de pantalla del emulador (Home, Boats con barco creado, Job positions con los 5 defaults) — no versionadas en el repo, revisadas durante la sesión.
- `npx jest`, `npx tsc --noEmit`, `npx eslint` — ver verify-report.md.
