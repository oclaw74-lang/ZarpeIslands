# Verify report — C2. Catálogo de job_positions

**Ticket**: [#30](https://github.com/oclaw74-lang/ZarpeIslands/issues/30)

## Acceptance Criteria

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | Catálogo pre-cargado con 5 puestos por defecto, editable por empresa | ✅ Verificado: seeding confirmado por REST directo + lista visible en emulador | progress.md |
| 2 | `is_required_per_shift` / `rotation_repeat_allowed` con defaults correctos (ambos `true` solo en Capitán) | ✅ Verificado por REST directo contra la tabla real | progress.md |
| 3 | Cambiar `is_required_per_shift` de un puesto se persiste (dato consumible por Epic E) | ✅ Verificado en emulador: editado y reflejado en la lista | progress.md |
| — | Solo Owner/Manager crean/editan (RLS, mismo patrón que boats) | ✅ Verificado a nivel RLS — crew rechazado con 403 vía API directa, SELECT sigue abierto | progress.md |

## Comandos

```
npx tsc --noEmit                    # sin errores
npx eslint src --max-warnings=0     # 1 warning preexistente no relacionado (i18n)
npx jest                            # 28 suites, 112 tests, todos verdes
```

## Conclusión

Listo para PR. Los 3 ACs del ticket más el criterio de seguridad implícito (mismo
patrón RLS que C1) verificados contra el backend real: seeding por trigger,
edición de flags, y rechazo RLS de un usuario crew probado con su token real,
no solo con el botón oculto en el cliente. Datos de prueba limpiados del
proyecto Supabase real al finalizar.
