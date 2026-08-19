# Technical Design: TASK-29-boats-crud

## Approach

Tabla `boats` nueva, con RLS de escritura acotada a Owner/Manager desde el
día uno (no se difiere a C4): sin esto, AC#3 ("solo Owner/Manager pueden
crear/editar") no estaría realmente garantizado, solo simulado en el
cliente. C4 agrega después el acotamiento de **lectura** por
`boat_supervisors` para Encargado — un refinamiento distinto, no la base.

`status` se modela como columna simple (`active`/`in_maintenance`/`inactive`)
— el filtrado real para vistas de asignación/rotación es de Epic E; acá solo
se implementa que la lista de barcos permita ocultar los `inactive` por
default (con opción de mostrarlos), como demostración concreta de AC#2.

Rol del usuario actual: ya disponible desde B2 vía
`getCompanyMembership().accessRole` — no hace falta esperar a B3 (routing
por rol) para gatear la UI de creación/edición.

## Files to Create

| File | Description |
|------|--------------|
| `supabase/migrations/<ts>_boats_table.sql` | Tabla `boats` + RLS (select: cualquier miembro de la empresa; insert/update: owner/manager) |
| `src/features/boats/api/boatService.ts` | `listBoats`, `createBoat`, `updateBoat` |
| `src/features/boats/api/__tests__/boatService.test.ts` | Tests |
| `src/features/boats/screens/BoatsListScreen.tsx` | Lista + toggle mostrar inactivos + botón crear (solo owner/manager) |
| `src/features/boats/screens/BoatFormScreen.tsx` | Crear/editar (mismo form, `boatId` opcional vía param) |
| Tests de las screens | Happy path + error + edge (rol sin permiso) |
| `src/app/boats/index.tsx`, `src/app/boats/new.tsx`, `src/app/boats/[id]/edit.tsx` | Rutas delgadas |

## Files to Modify

| File | What changes |
|------|--------------|
| `src/features/home/screens/HomeScreen.tsx` | Link a `/boats` (placeholder de navegación hasta que exista un Home real por rol, B3) |
| `src/lib/i18n/` | Namespace `boats` nuevo (en/es) |

## Database Changes

```sql
create table boats (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  registration_number text,
  boat_type text not null check (boat_type in ('excursion','rental','mixed')),
  capacity integer,
  status text not null default 'active' check (status in ('active','in_maintenance','inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
Trigger `set_updated_at()` reutilizado de A4b (ya existe en la base).

RLS: `boats_select_own_company` (cualquier miembro de la propia empresa),
`boats_insert_owner_manager`, `boats_update_owner_manager` (acotadas a
`access_role in ('owner','manager')` de la propia empresa).

## Security Considerations (STRIDE)

- **Elevation of Privilege**: las políticas de INSERT/UPDATE verifican el rol
  del `auth.uid()` contra `company_members` en cada operación — un Encargado
  o Crew no puede crear/editar barcos ni siquiera llamando la API directo,
  sin pasar por la UI.
- **Information Disclosure**: SELECT acotado a la propia `company_id` — no
  hay forma de ver barcos de otra empresa.
