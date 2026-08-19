# Delta: job_positions (C2, dominio nuevo)

## ADDED

- Tabla `job_positions`: `id`, `company_id` (FK), `name`, `is_required_per_shift`
  (default `false`), `rotation_repeat_allowed` (default `false`), `created_at`,
  `updated_at` (trigger `set_updated_at()` reutilizada de A4b).
- Trigger `companies_seed_default_job_positions` (`AFTER INSERT ON companies`)
  ejecuta `seed_default_job_positions()` (`SECURITY DEFINER`), que inserta 5
  puestos por defecto para toda empresa nueva: Captain/Skipper (ambos flags
  `true`), Deckhand, Mechanic, Tour Guide, Other (resto `false`).
- RLS: `job_positions_select_own_company` (cualquier miembro de la empresa),
  `job_positions_insert_owner_manager`, `job_positions_update_owner_manager`
  (acotadas a `access_role in ('owner','manager')`) — mismo patrón que `boats`.
