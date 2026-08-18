# Documento 5: Modelo de Base de Datos
## Proyecto: Zarpe Islands (nombre provisional)
### Motor: PostgreSQL (Supabase) — multi-tenant con Row Level Security (RLS)

---

## 1. Principios de diseño

1. **Multi-tenant desde el día uno:** casi todas las tablas tienen `company_id`. Ninguna fila puede existir sin saber a qué empresa pertenece.
2. **RLS como capa de seguridad real, no solo la app:** aunque la app filtre por rol, las políticas de RLS en Postgres son la barrera final — si alguien hiciera una consulta directa a la base, seguiría sin poder ver datos de otra empresa o de otro rol sin permiso.
3. **Todo lo sensible queda auditado:** aprobaciones, ediciones de registros pasados, cambios de rotación quedan en `audit_log`, porque hay dinero (propinas) e historial laboral de por medio.
4. **Offline-friendly:** las tablas que el personal edita desde el barco (`punches`, `tips`, `requests`) tienen campos para reconciliar sincronización (`created_offline`, `device_timestamp` vs `synced_at`).
5. **Catálogos configurables por empresa:** categorías de mantenimiento y puestos de trabajo viven en tablas propias, no en un `enum` fijo de Postgres — así cada empresa cliente (a futuro) puede ajustar nombres sin tocar el esquema.

---

## 2. Diagrama de entidades (resumen textual)

```
companies (1) ──< company_members >── (1) auth.users (Supabase Auth)
companies (1) ──< boats
companies (1) ──< job_positions (catálogo)
companies (1) ──< maintenance_categories (catálogo)

boats (1) ──< boat_supervisors >── company_members   [Encargado ↔ Barco]
boats (1) ──< boat_assignments >── company_members    [Rotación / turnos]
boats (1) ──< maintenance_tasks
boats (1) ──< tips

boat_assignments (1) ──< punches
boat_assignments (1) ──< tips (opcional, referencia al turno)

company_members (1) ──< punches
company_members (1) ──< requests
company_members (1) ──< documents
company_members (1) ──< tip_splits

tips (1) ──< tip_splits

requests (1) ──0..1── maintenance_tasks   [incidente → tarea de mantenimiento]

companies (1) ──< generated_reports
companies (1) ──< notifications >── company_members
companies (1) ──< audit_log
companies (1) ──< company_settings (1:1)
```

---

## 3. Tablas principales

### 3.1 `companies` (empresas / tenants)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `name` | text | |
| `country` | text | |
| `default_currency` | text | ej. `USD` |
| `default_language` | text | `en` / `es` |
| `timezone` | text | ej. `America/Santo_Domingo` |
| `is_active` | boolean | para suspender una empresa cliente en el futuro modelo SaaS |
| `created_at` | timestamptz | |

### 3.2 `company_members` (personas dentro de una empresa)

Reemplaza un simple "usuarios" porque separa la **identidad** (auth.users, gestionada por Supabase Auth) de la **membresía** (rol y datos dentro de una empresa específica). Esto permite que, en el futuro, una misma persona pueda pertenecer a más de una empresa (ej. un administrador de plataforma, o un dueño con dos negocios).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `auth_user_id` | uuid, FK → auth.users | |
| `full_name` | text | |
| `email` | text | |
| `phone` | text | |
| `access_role` | text (check) | `owner` / `manager` / `supervisor` / `secretary` / `crew` |
| `job_position_id` | uuid, FK → job_positions | nulo si no es personal operativo |
| `preferred_language` | text | `en` / `es` |
| `is_active` | boolean | para dar de baja sin borrar historial |
| `hired_at` | date | |
| `created_at` | timestamptz | |

**Índice único:** (`company_id`, `auth_user_id`) — una persona, una membresía por empresa.

### 3.3 `job_positions` (catálogo de puestos — Capitán, Marinero, Mecánico, Guía, Otro)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `name` | text | ej. "Capitán", "Marinero", "Mecánico", "Guía turístico" |
| `is_required_per_shift` | boolean | ej. `true` para Capitán (regla mínima de rotación) |
| `created_at` | timestamptz | |

### 3.4 `boats` (barcos)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `name` | text | |
| `registration_number` | text | matrícula |
| `boat_type` | text (check) | `excursion` / `rental` / `mixed` |
| `capacity` | int | pasajeros |
| `status` | text (check) | `active` / `in_maintenance` / `inactive` |
| `notes` | text | |
| `created_at` | timestamptz | |

### 3.5 `boat_supervisors` (qué Encargado ve qué barco)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `boat_id` | uuid, FK → boats | |
| `company_member_id` | uuid, FK → company_members | debe tener `access_role = supervisor` |
| `created_at` | timestamptz | |

### 3.6 `boat_assignments` (asignación / rotación / turnos)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `boat_id` | uuid, FK → boats | |
| `company_member_id` | uuid, FK → company_members | tripulante asignado |
| `job_position_id` | uuid, FK → job_positions | rol que cumple ese día (puede variar del puesto habitual) |
| `shift_date` | date | |
| `shift_start` | time | |
| `shift_end` | time | |
| `status` | text (check) | `scheduled` / `confirmed` / `completed` / `cancelled` |
| `source` | text (check) | `manual` / `suggested_rotation` |
| `created_by` | uuid, FK → company_members | |
| `created_at` | timestamptz | |

### 3.7 `punches` (ponche entrada/salida)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `company_member_id` | uuid, FK → company_members | |
| `boat_assignment_id` | uuid, FK → boat_assignments | nulo si ponchó sin turno asignado (caso excepcional) |
| `punch_type` | text (check) | `in` / `out` |
| `device_timestamp` | timestamptz | hora real capturada en el dispositivo (aunque esté offline) |
| `synced_at` | timestamptz | cuándo llegó al servidor |
| `latitude` / `longitude` | numeric | opcional, si el dispositivo lo permite |
| `created_offline` | boolean | `true` si se generó sin conexión |
| `flagged_out_of_schedule` | boolean | se marca automáticamente si no coincide con `boat_assignments` |
| `created_at` | timestamptz | |

### 3.8 `tips` (propinas)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `boat_id` | uuid, FK → boats | |
| `boat_assignment_id` | uuid, FK → boat_assignments | opcional, referencia al turno |
| `reported_by` | uuid, FK → company_members | quien la registró |
| `amount` | numeric(10,2) | |
| `currency` | text | `USD` por defecto |
| `tip_type` | text (check) | `individual` / `pool` |
| `shift_date` | date | |
| `note` | text | |
| `receipt_photo_url` | text | opcional |
| `created_offline` | boolean | |
| `created_at` | timestamptz | |

### 3.9 `tip_splits` (reparto de propinas — individual o entre tripulación)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `tip_id` | uuid, FK → tips | |
| `company_member_id` | uuid, FK → company_members | quién recibe esta parte |
| `share_amount` | numeric(10,2) | monto que le corresponde |
| `created_at` | timestamptz | |

> Si `tip_type = individual`, se genera una sola fila en `tip_splits` con el monto completo para `reported_by`. Si `tip_type = pool`, se generan varias filas (una por cada tripulante del turno), repartiendo el monto según la regla configurada (equitativo por defecto).

### 3.10 `maintenance_categories` (catálogo — motor, casco, seguridad, otro)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `name` | text | `Motor y mecánica` / `Casco y pintura` / `Seguridad` / `Otro` |
| `created_at` | timestamptz | |

### 3.11 `maintenance_tasks` (mantenimientos programados)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `boat_id` | uuid, FK → boats | |
| `category_id` | uuid, FK → maintenance_categories | |
| `title` | text | |
| `description` | text | |
| `scheduled_date` | date | |
| `is_recurring` | boolean | |
| `recurrence_interval_days` | int | nulo si no es recurrente |
| `status` | text (check) | `pending` / `in_progress` / `completed` / `overdue` |
| `assigned_to` | uuid, FK → company_members | nulo si no se ha asignado |
| `source` | text (check) | `scheduled` / `incident_report` |
| `linked_request_id` | uuid, FK → requests | si nació de un incidente reportado |
| `completed_at` | timestamptz | |
| `completed_by` | uuid, FK → company_members | |
| `completed_note` | text | |
| `photo_before_url` / `photo_after_url` | text | |
| `created_at` | timestamptz | |

### 3.12 `requests` (solicitudes: día libre, cambio de turno, incidente)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `company_member_id` | uuid, FK → company_members | quien solicita |
| `request_type` | text (check) | `day_off` / `shift_change` / `incident` |
| `status` | text (check) | `pending` / `approved` / `rejected` |
| `date_range_start` / `date_range_end` | date | para `day_off` |
| `target_boat_assignment_id` | uuid, FK → boat_assignments | para `shift_change` |
| `incident_boat_id` | uuid, FK → boats | para `incident` |
| `description` | text | |
| `photo_url` | text | opcional, para incidentes |
| `reviewed_by` | uuid, FK → company_members | |
| `reviewed_at` | timestamptz | |
| `review_note` | text | |
| `created_at` | timestamptz | |

### 3.13 `documents` (expedientes de personal y documentos de la empresa)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `company_member_id` | uuid, FK → company_members | nulo si es un documento a nivel de empresa/barco |
| `boat_id` | uuid, FK → boats | nulo si es de personal |
| `doc_type` | text (check) | `id_card` / `certification` / `contract` / `boat_registration` / `other` |
| `file_url` | text | (Supabase Storage) |
| `issued_date` | date | |
| `expiry_date` | date | opcional, útil para alertas de certificaciones vencidas |
| `uploaded_by` | uuid, FK → company_members | |
| `created_at` | timestamptz | |

### 3.14 `generated_reports` (facturas / reportes formales generados)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `report_type` | text (check) | `invoice` / `hours_report` / `tips_report` |
| `period_start` / `period_end` | date | |
| `total_amount` | numeric(10,2) | opcional |
| `file_url` | text | PDF generado |
| `generated_by` | uuid, FK → company_members | |
| `created_at` | timestamptz | |

### 3.15 `notifications`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `company_member_id` | uuid, FK → company_members | destinatario |
| `type` | text | `maintenance_due` / `request_approved` / `request_rejected` / `shift_reminder` / etc. |
| `title` / `body` | text | |
| `related_entity_type` / `related_entity_id` | text / uuid | referencia genérica (tarea, solicitud, turno) |
| `read_at` | timestamptz | nulo si no se ha leído |
| `created_at` | timestamptz | |

### 3.16 `audit_log` (auditoría)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | |
| `company_id` | uuid, FK → companies | |
| `actor_id` | uuid, FK → company_members | quién hizo la acción |
| `action` | text | `approve_request` / `edit_punch` / `complete_maintenance` / etc. |
| `entity_type` / `entity_id` | text / uuid | qué se modificó |
| `before_data` / `after_data` | jsonb | snapshot antes/después |
| `created_at` | timestamptz | |

### 3.17 `company_settings` (configuración por empresa — 1:1 con `companies`)

| Campo | Tipo | Notas |
|---|---|---|
| `company_id` | uuid, PK, FK → companies | |
| `min_captains_per_shift` | int | regla mínima de rotación (default 1) |
| `punch_requires_location` | boolean | |
| `tip_pool_split_method` | text (check) | `equal` / `by_role_weight` (futuro) |
| `days_off_max_consecutive` | int | política configurable |
| `updated_at` | timestamptz | |

---

## 4. Cómo se aplica la matriz de permisos (Documento 4) con RLS

RLS en Postgres funciona por tabla: cada consulta se filtra automáticamente según quién está autenticado. Reglas generales que se implementan:

- **Aislamiento por empresa (todas las tablas):** `company_id = (SELECT company_id FROM company_members WHERE auth_user_id = auth.uid())`. Ninguna fila de otra empresa es visible, sin excepción.
- **Owner / Manager:** política adicional que da acceso a **todas** las filas dentro de su `company_id`, sin restricción de barco.
- **Encargado (supervisor):** política que solo permite ver/editar filas de `boats`, `boat_assignments`, `maintenance_tasks`, `requests` donde `boat_id IN (SELECT boat_id FROM boat_supervisors WHERE company_member_id = auth.uid())`.
- **Secretaría:** acceso de lectura amplio (`SELECT`) en tablas operativas, pero las políticas de `INSERT`/`UPDATE` solo se conceden en `documents` y `generated_reports`.
- **Personal Operativo (crew):** en `punches`, `tips`, `requests`, `documents` → política restringida a `company_member_id = (SELECT id FROM company_members WHERE auth_user_id = auth.uid())`. No pueden ver filas de otros compañeros.
- **Aprobaciones:** a nivel de aplicación (no solo RLS) se valida que `reviewed_by ≠ company_member_id` de la solicitud, para cumplir la segregación de funciones del Documento 4.

---

## 5. Notas para la sincronización offline (PowerSync)

- Las tablas que el personal edita desde el barco sin señal (`punches`, `tips`, `requests`) deben estar incluidas en las **reglas de sincronización** de PowerSync limitadas al propio `company_member_id` — así el teléfono solo descarga/sube lo que le corresponde a esa persona, no toda la base de datos de la empresa.
- `device_timestamp` siempre se respeta como la hora real del evento, aunque `synced_at` sea posterior (a veces horas después, cuando el barco vuelve a tener señal).

---

## 6. Próximos pasos

- [ ] Validar esta matriz contigo antes de generar el script SQL de creación (migraciones) — ese sí ya sería código, para cuando decidamos pasar a esa fase.
- [ ] Definir el algoritmo exacto de "rotación sugerida" (reglas de equidad, descansos mínimos) como documento aparte o como sección ampliada de este documento.
