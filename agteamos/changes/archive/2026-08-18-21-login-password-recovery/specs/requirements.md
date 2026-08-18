# Requirements: B1. Login y recuperación de contraseña

**Como** cualquier usuario, **necesito** loguearme con correo/contraseña y poder recuperar mi contraseña, **para** acceder a la app.

Depende de: A2 (cliente Supabase — ✅ done).
Fuente: `documents/03` sección 1, paso 1.

## Acceptance Criteria

1. Login exitoso con credenciales válidas redirige al Home correspondiente al rol (placeholder hasta B3 — hoy es el único Home que existe).
2. Credenciales inválidas muestran error claro sin filtrar si el error es de usuario o contraseña (buena práctica de seguridad).
3. Flujo de "olvidé mi contraseña" envía email de recuperación vía Supabase Auth y permite establecer una nueva.
