# Verify report — B1. Login y recuperación de contraseña

**Ticket**: [#21](https://github.com/oclaw74-lang/ZarpeIslands/issues/21) — Epic B: [#20](https://github.com/oclaw74-lang/ZarpeIslands/issues/20)

## Acceptance Criteria

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| 1 | Login exitoso redirige al Home | ✅ Verificado end-to-end contra Supabase real (usuario de prueba vía Admin API) | `evidence/android-emulator-b1-6-valid-login-home.png` |
| 2 | Credenciales inválidas → error genérico, sin filtrar la causa | ✅ Verificado end-to-end contra Supabase real (usuario inexistente) | `evidence/android-emulator-b1-3-invalid-credentials.png` |
| 3 | Forgot password → email → nueva contraseña | ✅ Verificado end-to-end en ambas mitades: envío real (`resetPasswordForEmail`, sin filtrar si el email existe) y consumo real de un link de recovery generado vía Admin API (deep link → sesión → nueva contraseña), confirmado además que la contraseña nueva autentica vía API directa | `evidence/android-emulator-b1-4/5/7/8-*.png` |

## Comandos ejecutados

```
npx tsc --noEmit        # sin errores
npx eslint src --max-warnings=0   # 1 warning preexistente, no relacionado (src/lib/i18n/index.ts)
npx jest                # 14 suites, 51 tests, todos verdes
```

## Bug encontrado y corregido durante la verificación

`ResetPasswordScreen` leía los tokens del deep link solo con `Linking.getInitialURL()` — funciona en frío, falla con la app ya abierta (caso real más común: usuario toca el link del email con la app en background). Corregido con `useAuthDeepLinkRedirect`, un hook que corre desde `_layout.tsx` y captura tanto el arranque en frío como el evento `url` en caliente. Re-verificado con un segundo link de recovery real de punta a punta tras el fix.

## Rediseño visual (post pedido del usuario)

Tras la primera verificación, el usuario pidió una identidad visual más moderna
(fondo de foto real, tipografía Sora, estilo "glassmorphism"). Re-verificado
en emulador tras el rediseño — mismo comportamiento funcional, nueva UI:

- `evidence/android-emulator-b1-9-welcome-redesign.png` — Welcome con foto real + backdrop de contraste para el wordmark.
- `evidence/android-emulator-b1-10-login-redesign.png` — Login con tarjeta glass sobre foto blureada.
- `evidence/android-emulator-b1-11-forgot-redesign.png` — Forgot password, mismo tratamiento.
- `evidence/android-emulator-b1-12-login-error-redesign.png` — AC#2 re-verificado contra Supabase real con el nuevo diseño.

## Pendiente fuera de este ticket (no bloquea el merge)

Agregar `zarpeislands://reset-password` a la allowlist de "Redirect URLs" del proyecto de Supabase (Auth → URL Configuration) — sin esto, un email de recovery real no abrirá la app (cae a `localhost:3000`). Requiere acceso al dashboard o un personal access token del Management API, ninguno disponible durante esta tarea. Documentado en `specs/tasks.md`.

## Conclusión

Listo para PR contra `develop`. Los 3 ACs quedan cerrados con evidencia real contra el backend de Supabase, no solo con tests unitarios/mocks.
