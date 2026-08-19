# ADR-004: Sincronización offline con WatermelonDB (reemplaza PowerSync de ADR-001)

**Estado**: Aceptado
**Fecha**: 2026-08-18
**Supersede**: la sección de sincronización offline (PowerSync) de [ADR-001](./ADR-001-stack-selection.md)

## Contexto

ADR-001 eligió PowerSync para la sincronización offline-first (personal de barco ponchando/registrando propinas sin señal). Al llegar a implementarlo (ticket A4), se evaluó el costo real: PowerSync Cloud tiene un free tier que **se desactiva tras 1 semana de inactividad** (inviable para desarrollo intermitente y para producción real sin pasar al plan Pro, desde $49/mes). La alternativa self-hosted (Open Edition) evita el costo pero requiere correr infraestructura propia — contradice la decisión ya tomada de no usar Docker/servicios propios en este proyecto (ver `agteamos/devops/INFRASTRUCTURE.md`).

## Decisión

Usar **WatermelonDB** para la base de datos local reactiva (SQLite), con un protocolo de sincronización propio contra Supabase implementado como funciones Postgres (`push`/`pull`) invocadas vía RPC — patrón documentado oficialmente por Supabase.

## Alternativas consideradas

- **PowerSync (ADR-001 original)**: descartado por costo — free tier inviable, plan pago no justificado para el tamaño actual del negocio (1-5 barcos, 11-30 personas).
- **PowerSync self-hosted (Open Edition)**: descartado — requeriría Docker/infraestructura propia, contradice `ADR devops` de mantener el proyecto sin servicios auto-hospedados mientras el backend sea Supabase gestionado.
- **ElectricSQL / RxDB**: evaluadas como alternativas también gratuitas; se prefirió WatermelonDB por ser la opción más específicamente probada en producción para React Native (vs. ElectricSQL más orientado a web/Postgres embebido) y por tener una guía oficial de integración con Supabase.

## Consecuencias

- El equipo (nosotros) mantiene la lógica de sincronización (funciones `push`/`pull` en Postgres, resolución de conflictos "gana el último cambio") en vez de delegarla a un servicio — más superficie propia a testear y mantener, pero sin costo recurrente ni cuenta externa.
- Cada tabla que se sincroniza offline (`punches`, `tips`, `requests` — ver `documents/05` sección 5) necesita su propio modelo WatermelonDB + su lógica de inclusión en `push`/`pull`, no una configuración declarativa única como las "Sync Rules" de PowerSync.
- Sin streaming en tiempo real automático vía este mecanismo — el sync ocurre al reconectar o por intervalo, no continuo. Realtime de Supabase (ya parte del stack) cubre casos que necesiten actualización en vivo mientras hay señal.
- `.env.example` pierde `EXPO_PUBLIC_POWERSYNC_URL` (ya no aplica).
