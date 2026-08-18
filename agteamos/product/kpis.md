# KPIs de éxito del MVP

**Generado**: 2026-08-18 (agteamos-new-project, Step 3)

## Adopción y uso diario

- **% de ponches registrados vs. turnos programados**: mide si el personal realmente reemplaza el método manual anterior por la app.
- **% de ponches offline sincronizados sin conflicto**: valida que el flujo offline-first (documents/03, sección 7.1) funciona en campo real, no solo en pruebas.
- **Tiempo promedio para completar un ponche**: objetivo cualitativo "2 toques" (documents/01) — medir fricción real.

## Operación

- **% de mantenimientos completados a tiempo** (no vencidos) por barco.
- **% de rotaciones sugeridas aceptadas sin ajuste manual**: mide qué tan buena es la sugerencia automática del algoritmo (documents/06).
- **Tiempo promedio de aprobación de solicitudes** (día libre / cambio de turno / incidente).

## Confiabilidad de datos

- **% de propinas registradas con reparto correcto** (individual vs. pool) sin corrección posterior.
- **Incidentes de datos duplicados o perdidos en sincronización offline** (objetivo: 0 en producción).

## Negocio

- **Reducción de trabajo administrativo manual** (self-reportado por Dueño/Gerente/Secretaría) tras 1 mes de uso.
- **Cobertura mínima de barcos activos sin incidentes de falta de personal** (ej. barco sin Capitán asignado).

> Nota: estos KPIs se miden una vez el producto esté en uso real (post-lanzamiento). Durante el desarrollo del MVP, el criterio de avance es el cumplimiento de acceptance criteria por feature (ver `roadmap.md` y los tickets de GitHub).
