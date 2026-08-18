# Requirements: TASK-4-i18n-base

Fuente: issue [#4](https://github.com/oclaw74-lang/ZarpeIslands/issues/4).

## Historia de usuario

**Como** usuario de cualquier rol, **necesito** que la interfaz esté disponible en inglés y español desde el primer componente, **para** que ningún ticket posterior tenga que "traducir después".

## Acceptance Criteria (RFC 2119)

1. Cambiar el locale del dispositivo (o un selector de prueba) DEBE cambiar el idioma de un componente placeholder sin reiniciar la app.
2. DEBE existir al menos un namespace de ejemplo (`common`) con claves en `en` y `es`.
3. DEBE documentarse en `src/README.md` cómo agregar un namespace nuevo por feature.

## Fuera de alcance

- Persistencia del idioma elegido entre reinicios de la app (se resuelve en Epic B6 "Perfil", donde el idioma se guarda en `company_members.preferred_language`).
- Traducción completa de toda la UI existente (solo el namespace `common` + el placeholder de Home en este ticket).
