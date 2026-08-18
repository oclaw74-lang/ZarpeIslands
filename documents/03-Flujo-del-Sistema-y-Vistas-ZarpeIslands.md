# Documento 3: Flujo del Sistema y Vistas
## Proyecto: Zarpe Islands (nombre provisional)

> Alcance de este documento: define QUÉ pantallas existen y CÓMO fluye la operación diaria, según el tipo de usuario. Los roles exactos y sus permisos detallados se cierran en el Documento 4. Aquí se usan roles funcionales generales (personal de barco, encargado, gerente, secretaría, dueño) para describir el flujo.

**Fuera de alcance por ahora (pero la arquitectura no lo bloquea):** reservas de clientes/turistas desde la app. Se deja como módulo futuro.

---

## 1. Flujo general de la app (todos los usuarios)

1. **Login** — correo/usuario + contraseña (Supabase Auth). Recuperar contraseña disponible.
2. Si el usuario pertenece a más de una empresa (caso multi-tenant futuro) → selector de empresa.
3. **Home / Dashboard** — distinto según el rol (ver secciones abajo).
4. **Notificaciones** — campana con avisos: mantenimiento próximo a vencer, solicitud aprobada/rechazada, cambio de turno, recordatorio de ponche.
5. **Perfil** — datos personales, idioma de la app (inglés/español), cerrar sesión.

**Indicador de conexión:** en todas las pantallas donde se registra algo (ponche, propina, incidente), un indicador discreto muestra "Sin conexión — se guardará y sincronizará después" cuando no hay señal, sin bloquear al usuario.

---

## 2. Vistas — Personal de barco (tripulación)

### 2.1 Home
- Tarjeta principal: "Tu turno de hoy" → barco asignado, horario, y botón grande de **Ponchar entrada / Ponchar salida**.
- Estado actual (dentro de turno / fuera de turno).
- Acceso rápido a: Mi horario, Registrar propina, Solicitudes.

### 2.2 Ponche (entrada/salida)
- Botón único que cambia de estado según corresponda.
- Captura automática de fecha/hora y (si el dispositivo lo permite) ubicación GPS — funciona offline, se sincroniza después.
- Confirmación visual clara ("Entrada registrada 8:02 AM").
- Alerta suave si ponchan fuera del horario esperado (no bloquea, solo informa y queda marcado para el supervisor).

### 2.3 Registrar propina
- Selecciona el barco/turno del día (normalmente ya viene preseleccionado).
- Monto (USD).
- Tipo: **Individual** o **Compartida con la tripulación** (si es compartida, se indica entre cuántas personas se divide, o se reparte automáticamente entre los asignados al turno).
- Nota opcional / foto del recibo (opcional).

### 2.4 Mi horario
- Vista semanal: qué barco le toca cada día, con quién, y en qué horario.
- Indicador de rotación (ej. "Te toca descanso" / "Turno completo").

### 2.5 Solicitudes
- Nueva solicitud de: **día libre**, **cambio de turno**, **reporte de falla/incidente del barco** (con descripción y foto).
- Historial de solicitudes con estado: pendiente / aprobada / rechazada.

### 2.6 Mi historial
- Horas trabajadas por semana/mes.
- Propinas registradas por semana/mes.
- (Solo lectura — no puede editar registros pasados; correcciones se piden a un supervisor.)

---

## 3. Vistas — Encargado / Supervisor (control en el muelle)

### 3.1 Home / Dashboard operativo
- Resumen del día: barcos activos, quién está asignado a cada uno, quién ya ponchó y quién falta.
- Alertas: mantenimientos vencidos o próximos a vencer, solicitudes pendientes de aprobar, ponches fuera de horario.

### 3.2 Asignación y rotación de personal
- Vista por barco: tripulación asignada hoy/esta semana.
- Botón **"Sugerir rotación"** → el sistema propone la asignación de la próxima semana/turno según disponibilidad, descansos y equidad de reparto.
- El encargado puede aceptar la sugerencia completa, o ajustar manualmente antes de confirmar.

### 3.3 Aprobar solicitudes
- Lista de solicitudes pendientes (días libres, cambios de turno, incidentes reportados).
- Aprobar / rechazar con nota opcional.
- Los incidentes de barco reportados se pueden convertir directamente en una tarea de mantenimiento.

### 3.4 Mantenimientos
- Calendario/lista de mantenimientos programados por barco (motor, casco, seguridad).
- Marcar como completado, adjuntar foto/nota, reprogramar.
- Alertas visuales por estado: al día (verde), próximo a vencer (ámbar), vencido (rojo).

### 3.5 Detalle de barco
- Info general del barco (nombre, capacidad, documentos).
- Tripulación de hoy.
- Historial de mantenimiento.
- Historial de incidentes reportados.

---

## 4. Vistas — Gerente / Manager

Incluye todo lo del Encargado, pero a nivel de **todos los barcos y todo el personal** (el Encargado puede estar limitado a los barcos que se le asignen, si el negocio crece).

### 4.1 Dashboard general
- Vista consolidada: todos los barcos, todo el personal, estado general del día.
- Indicadores clave: % de asistencia, mantenimientos pendientes, propinas del día/semana.

### 4.2 Gestión de personal
- Alta/baja de personal, edición de datos, asignación de rol.
- Documentos del personal (identificación, certificaciones, si aplica).

### 4.3 Reportes
- Horas trabajadas por persona/periodo.
- Propinas totales (individuales vs. compartidas) por persona, por barco, por periodo.
- Cumplimiento de mantenimiento por barco.
- Exportar reportes (PDF/Excel).

### 4.4 Aprobaciones de alto nivel
- Solicitudes que el encargado escaló, o configuración de políticas (ej. cuántos días libres seguidos se permiten).

---

## 5. Vistas — Secretaría / Administración

Enfoque documental y administrativo, no operativo en el muelle.

### 5.1 Documentos y facturación
- Generar factura/reporte formal (plantilla de la empresa) a partir de horas y propinas del periodo.
- Historial de documentos generados, exportables.

### 5.2 Expedientes de personal
- Documentos personales (cédula, certificaciones, contratos) — carga y consulta.

### 5.3 Reportes (solo lectura)
- Mismos reportes que el gerente ve, en modo consulta, para preparar nómina/pagos.

---

## 6. Vistas — Dueño / Owner

Vista de máximo nivel, pensada para consulta rápida más que operación diaria.

### 6.1 Dashboard ejecutivo
- Resumen general del negocio: todos los barcos, todo el personal, estado de mantenimiento, propinas totales del periodo.
- Comparativos simples (ej. esta semana vs. semana pasada).

### 6.2 Configuración de la empresa
- Datos de la empresa, barcos, políticas generales (reglas de rotación, tipos de mantenimiento, moneda).
- Gestión de roles y accesos (quién es gerente, encargado, etc.).

*(Si el producto se convierte en multi-empresa/SaaS, existiría además un rol de "Administrador de plataforma" fuera de cualquier empresa individual — para dar soporte y gestionar las cuentas de negocios clientes. Se documentará aparte si se llega a esa fase.)*

---

## 7. Flujos clave explicados

### 7.1 Flujo de ponche (con offline)
1. Personal abre la app → botón de ponche.
2. Si hay señal: se registra al instante en el servidor.
3. Si no hay señal: se guarda localmente con fecha/hora exacta del dispositivo.
4. Al recuperar señal, se sincroniza automáticamente. El supervisor ve el ponche aparecer con su hora real (no la hora de sincronización).

### 7.2 Flujo de rotación sugerida
1. El sistema conoce: personal disponible, últimos turnos trabajados, días libres aprobados, cantidad de barcos activos.
2. Genera una propuesta de asignación equilibrada (evita que siempre trabaje la misma gente o descanse la misma gente).
3. El encargado revisa, ajusta si hace falta, y confirma.
4. El personal recibe notificación de su nueva asignación.

### 7.3 Flujo de mantenimiento
1. Se programa mantenimiento (por fecha o por uso) para un barco: motor, casco o seguridad.
2. Sistema avisa cuando se acerca la fecha.
3. Responsable marca como completado, con nota/foto.
4. Si un mantenimiento vence sin completarse, se marca como atrasado y escala visualmente (rojo) en el dashboard de gerente/dueño.

### 7.4 Flujo de solicitud/aprobación
1. Personal crea solicitud (día libre, cambio de turno, incidente).
2. Encargado (o gerente si el encargado no tiene permiso) la revisa.
3. Se aprueba/rechaza con nota.
4. Si es un incidente de barco, se puede generar automáticamente una tarea de mantenimiento vinculada.

---

## 8. Próximos pasos

- [ ] Documento 4: Roles y permisos (matriz detallada + investigación de apps similares para afinar tipos de personal)
- [ ] Documento 5: Modelo de base de datos
