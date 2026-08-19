# Requirements: C2. Catálogo de job_positions

**Como** Owner o Manager, **necesito** definir los puestos de trabajo de mi empresa, **para** clasificar al personal operativo y aplicar reglas de rotación.

Depende de: B2. Fuente: `documents/04` sección 3, `documents/06` sección 5.

## Acceptance Criteria
1. Catálogo pre-cargado por defecto con Capitán/Patrón, Marinero/Deckhand, Mecánico, Guía turístico, Otro — editable por empresa.
2. Cada puesto tiene `is_required_per_shift` (true por defecto para Capitán) y `rotation_repeat_allowed` (true por defecto para Capitán; Manager se maneja como excepción de rol, no de puesto).
3. Cambiar `is_required_per_shift` de un puesto afecta la validación de cobertura mínima que usará Epic E (sin implementar el algoritmo acá, solo el dato).
