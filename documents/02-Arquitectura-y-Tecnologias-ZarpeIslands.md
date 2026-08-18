# Documento 2: Arquitectura y Tecnologías
## Proyecto: Zarpe Islands (nombre provisional)

---

## 1. Estrategia de plataformas

| Fase | Plataforma | Objetivo |
|---|---|---|
| **Fase 1** | Android (teléfono) | Lanzamiento principal — donde está el personal de barco y supervisores en el muelle |
| **Fase 2** | Tablet (Android) | Vista ampliada para encargados/gerentes en oficina o muelle |
| **Fase 3** | iOS (teléfono) | Dueños/gerentes que usan iPhone, y clientes/personal que también lo use |
| **Futuro** | Web (panel administrativo) | Dueño/gerente/secretaría accediendo desde computadora |

Se recomienda **un solo código fuente para las 3 plataformas móviles**, en vez de desarrollar cada una por separado, para no triplicar el trabajo de mantenimiento.

---

## 2. Stack tecnológico recomendado

### 2.1 Frontend (app móvil)

**React Native + Expo**

Razones:
- Un solo código para Android, iOS y tablet (responsive).
- Se integra de forma nativa y sencilla con Supabase (ya tienes experiencia previa con React + Supabase Realtime en el proyecto PAUL).
- Ecosistema JavaScript/TypeScript maduro, con la mayor cantidad de librerías y soluciones ya probadas para lo que necesitamos: cámara (fotos de mantenimiento), notificaciones push, GPS/geocerca, modo offline.
- Existen casos reales muy similares al tuyo: empresas de tours con reservas y operación offline-first construidas en React Native + Supabase han reportado reducir trabajo manual operativo de forma significativa al digitalizar el proceso.
- Expo permite compilar para Android primero y activar iOS más adelante sin rehacer el proyecto.

*Alternativa considerada: Flutter.* Ofrece mejor consistencia visual pixel-perfect y rendimiento gráfico, pero requiere aprender Dart desde cero y no aprovecha tu experiencia previa con React/JS/Supabase. Para este proyecto (formularios, listas, dashboards — no gráficos 3D ni animaciones complejas), React Native es la opción más eficiente.

### 2.2 Backend / Base de datos

**Supabase** (como se planteó desde el inicio)

Incluye:
- **Postgres** — base de datos relacional principal.
- **Supabase Auth** — autenticación de usuarios (login, roles, invitaciones).
- **Row Level Security (RLS)** — control de acceso a nivel de fila, clave para que cada empresa (tenant) solo vea sus propios datos, y cada rol vea solo lo que le corresponde.
- **Supabase Storage** — fotos de mantenimiento, documentos de tripulantes, comprobantes.
- **Edge Functions** — lógica de servidor (ej. generar factura, calcular rotación sugerida, enviar notificación).
- **Realtime** — actualizaciones en vivo (ej. el gerente ve en el momento cuando alguien poncha entrada).

### 2.3 Sincronización offline

Este es el punto técnico más delicado del proyecto, porque el personal poncha entrada/salida y registra propinas **en altamar, sin señal**.

**Recomendado: PowerSync + Supabase**

Cómo funciona:
- La app guarda una base de datos SQLite local en el teléfono.
- El personal puede ponchar, registrar propina, ver su horario, etc. **sin internet**, con respuesta instantánea.
- Cuando el teléfono recupera señal (llegando a la costa/muelle), PowerSync sincroniza automáticamente todo lo pendiente hacia Supabase.
- Si dos personas editan lo mismo sin señal (caso raro, ej. dos supervisores asignando al mismo tiempo), se define una regla de resolución de conflictos (por defecto: "gana el último cambio", con registro de auditoría de ambos intentos).

Esto evita construir esa lógica de sincronización desde cero, que es compleja y propensa a errores si se hace a mano.

### 2.4 Notificaciones

- **Push notifications** vía Expo Notifications / Firebase Cloud Messaging — para recordatorios de turno, mantenimiento próximo a vencer, cambios de rotación.
- Recordatorios funcionan incluso si el teléfono estuvo offline: se entregan cuando recupera señal.

### 2.5 Generación de documentos

- **Facturas / reportes de propinas y horas** → generación de PDF vía Edge Function (Supabase) o servicio ligero aparte, reutilizando la misma lógica que ya usas en PunchBot (python-docx / plantillas), adaptado a este proyecto.

### 2.6 Multi-tenant (para poder vender a otros negocios después)

Diseño recomendado desde el día uno:
- Cada empresa cliente = un **tenant** (`company_id`).
- Todas las tablas principales (barcos, personal, mantenimientos, ponches, propinas) incluyen `company_id`.
- RLS de Postgres garantiza que ninguna empresa vea datos de otra, sin necesidad de bases de datos separadas.
- Esto permite lanzar primero para tu negocio de islas, y más adelante activar un "signup" para otras empresas sin rediseñar la base de datos.

### 2.7 Multilenguaje (i18n)

- Librería de internacionalización (ej. `i18next` / `react-i18next` con React Native) desde el inicio.
- Todo el texto de la interfaz vive en archivos de traducción (inglés como idioma base del código, español como segundo idioma listo desde el día uno, y estructura abierta a agregar más).

---

## 3. Diagrama de arquitectura (alto nivel)

*(ver diagrama interactivo compartido en la conversación)*

**Resumen del flujo:**
1. El personal usa la app (React Native) en su teléfono/tablet.
2. La app lee/escribe primero en su base de datos local (SQLite vía PowerSync) — funciona con o sin señal.
3. Cuando hay señal, PowerSync sincroniza con Supabase (Postgres).
4. Supabase Auth valida quién es cada usuario y qué rol tiene.
5. RLS filtra automáticamente qué datos puede ver/editar según su rol y su empresa (tenant).
6. Edge Functions procesan lógica especial: sugerencia de rotación, generación de facturas/reportes, envío de notificaciones.
7. El dueño/gerente ve todo actualizado en tiempo real (Realtime) desde su propio teléfono o, más adelante, desde un panel web.

---

## 4. Entornos y despliegue

| Entorno | Uso |
|---|---|
| **Desarrollo** | Proyecto Supabase separado, datos de prueba |
| **Producción** | Proyecto Supabase real, con backups automáticos activados |
| **Distribución Android** | Google Play (interno/cerrado primero, luego producción) |
| **Distribución iOS** (fase 3) | TestFlight → App Store |

Control de versiones: Git (GitHub), igual que el resto de tus proyectos actuales.

---

## 5. Resumen de decisiones de este documento

| Decisión | Elegido |
|---|---|
| Framework móvil | React Native + Expo |
| Backend/DB | Supabase (Postgres + Auth + Storage + Realtime + Edge Functions) |
| Offline sync | PowerSync |
| Multi-tenant | Sí, desde el diseño de base de datos (columna `company_id` + RLS) |
| Multilenguaje | Sí, desde el inicio (inglés base, español incluido) |
| Notificaciones | Expo Notifications / FCM |
| Documentos/facturas | PDF generado por Edge Function, reutilizando enfoque de PunchBot |

---

## 6. Próximos pasos

- [ ] Documento 3: Flujo del sistema y vistas (pantalla por pantalla, por tipo de usuario)
- [ ] Documento 4: Roles y permisos (con investigación de apps similares para definir bien los tipos de personal)
- [ ] Documento 5: Modelo de base de datos (tablas, relaciones, RLS)
