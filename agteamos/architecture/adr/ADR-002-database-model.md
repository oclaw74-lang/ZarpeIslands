# ADR-002: Modelo de base de datos multi-tenant con RLS

**Estado**: Aceptado
**Fecha**: 2026-08-18

## Contexto

El producto debe soportar múltiples empresas clientes (tenants) a futuro sin rediseñar el esquema, y garantizar que ninguna empresa vea datos de otra, incluso ante una consulta directa a la base.

## Decisión

- Todas las tablas principales incluyen `company_id` (multi-tenant desde el día uno).
- Row Level Security (RLS) de Postgres es la barrera de seguridad real — no solo el filtrado en la app.
- Se separa **identidad** (`auth.users`, gestionada por Supabase Auth) de **membresía** (`company_members`: rol y datos dentro de una empresa específica).
- Catálogos configurables por empresa (`job_positions`, `maintenance_categories`) en vez de enums fijos.
- Tablas editadas offline (`punches`, `tips`, `requests`) incluyen campos de reconciliación (`created_offline`, `device_timestamp`, `synced_at`).
- Toda acción sensible (aprobaciones, ediciones de registros pasados, cambios de rotación) se registra en `audit_log`.

## Consecuencias

- Cada política RLS debe mantenerse en sincronía con la matriz de permisos por rol (ver `documents/04-Roles-y-Permisos-ZarpeIslands.md`) — un cambio de rol requiere revisar las políticas correspondientes.
- El esquema completo de tablas vive en `documents/05-Modelo-de-Base-de-Datos-ZarpeIslands.md`; este ADR registra el principio, no el detalle de columnas.
