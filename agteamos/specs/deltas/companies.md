# Delta: companies

**Contra**: spec maestra `agteamos/specs/companies.md` (no existe todavía — primera vez que se toca este dominio, se crea al cerrar esta tarea vía `agteamos-close-task` paso `sync`)
**Ticket**: [#12](https://github.com/oclaw74-lang/ZarpeIslands/issues/12) (A4a)

## ADDED

### Tabla `companies`
- `id` uuid PK
- `name` text not null
- `country` text
- `default_currency` text default 'USD'
- `default_language` text default 'en'
- `timezone` text
- `is_active` boolean default true
- `created_at` timestamptz default now()

### Tabla `company_members` (mínimo — se amplía en Epic B4/C2)
- `id` uuid PK
- `company_id` uuid FK → companies
- `auth_user_id` uuid FK → auth.users
- `full_name`, `email` text not null
- `access_role` text check (owner/manager/supervisor/secretary/crew)
- `is_active` boolean default true
- `created_at` timestamptz
- unique (company_id, auth_user_id)

**Pendiente para futuras tareas**: `job_position_id` (Epic C2), `fixed_boat_id` (Epic E), `preferred_language`, `hired_at` (Epic B4) — ver `documents/05` sección 3.2 para el modelo completo.

### RLS
- `companies`: SELECT solo de la propia empresa (vía `company_members`).
- `company_members`: SELECT solo de la propia fila. Alcance ampliado por rol (Owner/Manager ven todas) pendiente de Epic B5.

### Función helper
- `current_company_member_id()`: retorna el `id` de `company_members` del usuario autenticado (`auth.uid()`). `SECURITY DEFINER`, usado por políticas RLS de `punches` y futuras tablas que necesiten filtrar por miembro.
