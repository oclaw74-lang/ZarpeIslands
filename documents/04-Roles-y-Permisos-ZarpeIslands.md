# Documento 4: Roles y Permisos
## Proyecto: Zarpe Islands (nombre provisional)

---

## 1. Investigación de referencia

Antes de definir los roles finales, se revisaron sistemas de gestión de personal de sectores comparables (hostelería/hoteles y agencias de turismo, que son los que más se parecen a un negocio de excursiones en islas):

- **Software de turnos hoteleros** (Shyfter, Workant, Kronjop): el patrón común es que un **"responsable"/jefe de departamento** solo ve y gestiona al personal que tiene directamente asignado, no a toda la empresa — esto es clave para nuestro rol de "Encargado", que debe estar limitado a sus barcos, no a todos.
- **Tour Agency App** (gestión de agencias de turismo): usa **permisos granulares por módulo** (reservas, personal, finanzas, reportes) y aplica dos principios que vamos a adoptar:
  - **Principio de menor privilegio:** cada usuario tiene solo los permisos mínimos que necesita para su trabajo.
  - **Segregación de funciones:** quien opera algo no debería ser quien lo aprueba (ej. quien pide un día libre no se lo aprueba a sí mismo).
- **Roles de tripulación reales en embarcaciones** (referencia marítima): Capitán/Patrón, Marinero/Deckhand, Mecánico/Jefe de máquinas, Guía turístico son los puestos más comunes en embarcaciones pequeñas de turismo — a diferencia de un crucero grande, no se necesitan roles como "Maître" o "camarero de cabina".

**Conclusión aplicada:** en Zarpe Islands separamos dos conceptos que muchas veces se confunden:
1. **Rol de acceso** (qué puede ver/hacer en la app) — Dueño, Gerente, Encargado, Secretaría, Personal Operativo.
2. **Puesto de trabajo** (su función real en el barco) — Capitán, Marinero, Mecánico, Guía, etc. Esto no cambia sus permisos en la app, pero sí importa para la rotación (ej. todo barco necesita al menos un Capitán asignado) y para los reportes.

---

## 2. Roles de acceso (definitivos)

| Rol | Quién lo ocupa normalmente | Alcance |
|---|---|---|
| **Dueño (Owner)** | Propietario del negocio | Todo — todos los barcos, todo el personal, configuración de la empresa |
| **Gerente (Manager)** | Administrador general del negocio | Todo lo operativo y reportes — todos los barcos |
| **Encargado (Supervisor)** | Supervisor en el muelle | Solo los barcos/personal que se le asignen |
| **Secretaría (Admin. de oficina)** | Administración/documentación | Documentos, facturación, expedientes — sin poder operativo (no asigna rotación) |
| **Personal Operativo (Crew)** | Tripulación de los barcos | Solo sus propios datos (horario, ponche, propinas, solicitudes) |

> Nota sobre "Contador/Finanzas": no lo agregamos como rol separado por ahora porque Secretaría ya cubre esa necesidad a la escala actual (11-30 personas, 1-5 barcos). Si el negocio crece o se vende a otras empresas, se puede agregar como rol adicional sin rediseñar el sistema — quedaría con acceso de solo lectura a reportes financieros/propinas, sin acceso operativo.

---

## 3. Puestos de trabajo (atributo del personal operativo)

Este campo se asigna a cada persona del **Personal Operativo** y se usa para la lógica de rotación y reportes — **no afecta permisos de la app** (todos los puestos ven la misma interfaz de "Personal Operativo").

| Puesto | Función a bordo |
|---|---|
| **Capitán / Patrón** | Dirige la embarcación, responsable de la seguridad y navegación |
| **Marinero / Deckhand** | Maniobras, cabos, apoyo general a bordo |
| **Mecánico** | Mantenimiento y reparación de motor y sistemas |
| **Guía turístico** | Atiende a los pasajeros/clientes, explica el tour |
| **Otro** (personalizable) | Ej. cocinero, personal de limpieza, ayudante — según crezca el negocio |

Regla de rotación sugerida (a definir con más detalle en el algoritmo): cada barco activo debe tener como mínimo un Capitán/Patrón asignado en su turno; el resto de los puestos se reparten según disponibilidad.

---

## 4. Matriz de permisos por módulo

Leyenda: ✅ Sí | ❌ No | 🟡 Limitado/con condición

| Módulo / Acción | Dueño | Gerente | Encargado | Secretaría | Personal Operativo |
|---|---|---|---|---|---|
| Ver dashboard de **todos** los barcos | ✅ | ✅ | ❌ (solo los suyos) | ✅ (solo lectura) | ❌ |
| Crear / editar barcos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Programar mantenimiento | ✅ | ✅ | 🟡 (solo sus barcos) | ❌ | ❌ |
| Marcar mantenimiento completado | ✅ | ✅ | 🟡 (solo sus barcos) | ❌ | 🟡 (solo si se le asigna la tarea) |
| Asignar / rotar personal | ✅ | ✅ | 🟡 (solo sus barcos) | ❌ | ❌ |
| Ver sugerencia de rotación automática | ✅ | ✅ | ✅ | ❌ | ❌ |
| Aprobar solicitudes (día libre, cambio turno, incidente) | ✅ | ✅ | 🟡 (solo su personal) | ❌ | ❌ |
| Crear solicitud propia | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ponchar entrada/salida (propio) | — | — | — | — | ✅ |
| Ver ponches de todo el personal | ✅ | ✅ | 🟡 (solo su personal) | ✅ (solo lectura) | ❌ |
| Registrar propina propia | — | — | — | — | ✅ |
| Ver reportes de propinas y horas (todos) | ✅ | ✅ | 🟡 (solo su personal) | ✅ | ❌ (solo lo propio) |
| Ver su propio historial (horas/propinas) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Generar facturas / documentos formales | ✅ | ✅ | ❌ | ✅ | ❌ |
| Gestionar expedientes de personal (documentos) | ✅ | ✅ | ❌ | ✅ | 🟡 (solo los suyos) |
| Alta / baja de personal | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestionar roles y permisos | ✅ | 🟡 (según lo habilite el dueño) | ❌ | ❌ | ❌ |
| Configuración general de la empresa | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Reglas de alcance (scope) importantes

- **Encargado limitado a sus barcos:** si el negocio crece a más barcos, se puede tener más de un Encargado, cada uno viendo solo lo que se le asignó — igual que el patrón visto en software de turnos hoteleros ("responsable ve solo su departamento").
- **Segregación de funciones:** una persona no puede aprobar su propia solicitud. Si un Encargado pide un día libre, la aprobación sube automáticamente a Gerente/Dueño.
- **Personal Operativo nunca ve datos de otros compañeros** (ni horas, ni propinas, ni documentos) — solo lo propio. Esto evita conflictos internos y protege la privacidad del equipo.
- **Secretaría es de solo lectura en lo operativo** — puede generar documentos y ver reportes, pero no puede asignar personal ni aprobar solicitudes (para mantener la separación entre "quién opera" y "quién administra papeles").

---

## 6. Rol futuro (si el producto se vende a otras empresas)

- **Administrador de plataforma:** rol fuera de cualquier empresa individual, para dar soporte técnico y gestionar las cuentas de negocios clientes (activar/desactivar empresas, soporte). No tiene acceso a los datos operativos de ninguna empresa salvo lo estrictamente necesario para soporte. Se documentará en detalle si el proyecto avanza a esa fase.

---

## 7. Próximos pasos

- [ ] Documento 5: Modelo de base de datos (tablas, relaciones, políticas RLS que implementen esta matriz de permisos)
