# Delta: punches

**Contra**: spec maestra `agteamos/specs/punches.md` (no existe todavía — se crea al cerrar esta tarea)
**Ticket**: [#12](https://github.com/oclaw74-lang/ZarpeIslands/issues/12) (A4a)

## ADDED

### Tabla `punches`
- `id` uuid PK
- `company_id` uuid FK → companies
- `company_member_id` uuid FK → company_members
- `boat_assignment_id` uuid — **sin FK todavía** (tabla `boat_assignments` no existe hasta Epic E1)
- `punch_type` text check (in/out)
- `device_timestamp` timestamptz not null
- `synced_at` timestamptz
- `latitude`, `longitude` numeric
- `created_offline` boolean default false
- `flagged_out_of_schedule` boolean default false
- `created_at` timestamptz

**Pendiente para futuras tareas**: FK real a `boat_assignment_id` cuando Epic E1 cree esa tabla; lógica de `flagged_out_of_schedule` (Epic D4); cola offline y reconciliación de `device_timestamp`/`synced_at` (Epic D2/D3, A4c).

### RLS
- SELECT/INSERT/UPDATE limitados a `company_member_id = current_company_member_id()`.
- Verificado con test cruzado de 2 usuarios (ver `agteamos/changes/12-schema-companies-punches/progress.md`): un usuario nunca ve filas de otro.
