# Roadmap

**Generado**: 2026-08-18 (agteamos-new-project, Step 3)
**Fuente**: `documents/02`, `documents/03`, `documents/04`, `documents/06`

## Fase 0 — Infraestructura y scaffolding

Cubierta por este mismo workflow (`agteamos-new-project`): stack, arquitectura, CI/CD, estructura de repo. No genera tickets propios — es prerequisito de la Fase 1.

## Fase 1 — Features del MVP (Android, single-tenant funcional aunque el esquema sea multi-tenant)

Alcance: v1 Android, roles Dueño/Gerente/Encargado/Secretaría/Crew, sin reservas de clientes. **i18n (en/es) y accesibilidad de línea base son requisito de Definition of Done desde el primer ticket de UI (ver `mission.md`) — no una fase aparte.**

Desglose completo en tickets por epic (Step 6, GitHub Issues): 12 epics, ~58 tickets.

| Epic | Tickets | Contenido |
|---|---|---|
| **A — Project Foundation & Scaffold** | 5 | Init Expo+TS, cliente Supabase, i18n base (en/es), PowerSync+SQLite, wiring de push |
| **B — Auth & Company Bootstrap** | 6 | Login/recuperar contraseña, bootstrap de empresa, sesión+routing por rol, CRUD `company_members`, RLS `companies`/`company_members`, Perfil (datos, idioma, logout) |
| **C — Boats & Job Positions** | 4 | CRUD `boats`, catálogo `job_positions`, detalle de barco, RLS `boats`/`job_positions` |
| **D — Ponche offline-first** | 5 | Schema+RLS `punches`, UI ponche in/out, cola offline+reconciliación, flag fuera de horario, indicador de conexión |
| **E — Rotación y asignación** | 6 | Schema+RLS `boat_assignments`/`boat_supervisors`, UI asignación manual, Edge Function de rotación sugerida (`documents/06`), UI revisar/confirmar, manejo de excepción, vista "Mi horario" |
| **F — Propinas** | 4 | Schema+RLS `tips`/`tip_splits`, UI registrar propina, reparto pool, historial (crew) |
| **G — Solicitudes y aprobaciones** | 5 | Schema+RLS `requests`, UI crear solicitud, UI cola de aprobación, segregación de funciones+escalamiento, incidente→mantenimiento |
| **H — Mantenimiento** | 5 | Schema+RLS `maintenance_categories`/`maintenance_tasks`, UI programar, lista/calendario con badges, marcar completado, auto-flag de vencidos |
| **I — Reportes y dashboards** | 7 | Queries de horas/propinas, dashboards Crew/Supervisor/Manager/Owner, vista solo lectura Secretaría, exportar PDF/Excel |
| **J — Documentos y facturación** | 4 | Schema+RLS `documents`/`generated_reports`, expedientes de personal, generación PDF, alertas de vencimiento |
| **K — Notificaciones** | 4 | Schema+RLS `notifications`, triggers de push, UI campana/lista in-app, entrega diferida offline |
| **M — QA & Launch Readiness** | 3 | Auditoría de accesibilidad (regresión final), auditoría RLS/permisos end-to-end vs. `documents/04`, prueba de estrés de sync offline multi-dispositivo |

Detalle de acceptance criteria por ticket se define al crear cada GitHub Issue (Step 6) y se refina en `agteamos-clarification-protocol` si algo queda ambiguo al empezar esa tarea puntual.

## Fase 2+ — Ideas post-MVP (parking lot)

- Tablet (fase 2) e iOS (fase 3) — mismo código base, activar plataforma sin rehacer el proyecto.
- Panel web administrativo (Dueño/Gerente/Secretaría desde computadora).
- Reservas de clientes/turistas desde la app.
- Rol "Administrador de plataforma" si el producto se vende a otras empresas (multi-tenant SaaS real).
- Rol "Contador/Finanzas" de solo lectura si el negocio crece.
- Reglas avanzadas de rotación (documents/06, sección 6): tope máximo de días sin descanso, certificación por puesto, preferencias de disponibilidad del personal, emparejamiento de personal nuevo, compatibilidad barco-personal, bloqueo en temporada alta, registro de anulación manual, alerta de desequilibrio semanal.
- Validación final de nombre/marca y logo (documents/01, próximos pasos).
