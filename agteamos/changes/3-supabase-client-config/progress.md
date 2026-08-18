# Progress: A2. Cliente Supabase + configuración de entorno tipada

**Ticket**: [#3](https://github.com/oclaw74-lang/ZarpeIslands/issues/3) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/3-supabase-client-config`

## Next Action

Step 7-8 completos. Listo para Step 9 (close-task): PR + merge a `develop`.

## Decisions Made

- **2026-08-18**: El usuario confirmó tener un proyecto Supabase real (URL + anon key) para Zarpe Islands. Los valores viven solo en `.env` local (gitignored) — nunca en el repo ni en `.env.example`. Esto permite verificar AC#1 contra un backend real, no solo con mocks.
- **2026-08-18**: A pedido del usuario, se estableció el flujo de **migraciones versionadas con Supabase CLI** (sin Docker, contra el proyecto remoto directo) como convención del proyecto para todo cambio de esquema futuro. Ver `agteamos/devops/INFRASTRUCTURE.md` sección "Base de datos — migraciones con Supabase CLI". Se creó y aplicó la migración base `20260818145127_init_schema.sql` (extensión `pgcrypto`), sin tablas de negocio — esas se crean en sus propios tickets de epic (B5, C4, D1, etc., ver `backlog-detail.md`).
- **2026-08-18**: Autenticación de cuenta para el CLI (`supabase login`) la hizo el usuario interactivamente en su propia terminal — no delegable a un agente (requiere login humano vía navegador). La password de la DB para `supabase link`/`db push` vive en la variable de entorno de usuario `SUPABASE_DB_PASSWORD`.
- **2026-08-18**: Persistencia de sesión vía `AsyncStorage` (patrón oficial de Supabase para Expo). Queda registrado como candidato a revisión en Epic B (evaluar `expo-secure-store`), no bloqueante para este ticket.

## Files Modified

| Archivo | Qué cambia |
|---|---|
| `package.json` | + `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`; jest `setupFiles` con mock de AsyncStorage |
| `jest.setup.js` | Nuevo — mock oficial de AsyncStorage para Jest |
| `src/lib/supabase/env.ts` | Nuevo — validador de env tipado, nunca lanza |
| `src/lib/supabase/client.ts` | Nuevo — cliente Supabase con AsyncStorage, `null` si falta config |
| `src/features/home/screens/MissingConfigScreen.tsx` | Nuevo — pantalla de error claro |
| `src/app/_layout.tsx` | Muestra `MissingConfigScreen` si falta config, si no el `Stack` normal |
| `supabase/` (nuevo) | `config.toml`, `migrations/20260818145127_init_schema.sql`, `.gitignore` propio |
| `agteamos/devops/INFRASTRUCTURE.md` | + sección de convención de migraciones |

## Unit Tests Written

| Test | Tipo | Resultado |
|---|---|---|
| `env.test.ts` — happy path (URL + key presentes) | Happy path | ✅ Pass |
| `env.test.ts` — falta URL | Error case | ✅ Pass |
| `env.test.ts` — faltan ambas vars | Edge case | ✅ Pass |
| `env.test.ts` — valor en blanco cuenta como faltante | Edge case | ✅ Pass |
| `client.test.ts` — crea cliente si config válida | Happy path | ✅ Pass |
| `client.test.ts` — no crea cliente, exporta `null` si falta config | Error case | ✅ Pass |

## Verificación de Acceptance Criteria

| AC | Verificación | Resultado |
|---|---|---|
| #1 — auth/from/storage funcionan contra proyecto real | Script ad-hoc: `auth.getSession()` (sin error, session null), `storage.listBuckets()` (sin error, []), `from('_probe_').select()` (error real de Postgres "tabla no encontrada", no error de red) — confirma llegada real a Auth/Storage/Postgres | ✅ Pass |
| #2 — error claro si falta env var | Verificado en emulador real: con `.env` sin valores mostraba "Falta configuración" con las claves exactas faltantes; con `.env` completo carga el Home normal | ✅ Pass |
| #3 — `.env` gitignored, `.env.example` sin valores reales | `git check-ignore -v .env` confirma; `.env.example` sin cambios de contenido | ✅ Pass |

## Evidence (screenshots)

- `evidence/android-emulator-a2.png` — Home renderizando normalmente con `.env` real cargado (no `MissingConfigScreen`), confirmado en el emulador `ZarpeIslands_Pixel`.
