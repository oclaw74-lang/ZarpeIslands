# Verify report — B2. Bootstrap de empresa

**Ticket**: [#22](https://github.com/oclaw74-lang/ZarpeIslands/issues/22)

## Acceptance Criteria

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | `companies` + `company_members` (owner) en una operación transaccional | ✅ Verificado contra Supabase real — filas confirmadas vía `service_role` | progress.md, `evidence/android-emulator-b2-3-*.png` |
| 2 | Índice único respetado, no se duplica membresía | ✅ Verificado — segundo intento de bootstrap rechazado con "user already belongs to a company" | progress.md |
| 3 | Owner ve el dashboard vacío tras el bootstrap | ✅ Verificado — login real terminó en Home (placeholder de Epic A) | `evidence/android-emulator-b2-3-*.png` |

## Comandos

```
npx tsc --noEmit        # sin errores
npx eslint src --max-warnings=0   # 1 warning preexistente no relacionado
npx jest                # 20 suites, 77 tests, todos verdes
```

## Notas

- Migración `20260818233244_bootstrap_company_function.sql` aplicada al proyecto real (`supabase db push`).
- Hallazgo documentado (no bloquea): Supabase rechaza dominios de email no reales (`.dev`, `example.com`) en `signUp()` público — no aplica al Admin API, usado para la verificación E2E del bootstrap.
- Gap documentado (no bloquea): no se verificó en vivo el camino `RegisterScreen → CheckEmailScreen` con un dominio real por rate-limit de envío de emails acumulado en la sesión — cubierto por tests unitarios.

## Conclusión

Listo para PR. Los 3 ACs verificados contra el backend real, no solo mocks.
