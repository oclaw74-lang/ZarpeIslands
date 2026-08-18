# Verify report — A5. Wiring de push notifications

**Ticket**: [#6](https://github.com/oclaw74-lang/ZarpeIslands/issues/6) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)

## Acceptance Criteria

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | Mensaje de contexto antes del prompt nativo | ✅ Verificado end-to-end en emulador Android | `evidence/android-emulator-a5-1-context.png`, `evidence/android-emulator-a5-3-prompt.png` |
| 2 | Se obtiene un Expo push token válido y se guarda localmente | ⚠️ Verificado por código/tests unitarios (4/4 verdes). End-to-end en Android real bloqueado por falta de proyecto Firebase (`google-services.json`) — diferido a Epic K por decisión explícita del usuario | `evidence/android-emulator-a5-4-token.png` (documenta el bloqueo real), `src/lib/notifications/__tests__/pushToken.test.ts` |
| 3 | Notificación de prueba llega al dispositivo | ⏸️ Diferido a Epic K (requiere Firebase) | — |

## Comandos ejecutados

```
npx tsc --noEmit        # sin errores
npx eslint src --max-warnings=0   # 1 warning preexistente, no relacionado (src/lib/i18n/index.ts)
npx jest --silent       # 8 suites, 22 tests, todos verdes
```

## Decisión de alcance

Ver `progress.md` — sección "Decisions Made" — para el detalle completo de por qué AC#2 y AC#3
quedan con verificación end-to-end diferida a Epic K, y cómo el código distingue el bloqueo
esperado (`blocked-firebase`) de un error genérico.

## Conclusión

Listo para PR contra `develop`. AC#1 cerrado completo. AC#2 cerrado a nivel de código/tests,
con verificación end-to-end explícitamente diferida junto con AC#3.
