# ADR-005: Sistema de diseño propio en vez de Tamagui/Gluestack-UI

**Estado**: Aceptado
**Fecha**: 2026-08-19

## Contexto

Pedido explícito del usuario de modernizar la UI de la app (lists más modernas,
iconografía real para barcos/puestos, animaciones a nivel de app, look 2026),
con referencias de Dribbble (DailyMe, furniture e-commerce app) e instrucción
de investigar frameworks de componentes tipo MAUI/MudBlazor aplicables a RN
antes de implementar.

Research realizado: `@expo/vector-icons` está deprecado desde Expo SDK 57
(recomendación oficial: `@react-native-vector-icons/*` por set). El landscape
2026 de librerías de componentes para RN tiene dos líderes: **Tamagui**
(compilador propio, máximo rendimiento, alto costo de setup/migración) y
**Gluestack-UI** (sucesor de NativeBase, adopción incremental vía CLI, basado
en `react-native-aria`). `react-native-reanimated` ya es dependencia del
proyecto y soporta animaciones de entrada/salida de listas nativamente
(`entering`/`exiting`, sin librería nueva).

## Decisión

Construir un **sistema de diseño propio y liviano** (`src/components/ui/`:
`Card`, `Badge`, `IconCircle`, `AppButton`, `EmptyState`, `AnimatedListItem`)
sobre `@react-native-vector-icons/ionicons` + `react-native-reanimated`, en vez
de adoptar Tamagui o Gluestack-UI. Documentado en `agteamos/design/DESIGN_SYSTEM.md`.

## Alternativas consideradas

- **Tamagui**: descartado — requiere compilador propio y configuración de
  build significativa; el costo de migrar pantallas de auth ya shippeadas y
  verificadas contra Supabase real (B1/B2) no se justifica frente al tamaño
  actual del proyecto.
- **Gluestack-UI**: descartado — adopción incremental es más barata que
  Tamagui, pero igual introduce una dependencia grande con su propio sistema
  de theming, que competiría con la identidad de marca ya definida
  (glassmorphism + tipografía Sora) en vez de complementarla.
- **Sistema propio liviano (elegida)**: sin dependencia nueva pesada, control
  total del look de marca, reutiliza `react-native-reanimated` (ya instalado)
  y solo agrega una dependencia real: el paquete de íconos.

## Consecuencias

- Menos "gratis" que adoptar un framework maduro: cada componente nuevo
  (ej. un DatePicker, un Select complejo) se construye a mano en vez de
  importarse ya hecho — aceptable mientras el catálogo de componentes se
  mantenga pequeño (listas, badges, botones, estados vacíos).
- Todo dominio nuevo debe usar los componentes de `src/components/ui/` desde
  el inicio (ver guía de uso en `agteamos/design/DESIGN_SYSTEM.md`) — no
  reinventar filas de lista con `StyleSheet` suelto como en C1/C2 original.
- `react-native-reanimated` requeriría mock manual en Jest (`jest.setup.js`)
  porque el mock oficial de la librería inicializa el módulo nativo real de
  `react-native-worklets` (arquitectura nueva de Reanimated 4), que no corre
  en el entorno de test de Node.
