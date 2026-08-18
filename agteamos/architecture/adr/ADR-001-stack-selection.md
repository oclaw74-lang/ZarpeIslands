# ADR-001: Selección de stack

**Estado**: Aceptado
**Fecha**: 2026-08-18

## Contexto

Se necesita construir una app de gestión operativa para negocios de turismo náutico, con operación offline-first (personal poncha entrada/salida y registra propinas en altamar, sin señal), multi-tenant desde el diseño, y multiplataforma (Android primero, luego tablet e iOS).

## Decisión

- **Frontend móvil**: React Native + Expo, un solo código fuente para las 3 plataformas.
- **Backend/DB**: Supabase (Postgres + Auth + Storage + Edge Functions + Realtime).
- **Sincronización offline**: PowerSync sobre SQLite local.

## Alternativas consideradas

- **Flutter** en vez de React Native: mejor consistencia visual pixel-perfect, pero requiere aprender Dart desde cero sin aprovechar experiencia previa del equipo con React/Supabase. Descartado para este proyecto (formularios, listas, dashboards — no gráficos 3D ni animaciones complejas).
- **Backend propio (Node/FastAPI) en vez de Supabase**: descartado para el MVP — Supabase cubre auth, storage, RLS y realtime sin mantener infraestructura propia.

## Consecuencias

- Dependencia fuerte de Supabase y PowerSync como proveedores externos.
- No se requiere Docker/docker-compose para desarrollo local en esta fase (no hay servicios propios que orquestar).
- Migrar de PowerSync a una solución de sync propia sería un cambio arquitectónico mayor si se necesitara en el futuro.
