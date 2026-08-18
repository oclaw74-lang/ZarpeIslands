# Tasks checklist: TASK-13-postgres-push-pull

- [ ] Migración: `updated_at`/`deleted_at` en `punches` + trigger
- [ ] Migración: función `push_changes(jsonb)`
- [ ] Migración: función `pull_changes(timestamptz)`
- [ ] `supabase db push` contra el proyecto real
- [ ] Verificar AC#1: push crea/actualiza/borra correctamente
- [ ] Verificar AC#2: pull filtrado por company_member_id, aislamiento entre 2 usuarios
- [ ] Verificar AC#3: conflicto de dos device_timestamp se resuelve con el más reciente
- [ ] Actualizar `agteamos/specs/deltas/punches.md`
