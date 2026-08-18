# Tasks checklist: TASK-12-schema-companies-punches

- [ ] Crear migración `supabase migration new schema_companies_punches`
- [ ] Escribir SQL: `companies`, `company_members`, `punches`, `current_company_member_id()`, RLS
- [ ] `supabase db push` contra el proyecto real
- [ ] Verificar con `supabase migration list` (local == remoto)
- [ ] Insertar fila de prueba en cada tabla desde SQL editor (o script), confirmar FKs
- [ ] Escribir `agteamos/specs/deltas/companies.md` y `punches.md`
