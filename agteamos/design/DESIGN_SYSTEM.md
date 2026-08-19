# Design System

**Generado**: 2026-08-18 (agteamos-new-project, Step 4)
**Fuente**: `documents/01-Concepto-y-Marca-ZarpeIslands.md`

Plataforma objetivo: React Native + Expo (móvil), modo claro como principal, optimizado para uso al aire libre / bajo sol fuerte (personal en el muelle).

## Paleta de colores

### Colores principales

| Token | Uso | Hex |
|---|---|---|
| `color.primary` (Deep Ocean) | Color primario, headers, botones principales | `#0B4F6C` |
| `color.accent` (Caribbean Blue) | Acentos, links, elementos activos | `#1B9AAA` |
| `color.surface.secondary` (Sea Foam) | Fondos secundarios, tarjetas | `#A8DADC` |
| `color.success` (Palm Green) | Estados positivos (a tiempo, completado, ok) | `#2E8B57` |
| `color.background` (Sand White) | Fondo principal | `#F8F9F5` |

### Colores semánticos (semáforos operativos)

| Token | Estado | Hex |
|---|---|---|
| `color.status.ok` | A tiempo / Completado / OK | `#2E8B57` |
| `color.status.warning` | Advertencia / Próximo a vencer | `#E9B44C` |
| `color.status.danger` | Atrasado / Vencido / Falta | `#D64550` |
| `color.status.neutral` | Neutral / Informativo | `#6C8791` |

Uso obligatorio de estos 4 estados en: mantenimientos (Fase 1, feature 7), ponches fuera de horario, y cualquier indicador de cumplimiento — para consistencia visual entre roles.

## Tipografía

| Token | Familia sugerida | Uso |
|---|---|---|
| `font.heading` | Poppins / Inter Bold / Manrope | Encabezados — moderno y firme |
| `font.body` | Inter / Roboto | Cuerpo de texto — prioridad en legibilidad bajo sol y en pantallas pequeñas |

Evitar fuentes decorativas tipo "náutico antiguo" (cursivas old-school) — no calza con el tono "moderno y profesional".

## Espaciado

Base 4px (estándar React Native / Expo), escala: 4, 8, 12, 16, 24, 32, 48. Ajustar en la primera implementación de componentes si el diseñador define otra escala explícita.

## Iconografía y elementos visuales

- Formas curvas suaves (evocan olas), evitar líneas 100% rectas.
- Iconos de línea simple (outline), no ilustrativos recargados — prioridad en identificación rápida por parte de personal de campo.
- Evitar clichés náuticos genéricos: timón realista, palmeras 3D, atardeceres fotográficos.

## Componentes base (a implementar según se necesiten)

- **Botón de ponche**: componente prioritario — debe ser el más grande y accesible de la Home de Crew, un solo toque cambia de estado (in/out), con confirmación visual clara (ej. "Entrada registrada 8:02 AM").
- **Badge de estado**: usa `color.status.*`, para mantenimientos, ponches fuera de horario y solicitudes.
- **Indicador de conexión**: componente discreto y no bloqueante — "Sin conexión, se guardará y sincronizará después" (ver `documents/03`, sección 1).
- **Card de barco / turno**: usado en Home de Crew y vistas de Encargado/Gerente.
- **Lista de solicitudes con estado** (pendiente/aprobada/rechazada).

## Accesibilidad (línea base)

- Contraste mínimo AA (4.5:1) en texto sobre `color.background`, verificado especialmente para `color.status.warning` (ámbar sobre blanco puede fallar contraste — usar texto oscuro o borde/ícono adicional, no solo color).
- No depender únicamente del color para comunicar estado (los badges de estado deben incluir texto o ícono, por daltonismo y por legibilidad bajo sol).
- Áreas táctiles mínimas de 44x44pt en botones de campo (ponche, confirmar/cancelar), dado el contexto de uso con guantes/manos mojadas en el muelle.

## Idioma e i18n

Todo texto de interfaz vive en archivos de traducción (`i18next`/`react-i18next`), inglés como base del código, español incluido desde el día uno (ver Fase 1, feature 11 del roadmap).

## Pendiente

- [x] Logo final y validación de nombre de marca — resuelto en B1 (glassmorphism + tipografía Sora, ver abajo).
- [ ] Sin herramienta de diseño externa (Figma/Storybook) referenciada todavía — agregar aquí cuando exista.

---

# UI-1: Sistema de componentes (2026-08-19)

**Ticket**: [#38](https://github.com/oclaw74-lang/ZarpeIslands/issues/38)

Esta sección formaliza y actualiza lo de arriba con lo realmente implementado
en código (`src/constants/theme.ts`, `src/components/ui/`) — la sección
original documenta la intención de marca desde el bootstrap del proyecto; esta
documenta el sistema de componentes real, construido a partir de esa base más
lo aprendido en las pantallas de auth (B1/B2) ya shippeadas.

## Contexto y decisión

Pedido explícito del usuario: modernizar la UI (iconografía real, animaciones,
componentes reutilizables, look 2026) inspirado en referencias de Dribbble
(DailyMe — nutrition app, furniture e-commerce app) y en el research de
frameworks tipo MAUI/MudBlazor para RN.

**Se evaluaron 3 opciones**:
1. **Tamagui** — compilador propio, máximo rendimiento, costo de setup alto.
2. **Gluestack-UI** (sucesor de NativeBase) — adopción incremental vía CLI, basado en `react-native-aria`.
3. **Sistema propio liviano** — componentes propios sobre `@react-native-vector-icons/ionicons` + `react-native-reanimated` (ya instalado).

**Elegida: opción 3**, decisión del usuario (ver [ADR-005](../architecture/adr/ADR-005-ui-design-system.md)). Razón: las pantallas de auth (B1/B2)
ya están shippeadas, verificadas contra Supabase real y tienen identidad de marca
propia (glassmorphism + Sora) — migrar a un framework completo implicaría
reescribirlas sin beneficio claro.

## Paleta implementada (`src/constants/theme.ts` → `Palette`)

Esta es la paleta real en código — algunos tokens difieren levemente de la
paleta conceptual original de arriba (ej. `accent` pasó de Caribbean Blue
`#1B9AAA` a `#3c87f7`, tomado de los links ya usados en B1/B2):

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#0B4F6C` | Botones primarios, íconos destacados, título de auth (= `color.primary`) |
| `primaryDark` | `#0D2740` | Texto sobre fondo claro, splash |
| `accent` | `#3c87f7` | Links, acentos secundarios |
| `success` | `#2E8B57` | Badge de estado "activo" (= `color.status.ok`) |
| `warning` | `#E9B44C` | Badge de estado "en mantenimiento" (= `color.status.warning`) |
| `danger` | `#D64550` | Errores, estados destructivos (= `color.status.danger`) |
| `neutralLine` | `#D9E1E4` | Bordes de Card/inputs |
| `neutralMuted` | `#7C8B93` | Texto secundario, placeholders, EmptyState |
| `surface` | `#F3F6F7` | Fondo de pantalla, IconCircle default |
| `surfaceElevated` | `#FFFFFF` | Fondo de Card |

`Radius` (`small` 8 / `medium` 12 / `large` 16 / `pill` 999) y `Shadow.soft`
(sombra suave, `shadowOpacity: 0.08`) completan los tokens — usar siempre estas
constantes, no hex/números sueltos en componentes nuevos.

## Componentes (`src/components/ui/`)

| Componente | Uso | Notas |
|---|---|---|
| `Card` | Contenedor base de toda fila/sección elevada | `flat` para anidar sin doble sombra |
| `Badge` | Pastilla de estado/flag (`tone`: primary/success/warning/danger/neutral) | Reemplaza texto suelto de estado — cumple la regla de accesibilidad de arriba (texto + color, no solo color) |
| `IconCircle` | Ícono en círculo de fondo — filas de lista, headers | `size`: small/medium/large |
| `AppButton` | Botón con feedback de presión animado (`scale` vía reanimated) | `variant`: primary/secondary/ghost |
| `EmptyState` | Estado vacío estandarizado (ícono + texto) | Reemplaza `<ThemedText>` centrado suelto |
| `AnimatedListItem` | Envoltorio de entrada animada (`FadeInDown`, escalonado por índice) | Usar en `renderItem` de FlatList |

Iconografía: `@react-native-vector-icons/ionicons` (`@expo/vector-icons` está
deprecado desde Expo SDK 57 — no usarlo en código nuevo). Nombres de ícono
siguen el set de [Ionicons](https://ionic.io/ionicons), de línea simple
(outline), consistente con la guía de iconografía original de arriba.

## Cuándo usar cada uno (guía rápida)

- **Toda fila de lista** → `Pressable` + `Card` (fila) con `IconCircle` a la
  izquierda + contenido a la derecha, envuelta en `AnimatedListItem` con el
  `index` del `renderItem`.
- **Todo botón de acción principal** (crear, guardar) → `AppButton`, no
  `Pressable` + `StyleSheet` suelto.
- **Todo flag/estado mostrado en una fila** → `Badge` con el `tone` semántico
  correspondiente (no texto plano ni colores hardcodeados).
- **Toda lista vacía** → `EmptyState` con un ícono representativo del dominio.

## Aplicado en (UI-1)

- `BoatsListScreen` — ícono `boat`, `Badge` de estado (success/warning/neutral).
- `JobPositionsListScreen` — ícono `briefcase`, `Badge` de flags (primary/neutral).
- `HomeScreen` — links de navegación temporales migrados a `Card` + `IconCircle`.

## Testing

Reanimated requiere un mock manual en `jest.setup.js` (`jest.mock('react-native-reanimated', ...)`)
— el mock oficial (`react-native-reanimated/mock`) inicializa el módulo nativo
real de `react-native-worklets` (arquitectura nueva de Reanimated 4) y no corre
en Node. El mock propio cubre solo las APIs usadas: `useSharedValue`,
`useAnimatedStyle`, `withTiming`, `Animated.View`, `Animated.createAnimatedComponent`, `FadeInDown`.

## Pendiente / próximos pasos

- Migrar `BoatFormScreen`/`JobPositionFormScreen` a `AppButton` (fuera de
  alcance de UI-1, quedó con los selectores de pill existentes).
- Todo dominio nuevo (B4 Staff, D Ponche, etc.) debe usar estos componentes
  desde el inicio, no reinventar filas con `StyleSheet` suelto.
