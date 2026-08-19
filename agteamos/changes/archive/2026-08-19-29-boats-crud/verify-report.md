# Verify report — C1. CRUD de boats

**Ticket**: [#29](https://github.com/oclaw74-lang/ZarpeIslands/issues/29)

## Acceptance Criteria

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | Crear barco con todos los campos | ✅ Verificado en emulador contra Supabase real | `evidence/android-emulator-c1-2/3-*.png` |
| 2 | `inactive` excluido de la lista sin borrarlo | ✅ Verificado en emulador | `evidence/android-emulator-c1-4/5-*.png` |
| 3 | Solo Owner/Manager crean/editan | ✅ Verificado a nivel RLS (no solo UI) — crew rechazado con 403 vía API directa | progress.md |

## Comandos

```
npx tsc --noEmit        # sin errores
npx eslint src --max-warnings=0   # 1 warning preexistente no relacionado
npx jest                # 24 suites, 96 tests, todos verdes
```

## Conclusión

Listo para PR. Los 3 ACs verificados contra el backend real, incluyendo el
caso de seguridad (AC#3) probado a nivel de política RLS, no solo ocultando
el botón en el cliente.
