# Detalle de backlog — Zarpe Islands

Formato por ticket: historia de usuario, dependencias, reglas de negocio, valor entregado, acceptance criteria numerados. Listo para copiar al crear el issue de GitHub (Step 6 de `agteamos-new-project`, modo incremental — ver `backlog.md`).

Convención de dependencias: IDs de esta misma lista. "Ninguna" = puede empezar sin bloqueos de otro ticket del backlog (puede seguir dependiendo de Epic A como fundación general).

---

## Epic A — Project Foundation & Scaffold

**Objetivo:** dejar el proyecto Expo/TypeScript andando, con Supabase, i18n, PowerSync y push notifications conectados, para que toda epic posterior construya sobre una base común — sin esto, ningún otro ticket puede empezar.

### A1. Inicializar proyecto Expo + TypeScript
**Como** equipo de desarrollo, **necesito** un proyecto Expo con TypeScript, linting y estructura de carpetas definida, **para** tener una base consistente donde construir cada feature.

- Depende de: Ninguna
- Fuente: `documents/02` sección 2.1

**Reglas de negocio / notas técnicas:**
- `npx create-expo-app` con template TypeScript.
- Estructura de carpetas por dominio (ej. `src/features/<epic>/`, `src/shared/`), no por tipo de archivo.
- ESLint + Prettier configurados; scripts `lint`, `test`, `typecheck` en `package.json` (consumidos por `.github/workflows/ci.yml`, que ya detecta `package.json` y activa estos pasos).
- Navegación base (React Navigation) con stack vacío y placeholder de Home.

**Valor entregado:** habilita que `npm ci && npm run lint && npm test` corran en CI en vez de saltarse (ver nota en `ci.yml`).

**Acceptance Criteria:**
1. `npm run lint`, `npm test` y `npx tsc --noEmit` corren sin errores sobre el scaffold vacío.
2. La app arranca en un emulador/dispositivo Android vía Expo Go o dev build sin errores en consola.
3. Estructura de carpetas documentada en un `README.md` corto dentro de `src/`.
4. El job de CI (`.github/workflows/ci.yml`) pasa a ejecutar lint/test reales (ya no el mensaje de "no existe package.json").

---

### A2. Cliente Supabase + configuración de entorno tipada
**Como** desarrollador, **necesito** un cliente Supabase configurado y variables de entorno tipadas, **para** que cualquier feature pueda leer/escribir a Postgres/Auth/Storage sin repetir configuración.

- Depende de: A1
- Fuente: `documents/02` sección 2.2, `.env.example`

**Reglas de negocio / notas técnicas:**
- Cliente inicializado desde `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (ya en `.env.example`).
- Módulo de config central que valida al arrancar que las env vars requeridas existen (falla rápido y claro si falta una, no un error críptico más adelante).
- No se commitean valores reales (`.env` está en `.gitignore` — verificar).

**Valor entregado:** cualquier ticket de las epics B en adelante puede importar el cliente Supabase ya configurado, sin duplicar setup.

**Acceptance Criteria:**
1. `supabase.auth`, `supabase.from(...)` y `supabase.storage` funcionan contra un proyecto Supabase de desarrollo real.
2. Si falta una variable de entorno requerida, la app muestra un error claro al arrancar (no un crash silencioso).
3. `.env` está en `.gitignore`; `.env.example` queda como única referencia versionada.

---

### A3. i18n base (inglés/español)
**Como** usuario de cualquier rol, **necesito** que la interfaz esté disponible en inglés y español desde el primer componente, **para** que ningún ticket posterior tenga que "traducir después".

- Depende de: A1
- Fuente: `documents/01` sección 1, `documents/02` sección 2.7, `mission.md` (Definition of Done #7)

**Reglas de negocio / notas técnicas:**
- `i18next` + `react-i18next`, inglés como locale base del código (claves en inglés, ej. `punch.clockIn`), español como segundo archivo de traducción completo desde el día uno.
- Estructura de archivos por namespace/feature (ej. `locales/en/punch.json`, `locales/es/punch.json`) para que cada epic agregue su propio namespace sin tocar un archivo gigante compartido.
- Helper/hook estándar (`useTranslation` o wrapper propio) que el resto de los tickets debe usar — ningún string de UI se hardcodea desde A3 en adelante.

**Valor entregado:** vuelve estructural la regla "sin traducciones, el ticket no está terminado" (Definition of Done, `mission.md`).

**Acceptance Criteria:**
1. Cambiar el locale del dispositivo (o un selector de prueba) cambia el idioma de un componente placeholder sin reiniciar la app.
2. Existe al menos un namespace de ejemplo (`common`) con claves en `en` y `es`.
3. Se documenta en `src/README.md` (de A1) cómo agregar un namespace nuevo por feature.

---

### A4. PowerSync + esquema SQLite local
**Como** personal de barco, **necesito** que la app tenga una base de datos local que funcione sin señal, **para** poder ponchar/registrar propinas en altamar y que se sincronice después.

- Depende de: A2
- Fuente: `documents/02` sección 2.3, `documents/05` sección 1 (offline-friendly) y sección 5

**Reglas de negocio / notas técnicas:**
- PowerSync conectado a Supabase; esquema SQLite local espejo de las tablas que se editan offline: `punches`, `tips`, `requests` (ver `documents/05` sección 5).
- Reglas de sincronización limitadas al propio `company_member_id` — el teléfono no descarga toda la base de la empresa, solo lo que le corresponde a esa persona.
- Resolución de conflictos por defecto: "gana el último cambio", con registro de auditoría de ambos intentos (queda para Epic D/G implementar el detalle en cada tabla, acá solo el mecanismo base).

**Valor entregado:** desbloquea Epic D (ponche offline) y partes de Epic F/G que dependen de escritura local-first.

**Acceptance Criteria:**
1. Con el dispositivo en modo avión, una escritura de prueba a una tabla local (ej. `punches`) se guarda y es legible localmente de inmediato.
2. Al recuperar conexión, la escritura pendiente se sincroniza a Supabase automáticamente, sin acción manual del usuario.
3. Las reglas de sync están limitadas por `company_member_id` — un usuario no descarga localmente datos de otro compañero.

---

### A5. Wiring de push notifications
**Como** usuario de cualquier rol, **necesito** que la app pueda pedir permiso y registrar mi dispositivo para notificaciones push, **para** recibir avisos de mantenimiento, solicitudes y turnos (Epic K construye sobre esto).

- Depende de: A1
- Fuente: `documents/02` sección 2.4

**Reglas de negocio / notas técnicas:**
- Expo Notifications, con fallback/integración a Firebase Cloud Messaging para Android.
- Flujo de permiso: se pide en un momento con contexto (no apenas abre la app por primera vez sin explicación).
- Token de push guardado asociado al `company_member_id` (tabla a definir en Epic K — acá solo el wiring de obtención y guardado local temporal).

**Valor entregado:** Epic K (notificaciones) puede enviar/recibir sin resolver primero el registro de dispositivo.

**Acceptance Criteria:**
1. La app solicita permiso de notificaciones con un mensaje de contexto antes del prompt nativo.
2. Se obtiene un Expo push token válido y se loguea/guarda localmente para verificación manual en esta etapa.
3. Una notificación de prueba enviada vía Expo push tool llega al dispositivo.

---

## Epic B — Auth & Company Bootstrap

**Objetivo:** que un usuario pueda loguearse, que exista al menos una empresa (`company`) con su primer Owner, y que cada rol vea el Home que le corresponde.

### B1. Login y recuperación de contraseña
**Como** cualquier usuario, **necesito** loguearme con correo/contraseña y poder recuperar mi contraseña, **para** acceder a la app.

- Depende de: A2
- Fuente: `documents/03` sección 1, paso 1

**Acceptance Criteria:**
1. Login exitoso con credenciales válidas redirige al Home correspondiente al rol (placeholder hasta B3).
2. Credenciales inválidas muestran error claro sin filtrar si el error es de usuario o contraseña (buena práctica de seguridad).
3. Flujo de "olvidé mi contraseña" envía email de recuperación vía Supabase Auth y permite establecer una nueva.

---

### B2. Bootstrap de empresa
**Como** primer usuario de un negocio, **necesito** poder crear mi empresa al registrarme, **para** empezar a usar la app como Owner.

- Depende de: B1
- Fuente: `documents/05` sección 3.1, 3.2

**Reglas de negocio:**
- Crear una fila en `companies` (name, country, default_currency, default_language, timezone, is_active=true).
- Crear la membresía en `company_members` para el usuario recién registrado con `access_role = owner`.

**Acceptance Criteria:**
1. Al completar el registro, se crea `companies` + `company_members` (owner) en una sola operación transaccional (si falla la membresía, no debe quedar una empresa huérfana).
2. El índice único (`company_id`, `auth_user_id`) se respeta — no se puede duplicar membresía.
3. El Owner recién creado ve el dashboard ejecutivo vacío (sin barcos/personal todavía) tras el bootstrap.

---

### B3. Sesión persistente + routing por rol
**Como** usuario logueado, **necesito** que la app recuerde mi sesión y me lleve al Home correcto según mi rol, **para** no tener que loguearme cada vez ni ver pantallas que no me corresponden.

- Depende de: B1, B2
- Fuente: `documents/03` secciones 2-6

**Acceptance Criteria:**
1. Cerrar y reabrir la app mantiene la sesión activa (hasta expiración/logout explícito).
2. Cada `access_role` (`owner`, `manager`, `supervisor`, `secretary`, `crew`) aterriza en el Home descrito en `documents/03` para ese rol (aunque el contenido interno de cada Home se construya en epics posteriores — acá solo el routing y un placeholder correcto por rol).
3. Un usuario sin membresía activa (`is_active = false`) no puede entrar, con mensaje claro.

---

### B4. CRUD de `company_members`
**Como** Owner o Manager, **necesito** dar de alta, editar y dar de baja personal, **para** mantener actualizado quién trabaja en el negocio y con qué rol/puesto.

- Depende de: B2, C2 (job_positions)
- Fuente: `documents/04` sección 4 (matriz: alta/baja solo Owner/Manager), `documents/05` sección 3.2

**Acceptance Criteria:**
1. Owner/Manager pueden crear un `company_member` con `full_name`, `email`, `phone`, `access_role`, `job_position_id` (nulo si no es personal operativo), `preferred_language`, `hired_at`.
2. Dar de baja marca `is_active = false` sin borrar el registro (se preserva historial de horas/propinas).
3. Encargado/Secretaría/Crew no pueden acceder a esta pantalla (verificado en UI y por RLS de B5).

---

### B5. RLS de `companies` y `company_members`
**Como** sistema, **necesito** que las políticas de RLS impidan que una empresa vea datos de otra y que cada rol solo edite lo que le corresponde, **para** que la seguridad no dependa únicamente del filtrado en la app.

- Depende de: B2
- Fuente: `documents/05` sección 4

**Acceptance Criteria:**
1. Una consulta directa a `company_members` autenticada como usuario de la Empresa X no devuelve filas de la Empresa Y, incluso sin pasar por la app.
2. Owner/Manager tienen `SELECT`/`INSERT`/`UPDATE` sobre todo `company_id` propio; Encargado solo sobre su alcance (ver C4); Secretaría solo lectura; Crew solo su propia fila.
3. Test automatizado (o script de verificación) que ejercita al menos un caso de cada rol contra estas políticas.

---

### B6. Perfil (datos, idioma, logout)
**Como** cualquier usuario, **necesito** ver mis datos, cambiar el idioma de la app y cerrar sesión, **para** controlar mi cuenta sin ayuda de un administrador.

- Depende de: A3, B3
- Fuente: `documents/03` sección 1, paso 5

**Acceptance Criteria:**
1. La pantalla de Perfil muestra nombre, email, rol y puesto (si aplica) en modo solo lectura.
2. Cambiar el idioma en Perfil traduce toda la UI ya construida hasta el momento, sin reiniciar la app (usa el mecanismo de A3).
3. "Cerrar sesión" invalida la sesión local y de Supabase Auth, y regresa a la pantalla de Login.

---

## Epic C — Boats & Job Positions

**Objetivo:** que existan barcos y catálogo de puestos configurables por empresa, base para asignación, mantenimiento y rotación.

### C1. CRUD de `boats`
**Como** Owner o Manager, **necesito** crear y editar barcos, **para** tener el inventario de embarcaciones del negocio.

- Depende de: B2
- Fuente: `documents/05` sección 3.4

**Acceptance Criteria:**
1. Crear un barco con `name`, `registration_number`, `boat_type` (`excursion`/`rental`/`mixed`), `capacity`, `status` (`active`/`in_maintenance`/`inactive`), `notes`.
2. Cambiar `status` a `inactive` lo excluye de las vistas de asignación/rotación activa (Epic E) sin borrarlo.
3. Solo Owner/Manager pueden crear/editar (Encargado no, según matriz de `documents/04`).

---

### C2. Catálogo de `job_positions`
**Como** Owner o Manager, **necesito** definir los puestos de trabajo de mi empresa, **para** clasificar al personal operativo y aplicar reglas de rotación.

- Depende de: B2
- Fuente: `documents/04` sección 3, `documents/06` sección 5

**Acceptance Criteria:**
1. Catálogo pre-cargado por defecto con Capitán/Patrón, Marinero/Deckhand, Mecánico, Guía turístico, Otro — editable por empresa.
2. Cada puesto tiene `is_required_per_shift` (true por defecto para Capitán) y `rotation_repeat_allowed` (true por defecto para Capitán; Manager se maneja como excepción de rol, no de puesto — ver Epic E).
3. Cambiar `is_required_per_shift` de un puesto afecta la validación de cobertura mínima que usará Epic E (sin implementar el algoritmo acá, solo el dato).

---

### C3. Detalle de barco
**Como** Encargado o Gerente, **necesito** ver el detalle de un barco (info, tripulación de hoy, historial), **para** tener contexto completo antes de operar sobre él.

- Depende de: C1
- Fuente: `documents/03` sección 3.5

**Acceptance Criteria:**
1. La vista muestra info general, tripulación asignada hoy (placeholder hasta que exista Epic E), historial de mantenimiento (placeholder hasta Epic H) e historial de incidentes (placeholder hasta Epic G).
2. Encargado solo ve el detalle de barcos dentro de su alcance (`boat_supervisors`, ver C4); Gerente/Owner ven cualquier barco de su empresa.

---

### C4. RLS de `boats` y `job_positions`, alcance por `boat_supervisors`
**Como** sistema, **necesito** que un Encargado solo pueda ver/editar los barcos que se le asignaron, **para** cumplir el principio de menor privilegio de `documents/04`.

- Depende de: C1, C2
- Fuente: `documents/05` sección 3.5, sección 4

**Acceptance Criteria:**
1. Un Encargado con `boat_supervisors` limitado a 2 de 5 barcos de la empresa solo ve esos 2 en toda vista de barcos.
2. Owner/Manager ven todos los barcos de su `company_id`.
3. Intentar acceder por API/consulta directa a un barco fuera del alcance del Encargado es rechazado por RLS, no solo oculto en la UI.

---

## Epic D — Ponche offline-first

**Objetivo:** que el personal de barco pueda ponchar entrada/salida sin señal, con sincronización confiable y sin perder la hora real del evento.

### D1. Schema y RLS de `punches`
**Como** sistema, **necesito** la tabla `punches` con sus campos y políticas de acceso, **para** soportar el registro de asistencia offline-first.

- Depende de: A4, B5
- Fuente: `documents/05` sección 3.7

**Acceptance Criteria:**
1. Tabla con `company_id`, `company_member_id`, `boat_assignment_id` (nulable), `punch_type` (`in`/`out`), `device_timestamp`, `synced_at`, `latitude`/`longitude` (opcionales), `created_offline`, `flagged_out_of_schedule`.
2. RLS: Crew solo ve/crea sus propios ponches; Encargado ve los de su personal asignado; Owner/Manager ven todos; Secretaría solo lectura.
3. Incluida en las reglas de sincronización de PowerSync de A4 limitadas a `company_member_id`.

---

### D2. UI de ponche (botón único in/out)
**Como** personal de barco, **necesito** un botón grande que cambie de estado según corresponda, **para** ponchar en 2 toques como pide `documents/01`.

- Depende de: D1, A4
- Fuente: `documents/03` sección 2.2

**Acceptance Criteria:**
1. El botón muestra el estado actual (dentro/fuera de turno) y cambia de acción según corresponda (mostrar "Ponchar salida" si ya ponchó entrada).
2. Confirmación visual clara tras ponchar (ej. "Entrada registrada 8:02 AM"), usando `device_timestamp`.
3. Escritura local-first: el ponche se guarda de inmediato aunque no haya señal (usa A4), sin bloquear al usuario.

---

### D3. Cola offline y reconciliación de sincronización
**Como** supervisor, **necesito** que un ponche hecho sin señal aparezca con su hora real al sincronizar, **para** confiar en los registros de asistencia.

- Depende de: D2
- Fuente: `documents/03` sección 7.1, `documents/02` sección 2.3

**Acceptance Criteria:**
1. Un ponche creado en modo avión se sincroniza automáticamente al recuperar señal, sin acción manual.
2. El supervisor ve el ponche con `device_timestamp` (hora real del evento), no con la hora de `synced_at`.
3. Caso de conflicto (dos escrituras al mismo registro sin señal) se resuelve por "gana el último cambio" y ambos intentos quedan en auditoría (ver Epic G/`audit_log` si ya existe, o placeholder documentado si Epic de auditoría no está aún).

---

### D4. Flag de ponche fuera de horario
**Como** Encargado, **necesito** ver marcado cuando alguien poncha fuera del horario asignado, **para** darle seguimiento sin que bloquee al tripulante.

- Depende de: D1, E1 (boat_assignments, para comparar contra el horario esperado)
- Fuente: `documents/03` sección 2.2, sección 3.1

**Acceptance Criteria:**
1. Si el `device_timestamp` de un ponche no coincide con el rango esperado de su `boat_assignment`, se marca `flagged_out_of_schedule = true` automáticamente.
2. El ponche se registra igual (no bloquea al usuario) — solo queda visualmente marcado para el supervisor.
3. El dashboard operativo del Encargado (Epic I) puede filtrar/mostrar estos casos.

---

### D5. Indicador de conexión
**Como** cualquier usuario que registra algo en campo, **necesito** ver si estoy offline, **para** saber que mi acción se sincronizará después sin dudar si se perdió.

- Depende de: A4
- Fuente: `documents/03` sección 1

**Acceptance Criteria:**
1. En toda pantalla donde se registra algo (ponche, propina, incidente/solicitud), un indicador discreto muestra "Sin conexión — se guardará y sincronizará después" cuando no hay señal.
2. El indicador no bloquea la interacción del usuario.
3. El indicador desaparece automáticamente al recuperar señal y sincronizar lo pendiente.

---

## Epic E — Rotación y asignación

**Objetivo:** asignar personal a barcos, con sugerencia automática basada en las reglas de `documents/06`, siempre confirmada por un humano.

### E1. Schema y RLS de `boat_assignments` y `boat_supervisors`
**Como** sistema, **necesito** las tablas de asignación de turnos y de supervisión de barcos, **para** soportar rotación manual y sugerida.

- Depende de: C1, C2, B5
- Fuente: `documents/05` sección 3.5, 3.6

**Acceptance Criteria:**
1. `boat_assignments` con `boat_id`, `company_member_id`, `job_position_id`, `shift_date`, `shift_start`, `shift_end`, `status` (`scheduled`/`confirmed`/`completed`/`cancelled`), `source` (`manual`/`suggested_rotation`), `created_by`.
2. `boat_supervisors` vincula Encargados a barcos específicos (usado por C4/D4).
3. RLS: Encargado limitado a asignaciones de sus barcos; Owner/Manager sin restricción dentro de su empresa.

---

### E2. UI de asignación manual
**Como** Encargado o Gerente, **necesito** asignar personal a un barco/turno manualmente, **para** cubrir la operación cuando no uso la sugerencia automática.

- Depende de: E1
- Fuente: `documents/03` sección 3.2

**Acceptance Criteria:**
1. Vista por barco muestra tripulación asignada hoy/semana y permite agregar/quitar tripulantes por turno.
2. No permite asignar a alguien con una solicitud de día libre aprobada para esa fecha (bloqueo duro, ver `documents/06` regla 3).
3. Guardar una asignación manual la marca con `source = manual`.

---

### E3. Edge Function: algoritmo de rotación sugerida
**Como** Encargado o Gerente, **necesito** que el sistema proponga una asignación equilibrada, **para** no repartir turnos a mano cada semana.

- Depende de: E1, C2 (job_positions con `rotation_repeat_allowed`), B4 (`fixed_boat_id` en company_members)
- Fuente: `documents/06` completo (reglas y orden de prioridad, secciones 2-3)

**Reglas de negocio (orden de prioridad, de `documents/06` sección 3):**
1. Cobertura mínima obligatoria por barco (ej. 1 Capitán).
2. Asignaciones fijas/dedicadas (`fixed_boat_id`) tienen prioridad, salvo descanso/día libre aprobado.
3. Nunca asignar a alguien con día libre aprobado esa fecha.
4. No repetir barco consecutivo, excepto Capitán/Manager (`rotation_repeat_allowed`) o asignación fija.
5. Descanso tras 3 turnos seguidos, solo si hay personal suficiente esa semana para cubrir todos los barcos sin esa persona.
6. Entre las combinaciones válidas restantes, preferir reparto equitativo de turnos/descansos.
7. Válvula de escape: si no hay forma de cubrir sin repetir fuera de excepciones, generar la asignación de todos modos marcada como excepcional (ver E5).

**Acceptance Criteria:**
1. Dado un conjunto de personal disponible, turnos de la semana y reglas anteriores, la función devuelve una propuesta de `boat_assignments` con `source = suggested_rotation`, sin persistir hasta confirmación (E4).
2. Los 5 ejemplos de `documents/06` sección 4 (caso normal, excepción por rol, asignación fija, descanso tras 3 días, caso extremo) se validan con tests unitarios de la función.
3. Ningún resultado se aplica directamente a producción sin pasar por E4.

---

### E4. UI revisar/confirmar sugerencia de rotación
**Como** Encargado o Gerente, **necesito** revisar la propuesta del sistema antes de que aplique, **para** ajustar lo que no me convence sin perder el trabajo de la sugerencia.

- Depende de: E3
- Fuente: `documents/03` sección 7.2

**Acceptance Criteria:**
1. Botón "Sugerir rotación" muestra la propuesta completa de E3 antes de guardar nada.
2. El usuario puede aceptar tal cual o ajustar manualmente celda por celda antes de confirmar.
3. Al confirmar, se persisten las `boat_assignments` y se dispara notificación al personal afectado (dependencia hacia Epic K, puede quedar como TODO si K no está lista aún).

---

### E5. Manejo de "Asignación excepcional"
**Como** Encargado, **necesito** ver claramente marcada una asignación que repite barco fuera de las excepciones normales, **para** revisarla a propósito en vez de que pase desapercibida.

- Depende de: E3, E1 (`is_exception`, `exception_reason`)
- Fuente: `documents/06` sección 3 punto 7, sección 5

**Acceptance Criteria:**
1. Toda asignación generada por la válvula de escape tiene `is_exception = true` y un `exception_reason` (ej. "Personal insuficiente esta semana").
2. La UI de E4 resalta visualmente (badge de estado, ver `DESIGN_SYSTEM.md`) cualquier asignación con `is_exception = true`.
3. Confirmar una asignación excepcional requiere una acción explícita (no queda pre-aceptada por default como el resto).

---

### E6. Vista "Mi horario" (crew)
**Como** personal de barco, **necesito** ver mi horario semanal, **para** saber qué barco me toca, con quién y cuándo descanso.

- Depende de: E1
- Fuente: `documents/03` sección 2.4

**Acceptance Criteria:**
1. Vista semanal muestra barco, compañeros y horario por día para el usuario logueado.
2. Indicador visual de "Te toca descanso" en los días sin asignación.
3. Solo muestra las asignaciones propias del usuario (RLS de E1 aplicada correctamente).

---

## Epic F — Propinas

**Objetivo:** registrar propinas individuales o compartidas y repartirlas correctamente entre la tripulación del turno.

### F1. Schema y RLS de `tips` y `tip_splits`
**Como** sistema, **necesito** las tablas de propinas y su reparto, **para** soportar registro individual y pool con trazabilidad de quién recibe cuánto.

- Depende de: E1, B5
- Fuente: `documents/05` sección 3.8, 3.9

**Acceptance Criteria:**
1. `tips` con `boat_id`, `boat_assignment_id` (opcional), `reported_by`, `amount`, `currency`, `tip_type` (`individual`/`pool`), `shift_date`, `note`, `receipt_photo_url`, `created_offline`.
2. `tip_splits` con `tip_id`, `company_member_id`, `share_amount`.
3. RLS: Crew solo ve sus propios `tip_splits`; Owner/Manager/Secretaría ven todos los de su empresa; Encargado solo los de su personal.

---

### F2. UI registrar propina
**Como** personal de barco, **necesito** registrar una propina individual o compartida, **para** que quede reflejada en mi historial y el de mis compañeros.

- Depende de: F1, A4 (offline-first)
- Fuente: `documents/03` sección 2.3

**Acceptance Criteria:**
1. Formulario con barco/turno (preseleccionado si aplica), monto (USD), tipo (individual/compartida), nota y foto de recibo opcionales.
2. Si es compartida, permite indicar entre cuántas personas o repartir automáticamente entre los asignados al turno.
3. Funciona offline (escritura local-first vía A4) igual que el ponche.

---

### F3. Lógica de reparto pool
**Como** sistema, **necesito** repartir automáticamente una propina `pool` entre la tripulación del turno, **para** que cada quien reciba su parte sin cálculo manual.

- Depende de: F1, F2
- Fuente: `documents/05` sección 3.9

**Acceptance Criteria:**
1. Si `tip_type = individual`, se genera una sola fila en `tip_splits` con el monto completo para `reported_by`.
2. Si `tip_type = pool`, se generan varias filas (una por cada tripulante del turno), repartiendo equitativamente por defecto.
3. La suma de `share_amount` de un `tip` siempre es igual a `amount` (sin pérdida de centavos por redondeo — definir regla de redondeo, ej. el resto va al primer tripulante).

---

### F4. Historial de propinas (crew, solo lectura)
**Como** personal de barco, **necesito** ver mis propinas registradas por semana/mes, **para** llevar control de mis ingresos.

- Depende de: F1
- Fuente: `documents/03` sección 2.6

**Acceptance Criteria:**
1. Vista de solo lectura con propinas propias agrupadas por semana/mes.
2. No permite editar registros pasados (correcciones se piden a un supervisor — fuera de alcance de este ticket).
3. Coincide exactamente con la suma de `tip_splits` del usuario en Supabase.

---

## Epic G — Solicitudes y aprobaciones

**Objetivo:** que el personal pueda pedir día libre, cambio de turno o reportar incidentes, con aprobación que respete segregación de funciones.

### G1. Schema y RLS de `requests`
**Como** sistema, **necesito** la tabla de solicitudes con sus tres tipos, **para** soportar el flujo de creación y aprobación.

- Depende de: B5, E1
- Fuente: `documents/05` sección 3.12

**Acceptance Criteria:**
1. Tabla con `request_type` (`day_off`/`shift_change`/`incident`), `status` (`pending`/`approved`/`rejected`), campos condicionales (`date_range_start/end`, `target_boat_assignment_id`, `incident_boat_id`), `description`, `photo_url`, `reviewed_by`, `reviewed_at`, `review_note`.
2. RLS: Crew crea y ve solo sus propias solicitudes; Encargado ve/aprueba las de su personal; Owner/Manager ven todas.

---

### G2. UI crear solicitud
**Como** personal de barco, **necesito** crear una solicitud de día libre, cambio de turno o incidente, **para** pedir algo o reportar un problema sin hablarlo informalmente.

- Depende de: G1
- Fuente: `documents/03` sección 2.5

**Acceptance Criteria:**
1. Formulario adaptado por tipo (rango de fechas para día libre, turno destino para cambio, descripción+foto para incidente).
2. Historial propio de solicitudes con su estado (pendiente/aprobada/rechazada).
3. Funciona offline para el caso de incidente reportado desde el barco (usa A4).

---

### G3. UI cola de aprobación
**Como** Encargado o Gerente, **necesito** ver y resolver solicitudes pendientes, **para** mantener la operación al día.

- Depende de: G1
- Fuente: `documents/03` sección 3.3

**Acceptance Criteria:**
1. Lista de solicitudes pendientes filtrada por alcance del revisor (Encargado solo su personal).
2. Aprobar/rechazar con nota opcional actualiza `status`, `reviewed_by`, `reviewed_at`, `review_note`.
3. Una solicitud aprobada de tipo `day_off` bloquea automáticamente esa asignación en E2/E3 (integración con Epic E).

---

### G4. Segregación de funciones y escalamiento
**Como** sistema, **necesito** impedir que alguien apruebe su propia solicitud y escalar cuando corresponda, **para** cumplir la regla de `documents/04`.

- Depende de: G1, G3
- Fuente: `documents/04` sección 5, `documents/06` (no aplica directo, referencia cruzada con Epic B roles)

**Acceptance Criteria:**
1. Validación a nivel de aplicación: `reviewed_by ≠ company_member_id` de la solicitud (rechazado incluso si alguien lo intenta vía API).
2. Si un Encargado crea una solicitud, esta escala automáticamente a Gerente/Dueño en vez de aparecer en su propia cola.
3. Test que cubre el intento de auto-aprobación y confirma el rechazo.

---

### G5. Incidente → tarea de mantenimiento vinculada
**Como** Encargado, **necesito** convertir un incidente reportado en una tarea de mantenimiento con un clic, **para** no perder el reporte ni duplicar captura de datos.

- Depende de: G1, H1 (maintenance_tasks)
- Fuente: `documents/03` sección 7.4, `documents/05` sección 3.11 (`source`, `linked_request_id`)

**Acceptance Criteria:**
1. Desde una solicitud de tipo `incident`, un botón crea una `maintenance_task` con `source = incident_report` y `linked_request_id` apuntando a la solicitud original.
2. La descripción y foto del incidente se copian como punto de partida de la tarea de mantenimiento (editable después).
3. La solicitud original queda visualmente enlazada a la tarea creada, en ambos sentidos.

---

## Epic H — Mantenimiento

**Objetivo:** programar, dar seguimiento y cerrar mantenimientos de barcos, con alertas de vencimiento.

### H1. Schema y RLS de `maintenance_categories` y `maintenance_tasks`
**Como** sistema, **necesito** las tablas de categorías y tareas de mantenimiento, **para** soportar programación, seguimiento y cierre.

- Depende de: C1, B5
- Fuente: `documents/05` sección 3.10, 3.11

**Acceptance Criteria:**
1. `maintenance_categories` configurable por empresa (motor, casco, seguridad, otro por defecto).
2. `maintenance_tasks` con `boat_id`, `category_id`, `title`, `description`, `scheduled_date`, `is_recurring`, `recurrence_interval_days`, `status` (`pending`/`in_progress`/`completed`/`overdue`), `assigned_to`, `source`, `linked_request_id`, `completed_at/by/note`, fotos antes/después.
3. RLS: Encargado limitado a mantenimientos de sus barcos; Owner/Manager sin restricción.

---

### H2. UI programar mantenimiento
**Como** Encargado o Gerente, **necesito** programar un mantenimiento por fecha o de forma recurrente, **para** no depender de la memoria para dar seguimiento a los barcos.

- Depende de: H1
- Fuente: `documents/03` sección 3.4

**Acceptance Criteria:**
1. Formulario con barco, categoría, título, descripción, fecha, si es recurrente y cada cuántos días.
2. Un mantenimiento recurrente genera automáticamente la siguiente instancia al completarse la actual.
3. Solo Owner/Manager/Encargado (dentro de su alcance) pueden programar.

---

### H3. Lista/calendario con badges de estado
**Como** cualquier rol con visibilidad de mantenimiento, **necesito** ver de un vistazo qué está al día, próximo a vencer o vencido, **para** priorizar sin leer cada detalle.

- Depende de: H1
- Fuente: `documents/03` sección 3.4, `DESIGN_SYSTEM.md` (colores de estado)

**Acceptance Criteria:**
1. Vista lista y/o calendario usa `color.status.ok/warning/danger` consistentemente (ver `DESIGN_SYSTEM.md`).
2. El estado del badge no depende solo del color (incluye texto/ícono, regla de accesibilidad de `mission.md`).
3. Filtrable por barco y por categoría.

---

### H4. Flujo marcar completado
**Como** responsable de un mantenimiento, **necesito** marcarlo como completado con nota y fotos, **para** dejar evidencia de que se hizo.

- Depende de: H1
- Fuente: `documents/03` sección 3.4, sección 7.3

**Acceptance Criteria:**
1. Marcar completado requiere nota y permite adjuntar foto antes/después (Supabase Storage).
2. Actualiza `status = completed`, `completed_at`, `completed_by`.
3. Si la tarea era recurrente, dispara la creación de la siguiente instancia (según intervalo).

---

### H5. Job de auto-flag de vencidos
**Como** Gerente o Dueño, **necesito** que un mantenimiento vencido sin completar se marque solo, **para** no depender de que alguien lo revise manualmente todos los días.

- Depende de: H1
- Fuente: `documents/03` sección 7.3

**Acceptance Criteria:**
1. Un proceso programado (Edge Function con cron o Supabase scheduled function) marca `status = overdue` cuando `scheduled_date` pasó sin completarse.
2. El cambio de estado dispara una notificación (integración con Epic K, puede quedar como TODO si K no está lista).
3. Se refleja inmediatamente en los dashboards de Gerente/Dueño (Epic I) vía Realtime o refresco de la vista.

---

## Epic I — Reportes y dashboards

**Objetivo:** que cada rol vea la información que le corresponde, resumida y exportable donde aplica.

### I1. Queries/vistas de horas y propinas
**Como** sistema, **necesito** queries o vistas SQL que agreguen horas trabajadas (desde `punches`) y propinas (desde `tip_splits`) por persona/barco/periodo, **para** que los dashboards y reportes no dupliquen lógica de cálculo.

- Depende de: D1, F1
- Fuente: `documents/03` sección 4.3, 5.3

**Acceptance Criteria:**
1. Vista/función que calcula horas trabajadas por persona en un rango de fechas a partir de pares `in`/`out` de `punches`.
2. Vista/función que suma propinas por persona/barco/periodo desde `tip_splits`.
3. Ambas respetan RLS (un query de un Encargado no puede traer datos fuera de su alcance).

---

### I2. Dashboard Crew (su historial)
**Como** personal de barco, **necesito** ver mi resumen de horas y propinas, **para** llevar control de mi propio desempeño sin pedirlo a un supervisor.

- Depende de: I1
- Fuente: `documents/03` sección 2.6

**Acceptance Criteria:**
1. Resumen de horas y propinas propias por semana/mes, usando I1.
2. Sin acceso a datos de otros compañeros (verificado por RLS, no solo por la UI).

---

### I3. Dashboard Supervisor (resumen operativo del día)
**Como** Encargado, **necesito** ver el resumen del día (barcos activos, quién ponchó, alertas), **para** operar el muelle sin revisar cada tabla por separado.

- Depende de: D1, E1, H1, G1
- Fuente: `documents/03` sección 3.1

**Acceptance Criteria:**
1. Resumen del día: barcos activos, asignados vs. quién ya ponchó/falta, alertas de mantenimiento vencido/próximo, solicitudes pendientes.
2. Limitado a los barcos/personal del alcance del Encargado.

---

### I4. Dashboard Manager (consolidado, todos los barcos)
**Como** Gerente, **necesito** ver el estado consolidado de todos los barcos y personal, **para** tomar decisiones a nivel de todo el negocio.

- Depende de: I1, I3
- Fuente: `documents/03` sección 4.1

**Acceptance Criteria:**
1. Indicadores clave: % de asistencia, mantenimientos pendientes, propinas del día/semana, a nivel de toda la empresa.
2. Incluye lo mismo que I3 pero sin restricción de alcance (todos los barcos).

---

### I5. Dashboard Owner (ejecutivo, comparativos)
**Como** Dueño, **necesito** un resumen ejecutivo con comparativos simples, **para** entender la salud del negocio sin operar el día a día.

- Depende de: I1, I4
- Fuente: `documents/03` sección 6.1

**Acceptance Criteria:**
1. Resumen general (todos los barcos, todo el personal, estado de mantenimiento, propinas totales del periodo).
2. Comparativo simple (ej. esta semana vs. semana pasada) para al menos un indicador (propinas u horas).

---

### I6. Vista de reportes solo lectura (Secretaría)
**Como** Secretaría, **necesito** ver los mismos reportes que el Gerente en modo consulta, **para** preparar nómina/pagos sin poder alterar datos operativos.

- Depende de: I1, I4
- Fuente: `documents/03` sección 5.3

**Acceptance Criteria:**
1. Mismos datos que I4, sin ningún control de edición/aprobación visible.
2. RLS de Secretaría (B5) impide cualquier `INSERT`/`UPDATE` fuera de `documents`/`generated_reports` (Epic J), aunque la UI ya lo oculte.

---

### I7. Exportar reportes (PDF/Excel)
**Como** Gerente o Secretaría, **necesito** exportar un reporte de horas/propinas, **para** compartirlo fuera de la app (nómina, contabilidad).

- Depende de: I1
- Fuente: `documents/03` sección 4.3

**Acceptance Criteria:**
1. Exportación a PDF y/o Excel de un reporte de horas o propinas para un periodo y filtro (persona/barco) seleccionado.
2. El archivo generado coincide exactamente con los datos mostrados en pantalla para ese mismo filtro.

---

## Epic J — Documentos y facturación

**Objetivo:** generar documentos formales y mantener expedientes de personal con alertas de vencimiento.

### J1. Schema y RLS de `documents` y `generated_reports`
**Como** sistema, **necesito** las tablas de documentos y reportes generados, **para** soportar expedientes y facturación.

- Depende de: B5
- Fuente: `documents/05` sección 3.13, 3.14

**Acceptance Criteria:**
1. `documents` con `company_member_id` (nulo si es de empresa/barco), `boat_id` (nulo si es de personal), `doc_type`, `file_url`, `issued_date`, `expiry_date`, `uploaded_by`.
2. `generated_reports` con `report_type` (`invoice`/`hours_report`/`tips_report`), `period_start/end`, `total_amount`, `file_url`, `generated_by`.
3. RLS: solo Owner/Manager/Secretaría pueden `INSERT`/`UPDATE`; Crew solo ve sus propios documentos.

---

### J2. Expedientes de personal
**Como** Secretaría, **necesito** subir y consultar documentos de personal (identificación, certificaciones, contratos), **para** mantener el expediente completo de cada tripulante.

- Depende de: J1
- Fuente: `documents/03` sección 5.2

**Acceptance Criteria:**
1. Subir un documento asociado a un `company_member` con tipo, fecha de emisión y vencimiento (si aplica).
2. Consultar el expediente completo de una persona desde su ficha.
3. Crew puede ver (no editar) sus propios documentos.

---

### J3. Generación de factura/reporte PDF
**Como** Secretaría, **necesito** generar una factura o reporte formal a partir de horas y propinas del periodo, **para** entregarlo a contabilidad o al cliente.

- Depende de: I1, J1
- Fuente: `documents/02` sección 2.5, `documents/03` sección 5.1

**Acceptance Criteria:**
1. Edge Function genera un PDF con plantilla de la empresa a partir de los datos de I1 para un periodo dado.
2. El PDF generado se guarda en Supabase Storage y se registra en `generated_reports` con su `file_url`.
3. Historial de documentos generados es consultable y re-descargable.

---

### J4. Alertas de vencimiento de certificaciones
**Como** Gerente o Secretaría, **necesito** que se avise cuando una certificación de personal está por vencer, **para** evitar que alguien opere sin certificación vigente.

- Depende de: J1
- Fuente: `documents/06` sección 6, punto 2 (mencionado como regla a futuro, dependencia de `documents` con `expiry_date`)

**Acceptance Criteria:**
1. Un proceso programado detecta `documents` de tipo `certification` con `expiry_date` próxima (ventana configurable) y genera una alerta (integración con Epic K si está lista, o registro visible en dashboard si no).
2. La alerta identifica claramente a la persona y qué certificación vence.

---

## Epic K — Notificaciones

**Objetivo:** avisar a cada usuario de lo relevante para su rol, incluso si estuvo offline cuando se generó.

### K1. Schema y RLS de `notifications`
**Como** sistema, **necesito** la tabla de notificaciones, **para** que cada usuario reciba solo las suyas.

- Depende de: A5, B5
- Fuente: `documents/05` sección 3.15

**Acceptance Criteria:**
1. Tabla con `company_member_id` (destinatario), `type`, `title`, `body`, `related_entity_type/id`, `read_at`.
2. RLS: cada usuario solo ve sus propias notificaciones.

---

### K2. Triggers de push
**Como** usuario, **necesito** recibir un push cuando algo relevante pasa (mantenimiento próximo a vencer, solicitud aprobada/rechazada, cambio de turno, recordatorio de ponche), **para** enterarme sin tener que abrir la app a revisar.

- Depende de: K1, A5, E4, G3, H5
- Fuente: `documents/03` sección 1

**Acceptance Criteria:**
1. Cada evento relevante (lista de `documents/03`) genera una fila en `notifications` y dispara un push al token registrado en A5.
2. El contenido del push usa i18n (idioma preferido del destinatario, `preferred_language` de `company_members`).

---

### K3. UI campana/lista in-app
**Como** usuario, **necesito** ver mis notificaciones dentro de la app, **para** revisar el historial aunque haya cerrado el push.

- Depende de: K1
- Fuente: `documents/03` sección 1

**Acceptance Criteria:**
1. Ícono de campana con contador de no leídas.
2. Lista de notificaciones marcable como leída (`read_at`).

---

### K4. Entrega diferida si estuvo offline
**Como** usuario que estuvo sin señal, **necesito** recibir las notificaciones pendientes al reconectarme, **para** no perderme avisos importantes.

- Depende de: K1, K2
- Fuente: `documents/02` sección 2.4

**Acceptance Criteria:**
1. Una notificación generada mientras el dispositivo está offline se entrega (push y/o in-app) al recuperar señal.
2. No se duplica la notificación si el push y la sincronización in-app llegan casi al mismo tiempo.

---

## Epic M — QA & Launch Readiness

**Objetivo:** verificación final cruzada antes de considerar el MVP listo para producción — no es donde se "hace" i18n/accesibilidad/seguridad por primera vez (eso es continuo desde el día uno, ver Definition of Done en `mission.md`), sino el pase de regresión que confirma que se sostuvo.

### M1. Auditoría de accesibilidad (regresión final)
**Como** equipo de producto, **necesito** un pase final de accesibilidad sobre toda la app, **para** confirmar que el estándar de `DESIGN_SYSTEM.md` se sostuvo en todos los tickets, no solo en los primeros.

- Depende de: todas las epics de UI (B-K)
- Fuente: `DESIGN_SYSTEM.md`, `mission.md` (Definition of Done #8)

**Acceptance Criteria:**
1. Contraste AA verificado en todas las pantallas construidas, con foco especial en `color.status.warning` (ámbar) sobre fondo claro.
2. Áreas táctiles ≥44x44pt verificadas en botones de campo (ponche, confirmar/cancelar).
3. Ningún estado se comunica solo por color (se revisan todos los badges de estado del proyecto).

---

### M2. Auditoría RLS/permisos end-to-end
**Como** equipo de seguridad, **necesito** validar la matriz completa de `documents/04` contra las políticas RLS realmente implementadas, **para** confirmar que ningún rol tiene más o menos acceso del debido.

- Depende de: todas las epics con RLS (B5, C4, D1, F1, G1, H1, J1, K1)
- Fuente: `documents/04` sección 4 completa

**Acceptance Criteria:**
1. Cada fila de la matriz de permisos de `documents/04` se ejercita con un test (o checklist manual documentado) contra el rol correspondiente.
2. Cualquier discrepancia encontrada se documenta como bug antes de cerrar el MVP.
3. Se verifica específicamente la segregación de funciones (nadie aprueba su propia solicitud) end-to-end, no solo a nivel de un ticket aislado (G4).

---

### M3. Prueba de estrés de sync offline (multi-dispositivo)
**Como** equipo de QA, **necesito** simular conflictos reales de sincronización entre varios dispositivos, **para** confirmar que la resolución "gana el último cambio" con auditoría funciona bajo condiciones reales, no solo en el caso feliz de D3.

- Depende de: D3, A4
- Fuente: `documents/02` sección 2.3

**Acceptance Criteria:**
1. Dos dispositivos editando el mismo registro sin señal, al reconectar ambos, resuelven sin pérdida silenciosa de datos (ambos intentos quedan trazables).
2. Prueba de volumen: N ponches/propinas offline acumulados por varios días sincronizan correctamente al reconectar, sin duplicados.
3. Resultado documentado como caso de regresión permanente (a repetir si se toca la lógica de sync).
