# Delta: punches

**Contra**: spec maestra `agteamos/specs/punches.md`
**Ticket**: [#13](https://github.com/oclaw74-lang/ZarpeIslands/issues/13) (A4b)

## MODIFIED

### Tabla `punches`
- \+ `updated_at` timestamptz not null default now() — actualizado automáticamente por trigger `punches_set_updated_at` en cada `UPDATE`.
- \+ `deleted_at` timestamptz nullable — soft delete (usado por `push_changes`/`pull_changes`, ver abajo).

## ADDED

### Función `push_changes(changes jsonb)`
- `SECURITY DEFINER`. Recibe `{ punches: { created: [...], updated: [...], deleted: [...] } }` (forma del protocolo de sync de WatermelonDB).
- Resuelve `company_id`/`company_member_id` del caller server-side (`current_company_member_id()`) — **ignora** esos campos si vienen en el payload, para que un cliente no pueda escribir a nombre de otro miembro.
- `created`: insert directo (upsert por `id`, `on conflict do nothing`).
- `updated`: conflicto resuelto por "gana el último cambio" comparando `device_timestamp` — si la versión entrante no es más nueva que la existente, se descarta silenciosamente (sin error).
- `deleted`: soft delete (`deleted_at = now()`), solo si la fila pertenece al caller.
- Retorna `{ applied: <int>, skipped: <int> }`.

### Función `pull_changes(last_pulled_at timestamptz)`
- `SECURITY DEFINER`. Filtra siempre por `company_member_id` del caller — nunca devuelve filas de otro compañero.
- `created`: `created_at > last_pulled_at` (o todo si `last_pulled_at` es null), `deleted_at is null`.
- `updated`: `updated_at > last_pulled_at` y `created_at <= last_pulled_at`, `deleted_at is null`.
- `deleted`: ids con `deleted_at > last_pulled_at`.
- Retorna `{ punches: { created, updated, deleted }, timestamp }`.

**Verificado** (ver tarea archivada #13): creación, conflicto last-write-wins, aislamiento cruzado entre 2 usuarios (lectura y escritura), y borrado lógico — todo contra la base real.
