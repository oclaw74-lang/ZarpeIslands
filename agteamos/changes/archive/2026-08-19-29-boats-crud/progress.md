# Progress: C1. CRUD de boats

**Ticket**: [#29](https://github.com/oclaw74-lang/ZarpeIslands/issues/29) — Epic C: [#28](https://github.com/oclaw74-lang/ZarpeIslands/issues/28)
**Branch**: `feature/29-boats-crud`

## Decisions Made

- **RLS de escritura (owner/manager) en este mismo ticket, no diferida a C4** — C4 agrega el acotamiento de *lectura* por `boat_supervisors` para Encargado, un refinamiento distinto. Sin la RLS de INSERT/UPDATE acá, AC#3 solo estaría "simulado" en el cliente (el botón oculto no es seguridad real).
- **Rol del usuario vía `getCompanyMembership().accessRole` (ya existe desde B2)** — no hace falta esperar a B3 (routing por rol) para gatear la UI de creación/edición.
- **AC#2 demostrado con un toggle "Mostrar/Ocultar inactivos"** en la lista, default oculto — el filtrado real para vistas de asignación/rotación es de Epic E, acá solo se prueba que `inactive` se comporta como un estado distinto y ocultable.

## Verificación (contra Supabase real)

1. Usuario de prueba Owner confirmado vía Admin API → bootstrap de empresa real (RPC de B2) → login real en emulador.
2. Creado un barco real desde la UI ("Sea Breeze", excursion, capacidad 12) → aparece en la lista con badge "Active".
3. Editado a `status: inactive` desde la UI → desaparece de la lista por default (AC#2) → reaparece con "Show inactive".
4. **AC#3 verificado a nivel RLS, no solo UI**: creado un segundo usuario con `access_role: crew` en la misma empresa (insertado directo vía `service_role`, ya que el CRUD de personal es B4) → intento de `INSERT` en `boats` vía API directa con su token real → rechazado con `"new row violates row-level security policy for table boats"` (HTTP 403). El mismo usuario SÍ puede leer (`SELECT`) los barcos de su empresa — confirma que la política de lectura sigue abierta a todos los miembros, solo la escritura está acotada.
5. Limpieza: ambos usuarios y la empresa de prueba borrados; confirmado que `boats` quedó vacío (cascada de `companies` → `boats` funcionó).

## Files Modified

- `supabase/migrations/20260819030520_boats_table.sql` — tabla `boats` + RLS.
- `src/features/boats/api/boatService.ts` + tests — `listBoats`, `getBoat`, `createBoat`, `updateBoat`.
- `src/features/boats/screens/BoatsListScreen.tsx`, `BoatFormScreen.tsx` + tests.
- `src/app/boats/index.tsx`, `new.tsx`, `[id]/edit.tsx`.
- `src/features/home/screens/HomeScreen.tsx` — link temporal a `/boats` (placeholder de navegación hasta B3).
- `src/lib/i18n/locales/{en,es}/boats.json`.
- `agteamos/specs/boats.md` (spec maestra nueva).

## Evidence

- `evidence/android-emulator-c1-1-boats-empty-owner.png` — lista vacía, botón "Add boat" visible (owner).
- `evidence/android-emulator-c1-2-boat-form.png`
- `evidence/android-emulator-c1-3-boat-created-active.png`
- `evidence/android-emulator-c1-4-inactive-hidden-by-default.png` — AC#2.
- `evidence/android-emulator-c1-5-show-inactive-toggle.png`
- AC#3 verificado por API directa (ver arriba), no por captura de pantalla — es una verificación de seguridad server-side, no de UI.
- `npx jest` (24 suites, 96+ tests), `npx tsc --noEmit`, `npx eslint` — todos verdes.
