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

- [ ] Logo final y validación de nombre de marca (`documents/01`, próximos pasos) — no bloquea el desarrollo de componentes base.
- [ ] Sin herramienta de diseño externa (Figma/Storybook) referenciada todavía — agregar aquí cuando exista.
