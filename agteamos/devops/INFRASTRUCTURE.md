# Infraestructura

**Generado**: 2026-08-18 (agteamos-new-project, Step 5)
**Fuente**: `documents/02-Arquitectura-y-Tecnologias-ZarpeIslands.md`, `agteamos/platform.yml`

## Branching

`branch_strategy: team` — `feature/* → develop → staging → main`.

- `feature/<n>-<slug>`: trabajo de una feature/ticket puntual.
- `develop`: integración continua.
- `staging`: pre-producción / validación antes de release.
- `main`: producción — protegida, merge solo vía PR.

## CI/CD

`.github/workflows/ci.yml` corre en PRs y pushes a `develop`/`staging`/`main`:

1. Lint
2. Test (con cobertura)
3. `expo-doctor` como chequeo de build/config del proyecto Expo

El job detecta si `package.json` existe todavía — antes de la Feature 1 (scaffold de la app) pasa sin ejecutar pasos de Node, para no bloquear commits de documentación/planificación.

No hay Docker/`docker-compose` en este proyecto: el backend es Supabase (gestionado) y no hay servicios propios que orquestar localmente. Se reevalúa si se agrega un backend propio a futuro (ej. panel web con servidor dedicado).

## Entornos

| Entorno | Uso |
|---|---|
| Desarrollo | Proyecto Supabase separado, datos de prueba |
| Producción | Proyecto Supabase real, backups automáticos activados |
| Distribución Android | Google Play (interno/cerrado primero) |
| Distribución iOS (fase 3) | TestFlight → App Store |

## Deploy target

`deploy_target: null` en `agteamos/platform.yml` — pendiente de definir (no aplica hosting de backend propio por ahora; Supabase es gestionado). Se actualizará cuando exista un panel web u otro componente que requiera hosting.

## Variables de entorno

Ver `.env.example` en la raíz — Supabase (URL + anon key), PowerSync URL, FCM sender ID, locale por defecto. Ningún valor real se commitea; los valores viven en Expo EAS secrets / GitHub Actions secrets cuando corresponda.

## Autenticación de Git/GitHub para agentes

Token vía variable de entorno `OCLAW74_GH_TOKEN` (ver `agteamos/tracker/github.md` y `agteamos/platform.yml` → `env_var_names.github_token`).
