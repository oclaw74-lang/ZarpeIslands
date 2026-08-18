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

Ver `.env.example` en la raíz — Supabase (URL + anon key), FCM sender ID, locale por defecto. Ningún valor real se commitea; los valores viven en Expo EAS secrets / GitHub Actions secrets cuando corresponda. La sincronización offline (WatermelonDB, ver ADR-004) no requiere variables de entorno propias — usa el mismo cliente Supabase.

## Autenticación de Git/GitHub para agentes

Token vía variable de entorno `OCLAW74_GH_TOKEN` (ver `agteamos/tracker/github.md` y `agteamos/platform.yml` → `env_var_names.github_token`).

## Base de datos — migraciones con Supabase CLI

**Decisión (A2, 2026-08-18):** todo cambio de esquema en Postgres se hace vía migración versionada con el Supabase CLI, nunca editando tablas a mano desde el Dashboard. No requiere Docker — se trabaja directo contra el proyecto remoto (`supabase link`), sin levantar Postgres local.

### Setup (una sola vez por máquina)

1. `npx supabase login` — login interactivo (abre navegador), asocia el CLI a la cuenta dueña del proyecto.
2. `npx supabase link --project-ref whirvyqwwvawzbnvlsbf --password "$SUPABASE_DB_PASSWORD"` — conecta el repo al proyecto remoto. La password de la base vive en la variable de entorno de usuario `SUPABASE_DB_PASSWORD` (nunca en el repo).

### Flujo por ticket que toca esquema

Cada ticket de epic que agrega/modifica tablas (ver `agteamos/product/backlog-detail.md` — ej. B5, C4, D1, E1, F1, G1, H1, J1, K1) sigue esta convención, **una migración por dominio/ticket, no un solo archivo gigante**:

```bash
npx supabase migration new <dominio_o_ticket>   # crea supabase/migrations/<timestamp>_<nombre>.sql
# escribir el SQL (CREATE TABLE, políticas RLS, índices, etc.)
npx supabase db push --password "$SUPABASE_DB_PASSWORD"   # aplica al proyecto remoto
npx supabase migration list --password "$SUPABASE_DB_PASSWORD"   # confirma local == remoto
```

- `supabase/migrations/` se commitea al repo (es el historial versionado del esquema).
- `supabase/.temp/` y `supabase/.branches/` están gitignored (estado local del CLI, no del esquema).
- La migración `20260818145127_init_schema.sql` es la base (extensión `pgcrypto`, requerida por los PKs `uuid` de todo el modelo — ver `documents/05`). No crea tablas de negocio.
