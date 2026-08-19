# Delta: boats (C1, dominio nuevo)

## ADDED

- Tabla `boats`: `id`, `company_id` (FK), `name`, `registration_number`,
  `boat_type` (`excursion`/`rental`/`mixed`), `capacity`, `status`
  (`active`/`in_maintenance`/`inactive`, default `active`), `notes`,
  `created_at`, `updated_at` (trigger `set_updated_at()` reutilizada de A4b).
- RLS: `boats_select_own_company` (cualquier miembro de la empresa),
  `boats_insert_owner_manager`, `boats_update_owner_manager` (acotadas a
  `access_role in ('owner','manager')`).
