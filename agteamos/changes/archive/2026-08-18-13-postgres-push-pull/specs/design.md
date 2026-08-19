# Technical Design: TASK-13-postgres-push-pull

## Approach

Dos funciones Postgres `SECURITY DEFINER`, con el payload/retorno en la forma que espera el protocolo de sync de WatermelonDB (`{ created: [...], updated: [...], deleted: [...] }`), para que A4c pueda conectarlas casi directo al `synchronize()` de la librería.

Ambas funciones resuelven `company_member_id` del caller internamente (vía `current_company_member_id()`, ya creada en A4a) — **nunca confían en un `company_member_id` que venga en el payload del cliente**, para que no se pueda spoofear el sync de otro compañero.

## Files to Create

| File | Description |
|------|--------------|
| `supabase/migrations/<timestamp>_punches_sync_columns.sql` | Agrega `updated_at`, `deleted_at` a `punches` + trigger `set_updated_at` |
| `supabase/migrations/<timestamp>_punches_push_pull_functions.sql` | Funciones `push_changes(jsonb)` y `pull_changes(timestamptz)` |
| `agteamos/specs/deltas/punches.md` | Delta MODIFIED (nuevas columnas) |

## Esquema SQL (resumen)

```sql
alter table punches
  add column updated_at timestamptz not null default now(),
  add column deleted_at timestamptz;

create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger punches_set_updated_at
  before update on punches
  for each row execute function set_updated_at();
```

### `push_changes(changes jsonb)`

- Espera `changes` con forma `{ "punches": { "created": [...], "updated": [...], "deleted": ["<id>", ...] } }`.
- Resuelve `company_member_id := current_company_member_id()` — si es `null` (usuario sin membresía), lanza excepción.
- Para cada fila en `created`/`updated`: hace `upsert` en `punches`, **forzando** `company_id`/`company_member_id` a los del caller (ignora lo que venga en el JSON para esos dos campos — previene spoofing).
- Conflicto (fila ya existe con `updated_at` más reciente que la entrante): se queda con la versión de `device_timestamp` más reciente — no error, solo omite el upsert de esa fila puntual.
- Para cada id en `deleted`: soft-delete (`deleted_at = now()`) solo si `company_member_id` coincide con el caller.

### `pull_changes(last_pulled_at timestamptz)`

- Si `last_pulled_at` es `null`, se trata como "traer todo" (equivalente a época 0).
- Filtra siempre por `company_member_id = current_company_member_id()`.
- `created`: filas con `created_at > last_pulled_at` y `deleted_at is null`.
- `updated`: filas con `updated_at > last_pulled_at`, `created_at <= last_pulled_at`, `deleted_at is null`.
- `deleted`: ids con `deleted_at > last_pulled_at`.
- Retorna `{ "punches": { "created": [...], "updated": [...], "deleted": [...] }, "timestamp": <now()> }`.

## Database Changes

Ver arriba — 2 columnas nuevas + 1 trigger + 2 funciones.

## Security Considerations

- `SECURITY DEFINER` en ambas funciones — necesario porque el cliente llama con su JWT normal (rol `authenticated`), pero la función necesita leer/escribir sin las restricciones de RLS línea por línea (la función IMPONE su propio filtro por `company_member_id`, más estricto que dejarlo a RLS genérica).
- `company_id`/`company_member_id` del payload de `push_changes` se **ignoran y se reemplazan** por los del caller — evita que un cliente comprometido escriba datos a nombre de otro miembro.
- Ambas funciones fijan `search_path` explícito para evitar hijacking de funciones vía `search_path`.
