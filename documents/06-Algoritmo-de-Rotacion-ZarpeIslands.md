# Documento 6: Algoritmo de Rotación de Personal
## Proyecto: Zarpe Islands (nombre provisional)

---

## 1. Objetivo

Generar una **sugerencia** de asignación de personal a barcos para el Encargado/Gerente, que respete las reglas del negocio, y que ese usuario pueda aceptar tal cual o ajustar manualmente antes de confirmar (ver Documento 3, sección 7.2).

La sugerencia nunca se aplica sola — siempre pasa por confirmación humana.

---

## 2. Reglas del negocio (definidas por el dueño del proyecto)

| # | Regla | Tipo |
|---|---|---|
| 1 | Una persona no puede repetir el mismo barco dos veces **consecutivas** | Regla fuerte (con excepciones) |
| 2 | **Excepción de rol:** Capitán y Manager sí pueden repetir el mismo barco consecutivamente | Excepción a la regla 1 |
| 3 | **Asignación fija/dedicada:** un capitán (u otro personal) puede estar permanentemente asignado a un barco específico — en ese caso la regla 1 no le aplica a ese barco | Excepción a la regla 1 |
| 4 | Si alguien trabajó **3 turnos seguidos**, se le da un día de descanso — pero solo si la semana lo permite (no todos los barcos necesitan cobertura total) | Regla suave (best-effort) |
| 5 | **Caso extremo:** si no hay suficiente personal disponible, se permite repetir barco como última opción | Válvula de escape |

---

## 3. Orden de prioridad al generar la sugerencia

Cuando dos reglas chocan, el sistema debe decidir cuál gana. Orden de mayor a menor prioridad:

1. **Cobertura mínima obligatoria** — todo barco activo debe tener como mínimo su(s) puesto(s) requerido(s) cubiertos (ej. 1 Capitán). Sin esto, el barco no puede operar.
2. **Asignaciones fijas/dedicadas** — si una persona tiene barco fijo asignado (`fixed_boat_id`), se le asigna ahí por defecto, salvo que esté de descanso/día libre aprobado.
3. **Días libres aprobados** — nunca se asigna a alguien con una solicitud de día libre aprobada para esa fecha.
4. **No repetir barco consecutivo** (regla 1) — aplica a todo el personal **excepto** quienes tengan excepción de rol (Capitán/Manager) o asignación fija (regla 3).
5. **Descanso tras 3 turnos seguidos** (regla 4) — se intenta dar descanso, pero **solo si hay suficiente personal disponible esa semana** para cubrir todos los barcos sin esa persona. Si no hay margen, se omite esta regla (la cobertura del negocio pesa más que el descanso).
6. **Reparto equitativo** — entre todas las combinaciones válidas que quedan después de aplicar las reglas anteriores, se prefiere la que reparte más parejo los turnos y descansos entre todo el personal, para que no siempre trabajen o descansen los mismos.
7. **Caso extremo (válvula de escape)** — si aplicando todo lo anterior no hay forma de cubrir un barco sin repetir a alguien fuera de las excepciones, el sistema genera la asignación repitiendo barco, pero la marca visualmente como **"Asignación excepcional"** para que el Encargado la vea y confirme a propósito (no pasa desapercibida).

---

## 4. Cómo se ve esto en la práctica (ejemplos)

**Ejemplo 1 — Caso normal:**
Juan (Marinero) trabajó el Barco A el lunes. El martes, el sistema no lo vuelve a poner en el Barco A — lo asigna al Barco B o C, o lo pone en descanso si aplica la regla de los 3 días.

**Ejemplo 2 — Excepción por rol:**
Pedro es Capitán. El sistema sí puede ponerlo en el Barco A el lunes y también el martes, porque su rol tiene la excepción.

**Ejemplo 3 — Asignación fija:**
María es Marinero, pero está marcada como "asignación fija" al Barco B (porque, por ejemplo, conoce mejor ese barco). El sistema la pone en el Barco B todos los días que ese barco opere, sin aplicar la regla de no repetir.

**Ejemplo 4 — Descanso tras 3 días:**
Luis trabajó lunes, martes y miércoles. Si el jueves hay suficiente personal para cubrir todos los barcos sin él, el sistema lo pone en descanso. Si esa semana faltan manos (temporada alta, muchos barcos activos), el sistema lo sigue asignando, pero queda visible en el dashboard que "Luis lleva 4+ días sin descanso" como alerta para el Encargado.

**Ejemplo 5 — Caso extremo real:**
Solo quedan 2 personas disponibles para 2 barcos, y una de ellas ya trabajó el Barco A ayer. El sistema no tiene otra opción válida → asigna repitiendo, y lo marca como "Asignación excepcional — revisar" en vez de sugerirlo como si fuera normal.

---

## 5. Cambios necesarios al modelo de base de datos (Documento 5)

Para soportar estas reglas, se agregan dos campos:

**En `company_members`:**

| Campo nuevo | Tipo | Notas |
|---|---|---|
| `fixed_boat_id` | uuid, FK → boats, nullable | si tiene barco fijo asignado |

**En `job_positions`:**

| Campo nuevo | Tipo | Notas |
|---|---|---|
| `rotation_repeat_allowed` | boolean, default `false` | `true` para Capitán y Manager por defecto; configurable por si el negocio quiere cambiarlo |

**En `boat_assignments`:**

| Campo nuevo | Tipo | Notas |
|---|---|---|
| `is_exception` | boolean, default `false` | marca visualmente las "asignaciones excepcionales" (caso extremo) |
| `exception_reason` | text, nullable | ej. "Personal insuficiente esta semana" |

**En `company_settings`:**

| Campo nuevo | Tipo | Notas |
|---|---|---|
| `rest_after_consecutive_days` | int, default `3` | configurable si el negocio quiere cambiarlo a 2 o 4 |

---

## 6. Otras reglas que suelen agregarse en sistemas parecidos (a decidir si las quieres)

Estas son comunes en software de turnos/rotación de personal (hostelería, tripulaciones) y podrían servirte, pero no están activadas todavía — te las dejo para que elijas cuáles sí quieres:

1. **Tope máximo de días trabajados sin descanso (regla dura, no solo "si se puede"):** ej. nunca más de 6 días seguidos sin descanso, sin excepción, por seguridad/cansancio — aunque falte personal.
2. **Certificación por puesto:** solo alguien con certificación de "Capitán" vigente puede ocupar esa posición (se conecta con `documents` del Documento 5 — certificaciones con fecha de vencimiento).
3. **Preferencias/disponibilidad del personal:** que cada tripulante pueda marcar en la app días en los que normalmente no puede trabajar (ej. estudia los martes), y el algoritmo lo respete al sugerir.
4. **Emparejamiento de personal nuevo:** un tripulante nuevo siempre se asigna junto a alguien con experiencia en sus primeros turnos, hasta que un supervisor lo marque como "ya no necesita acompañamiento".
5. **Compatibilidad barco-personal:** si un barco requiere una habilidad específica (ej. equipo de buceo), solo se sugiere personal marcado con esa habilidad.
6. **Bloqueo en temporada alta:** días marcados como "alta demanda" (ej. feriados) donde no se aprueban días libres salvo excepción del Gerente/Dueño.
7. **Registro de anulación manual:** cada vez que el Encargado cambia la sugerencia del sistema, se guarda el motivo (opcional) — útil para que el algoritmo "aprenda" patrones reales con el tiempo, aunque eso ya sería una mejora futura (no v1).
8. **Alerta de desequilibrio:** si al cierre de la semana una persona trabajó muchos más turnos que el promedio del equipo, se le avisa al Gerente para ajustar la próxima semana.

---

## 7. Próximos pasos

- [ ] Confirmar cuáles reglas de la sección 6 quieres activar para la v1 (puede ser ninguna por ahora, y agregarlas después).
- [ ] Documento de gestión operativa general (políticas de la empresa: vacaciones, feriados, etc.) — pendiente de definir alcance.
