# Requirements: C1. CRUD de boats

**Como** Owner o Manager, **necesito** crear y editar barcos, **para** tener el inventario de embarcaciones del negocio.

Depende de: B2. Fuente: `documents/05` sección 3.4.

## Acceptance Criteria
1. Crear un barco con `name`, `registration_number`, `boat_type` (`excursion`/`rental`/`mixed`), `capacity`, `status` (`active`/`in_maintenance`/`inactive`), `notes`.
2. Cambiar `status` a `inactive` lo excluye de las vistas de asignación/rotación activa (Epic E) sin borrarlo.
3. Solo Owner/Manager pueden crear/editar (Encargado no, según matriz de `documents/04`).
