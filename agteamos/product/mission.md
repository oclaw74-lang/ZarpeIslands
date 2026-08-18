# Misión del producto

**Generado**: 2026-08-18 (agteamos-new-project, Step 3)
**Fuente**: `documents/01-Concepto-y-Marca-ZarpeIslands.md`, `documents/03-Flujo-del-Sistema-y-Vistas-ZarpeIslands.md`

## Visión

Zarpe Islands (nombre provisional) centraliza la operación diaria de negocios de turismo náutico en zonas de islas — excursiones, tours y renta de embarcaciones con tripulación — reemplazando el manejo manual/disperso de mantenimiento de barcos, rotación de personal, asistencia y propinas por una sola app confiable, simple de usar en el muelle, y que funciona incluso sin señal de internet.

## Personas de usuario

| Persona | Rol de acceso | Necesidad clave | Contexto de uso |
|---|---|---|---|
| **Dueño / Owner** | `owner` | Ver rentabilidad y estado de todos los barcos sin operar el día a día | Consulta rápida, no operación diaria |
| **Gerente / Manager** | `manager` | Coordinar asignaciones, aprobar horarios, ver reportes de todos los barcos | Oficina o muelle, uso diario |
| **Encargado / Supervisor** | `supervisor` | Asignar personal y revisar mantenimientos de sus barcos asignados | En el muelle, condiciones de sol/campo |
| **Secretaría / Administración** | `secretary` | Generar facturas/reportes, mantener expedientes de personal | Oficina, trabajo documental |
| **Personal de barco (crew)** | `crew` | Ponchar entrada/salida, registrar propina, ver su horario, pedir día libre | En altamar o muelle, a menudo sin señal, baja familiaridad tecnológica esperable |

Persona principal para las decisiones de UX de campo: **Personal de barco**, porque debe poder ponchar entrada/salida "en 2 toques" incluso sin conexión (ver `documents/01`, sección 3).

## Fuera de alcance (v1)

- Reservas de clientes/turistas desde la app (módulo futuro — la arquitectura no lo bloquea, ver `documents/03`).
- Rol "Administrador de plataforma" para modelo SaaS multi-empresa (se documentará si el producto se vende a otras empresas).
- Rol "Contador/Finanzas" separado (cubierto por Secretaría a la escala actual: 11-30 personas, 1-5 barcos).
- Plataformas tablet e iOS (fases 2 y 3 — ver `documents/02`, sección 1). v1 es Android.
- Panel web administrativo (futuro, fuera de las 3 fases móviles).
- Reglas avanzadas de rotación no confirmadas aún (certificaciones vigentes, preferencias de disponibilidad, emparejamiento de personal nuevo, etc. — ver `documents/06`, sección 6, pendientes de decisión).

## Definition of Done (proyecto)

Una feature del MVP se considera terminada cuando:

1. Cumple los criterios de aceptación definidos en su ticket de GitHub.
2. Respeta la matriz de permisos y las políticas RLS correspondientes (`documents/04`, `documents/05`).
3. Si toca datos editados desde el barco (ponche, propina, solicitud), funciona offline y sincroniza correctamente vía PowerSync.
4. Tiene tests (unitarios como mínimo; E2E para flujos críticos como ponche y aprobación de solicitudes).
5. Pasa CI (lint + tests) antes de mergear.
6. Está documentada si introduce una decisión arquitectónica nueva (ADR) o cambia el modelo de datos.
7. **i18n desde el día uno**: si el ticket agrega texto de interfaz, las claves de traducción existen en inglés y español (no se aceptan strings hardcodeados) — no es una tarea aparte, es parte de terminar cualquier ticket de UI.
8. **Accesibilidad de línea base**: cumple contraste mínimo AA, no depende solo del color para comunicar estado, y respeta áreas táctiles mínimas de 44x44pt (ver `agteamos/design/DESIGN_SYSTEM.md`) — verificado en cada ticket de UI, no solo en la auditoría final (Epic M).
