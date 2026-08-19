import { supabase } from '@/lib/supabase/client';

export type BoatType = 'excursion' | 'rental' | 'mixed';
export type BoatStatus = 'active' | 'in_maintenance' | 'inactive';

export type Boat = {
  id: string;
  name: string;
  registrationNumber: string | null;
  boatType: BoatType;
  capacity: number | null;
  status: BoatStatus;
  notes: string | null;
};

export type BoatInput = {
  name: string;
  registrationNumber?: string;
  boatType: BoatType;
  capacity?: number;
  status?: BoatStatus;
  notes?: string;
};

export type BoatResult = { ok: true; boat: Boat } | { ok: false; message: string };

function mapRow(row: {
  id: string;
  name: string;
  registration_number: string | null;
  boat_type: BoatType;
  capacity: number | null;
  status: BoatStatus;
  notes: string | null;
}): Boat {
  return {
    id: row.id,
    name: row.name,
    registrationNumber: row.registration_number,
    boatType: row.boat_type,
    capacity: row.capacity,
    status: row.status,
    notes: row.notes,
  };
}

/**
 * Todas las llamadas relacionadas a `boats` se centralizan acá (mismo
 * criterio que `authService`/`companyService` — ver B1/B2).
 */

export async function listBoats(options?: { includeInactive?: boolean }): Promise<Boat[]> {
  if (!supabase) {
    return [];
  }

  const baseQuery = supabase
    .from('boats')
    .select('id, name, registration_number, boat_type, capacity, status, notes');

  const filteredQuery = options?.includeInactive ? baseQuery : baseQuery.neq('status', 'inactive');

  const { data, error } = await filteredQuery.order('name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(mapRow);
}

export async function getBoat(boatId: string): Promise<Boat | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('boats')
    .select('id, name, registration_number, boat_type, capacity, status, notes')
    .eq('id', boatId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRow(data);
}

export async function createBoat(companyId: string, input: BoatInput): Promise<BoatResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { data, error } = await supabase
    .from('boats')
    .insert({
      company_id: companyId,
      name: input.name,
      registration_number: input.registrationNumber ?? null,
      boat_type: input.boatType,
      capacity: input.capacity ?? null,
      status: input.status ?? 'active',
      notes: input.notes ?? null,
    })
    .select('id, name, registration_number, boat_type, capacity, status, notes')
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'create-failed' };
  }

  return { ok: true, boat: mapRow(data) };
}

export async function updateBoat(boatId: string, input: Partial<BoatInput>): Promise<BoatResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.registrationNumber !== undefined) patch.registration_number = input.registrationNumber;
  if (input.boatType !== undefined) patch.boat_type = input.boatType;
  if (input.capacity !== undefined) patch.capacity = input.capacity;
  if (input.status !== undefined) patch.status = input.status;
  if (input.notes !== undefined) patch.notes = input.notes;

  const { data, error } = await supabase
    .from('boats')
    .update(patch)
    .eq('id', boatId)
    .select('id, name, registration_number, boat_type, capacity, status, notes')
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'update-failed' };
  }

  return { ok: true, boat: mapRow(data) };
}
