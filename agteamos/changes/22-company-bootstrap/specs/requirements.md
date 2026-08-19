# Requirements: B2. Bootstrap de empresa

**Como** primer usuario de un negocio, **necesito** poder crear mi empresa al registrarme, **para** empezar a usar la app como Owner.

Depende de: B1. Fuente: `documents/05` sección 3.1, 3.2.

## Reglas de negocio
- Crear una fila en `companies` (name, country, default_currency, default_language, timezone, is_active=true).
- Crear la membresía en `company_members` para el usuario recién registrado con `access_role = owner`.

## Acceptance Criteria
1. Al completar el registro, se crea `companies` + `company_members` (owner) en una sola operación transaccional (si falla la membresía, no debe quedar una empresa huérfana).
2. El índice único (`company_id`, `auth_user_id`) se respeta — no se puede duplicar membresía.
3. El Owner recién creado ve el dashboard ejecutivo vacío (sin barcos/personal todavía) tras el bootstrap.

## Restricción real descubierta (no estaba documentada)
El proyecto de Supabase tiene `mailer_autoconfirm: false` — confirmación de
email obligatoria. `signUp()` no devuelve sesión activa de inmediato. El
bootstrap de empresa no puede ocurrir en el mismo request que el registro;
ocurre la primera vez que el usuario tiene una sesión activa y todavía no
tiene fila en `company_members` (ver design.md).
