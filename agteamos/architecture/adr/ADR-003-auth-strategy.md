# ADR-003: Estrategia de autenticación y autorización

**Estado**: Aceptado
**Fecha**: 2026-08-18

## Contexto

Existen 5 roles de acceso (Dueño, Gerente, Encargado, Secretaría, Personal Operativo) con alcance distinto sobre barcos y personal, más segregación de funciones obligatoria (ej. nadie aprueba su propia solicitud).

## Decisión

- **Autenticación**: Supabase Auth (correo/usuario + contraseña, recuperación de contraseña).
- **Autorización**: rol (`access_role` en `company_members`) + políticas RLS en Postgres, no solo lógica en la app.
- **Segregación de funciones**: validada a nivel de aplicación además de RLS (ej. `reviewed_by ≠ company_member_id` de la solicitud).
- **Alcance del Encargado**: limitado a los barcos que se le asignen vía `boat_supervisors`, no a toda la empresa.

## Consecuencias

- Cualquier endpoint/Edge Function que toque datos sensibles debe validar rol y alcance server-side, incluso si la UI ya restringe la navegación.
- El detalle completo de la matriz de permisos vive en `documents/04-Roles-y-Permisos-ZarpeIslands.md`.
