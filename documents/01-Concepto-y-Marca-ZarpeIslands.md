# Documento 1: Concepto y Marca
## Proyecto: Zarpe Islands (nombre provisional)

> **Nota:** "Zarpe Islands" es un nombre de trabajo. Antes de lanzar públicamente, se debe verificar disponibilidad de dominio, redes sociales y nombre en Google Play / App Store. Alternativas en evaluación: Bitácora, Marejada, Amarre, Cayo, Faro.

---

## 1. Concepto del producto

**Zarpe Islands** es una aplicación de gestión operativa para negocios de turismo náutico en zonas de islas: excursiones, tours y renta de embarcaciones con tripulación asignada. Centraliza en un solo lugar lo que hoy se maneja de forma manual o dispersa:

- Programación de mantenimientos por barco
- Asignación y rotación automática/sugerida del personal entre barcos
- Control de asistencia (ponche de entrada/salida), incluso sin señal de internet
- Registro de propinas, tanto individuales como repartidas entre tripulación
- Roles diferenciados según quién usa la app (dueño, gerente, manager, encargado, secretaría, personal de barco)

**Idioma de la interfaz:** Inglés como idioma base del código y textos fuente, con soporte multilenguaje (i18n) desde el día uno — mínimo inglés y español, pensando en turistas, personal local, y expansión a otras islas/países.

---

## 2. Público objetivo (usuarios de la app)

| Tipo de usuario | Rol principal | Necesidad clave |
|---|---|---|
| Dueño / Owner | Visión general del negocio | Reportes, rentabilidad, todos los barcos |
| Gerente / Manager | Operación diaria | Asignaciones, aprobar horarios, ver todo |
| Encargado / Supervisor | Control en el muelle | Asignar personal, revisar mantenimientos |
| Secretaría / Administración | Papeleo y documentación | Facturación, reportes, nómina/propinas |
| Personal de barco (tripulación) | Trabajo diario | Ponchar entrada/salida, registrar propina, ver su horario |

---

## 3. Tono de marca

- **Moderno** pero no frío — cálido, isleño, cercano.
- **Profesional** — un dueño de negocio debe sentir que es una herramienta seria, no un juguete.
- **Simple** — el personal de barco (posiblemente con menor familiaridad tecnológica) debe poder ponchar entrada/salida en 2 toques.
- **Confiable** — como una bitácora: lo que se registra, queda.

**Tagline (en inglés, para uso en la app/tiendas):**
> "Smooth sailing, every day." *(alternativas: "Your fleet, in sync." / "Run your islands from your pocket.")*

---

## 4. Paleta de colores

Inspirada en mar, cielo caribeño, arena y vegetación de isla. Pensada para modo claro (principal) con buen contraste en exteriores/sol fuerte (uso en muelle, al aire libre).

### Colores principales

| Nombre | Uso | Hex | Vista |
|---|---|---|---|
| **Deep Ocean** | Color primario, headers, botones principales | `#0B4F6C` | Azul profundo marino |
| **Caribbean Blue** | Acentos, links, elementos activos | `#1B9AAA` | Azul turquesa |
| **Sea Foam** | Fondos secundarios, tarjetas | `#A8DADC` | Verde-azul claro |
| **Palm Green** | Estados positivos (a tiempo, completado, ok) | `#2E8B57` | Verde palma |
| **Sand White** | Fondo principal, espacios en blanco | `#F8F9F5` | Blanco cálido/arena |

### Colores de estado (semáforos operativos)

| Estado | Color | Hex |
|---|---|---|
| A tiempo / Completado / OK | Verde | `#2E8B57` |
| Advertencia / Próximo a vencer | Ámbar | `#E9B44C` |
| Atrasado / Vencido / Falta | Rojo coral | `#D64550` |
| Neutral / Informativo | Gris azulado | `#6C8791` |

### Tipografía sugerida

- **Encabezados:** una sans-serif geométrica y firme (ej. *Poppins*, *Inter Bold*, *Manrope*) — transmite modernidad sin perder seriedad.
- **Cuerpo de texto:** sans-serif muy legible en pantallas pequeñas y bajo sol (ej. *Inter*, *Roboto*) — prioridad en legibilidad para el personal de campo.
- Evitar fuentes decorativas tipo "náutico antiguo" (as, cursivas old-school) — no calza con el objetivo "moderno y profesional".

### Iconografía / elementos visuales

- Formas curvas suaves (evocan olas), no líneas 100% rectas.
- Iconos de línea simple (outline), no ilustrativos recargados — para que el personal identifique rápido cada función.
- Motivos posibles para logo: silueta de proa de barco + ola, ancla estilizada minimalista, brújula simplificada, o una gota/ola formando un check ✓ (concepto: "todo en orden").
- Evitar clichés muy usados en apps náuticas: timón realista, palmeras 3D, atardeceres fotográficos.

---

## 5. Próximos pasos de este documento

- [ ] Validar/descartar nombre final ("Zarpe Islands" vs. alternativas)
- [ ] Decisión de logo final (a definir con diseñador o generar propuestas visuales)
- [ ] Aplicar esta paleta al documento de Roles y Permisos (para color-coding de roles en la UI)
