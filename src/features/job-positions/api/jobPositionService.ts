import { supabase } from '@/lib/supabase/client';

export type JobPosition = {
  id: string;
  name: string;
  isRequiredPerShift: boolean;
  rotationRepeatAllowed: boolean;
};

export type JobPositionInput = {
  name: string;
  isRequiredPerShift?: boolean;
  rotationRepeatAllowed?: boolean;
};

export type JobPositionResult =
  | { ok: true; jobPosition: JobPosition }
  | { ok: false; message: string };

function mapRow(row: {
  id: string;
  name: string;
  is_required_per_shift: boolean;
  rotation_repeat_allowed: boolean;
}): JobPosition {
  return {
    id: row.id,
    name: row.name,
    isRequiredPerShift: row.is_required_per_shift,
    rotationRepeatAllowed: row.rotation_repeat_allowed,
  };
}

/**
 * Todas las llamadas relacionadas a `job_positions` se centralizan acá
 * (mismo criterio que `boatService`/`companyService` — ver B2/C1).
 */

export async function listJobPositions(): Promise<JobPosition[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('job_positions')
    .select('id, name, is_required_per_shift, rotation_repeat_allowed')
    .order('name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(mapRow);
}

export async function getJobPosition(id: string): Promise<JobPosition | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('job_positions')
    .select('id, name, is_required_per_shift, rotation_repeat_allowed')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapRow(data);
}

export async function createJobPosition(
  companyId: string,
  input: JobPositionInput
): Promise<JobPositionResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { data, error } = await supabase
    .from('job_positions')
    .insert({
      company_id: companyId,
      name: input.name,
      is_required_per_shift: input.isRequiredPerShift ?? false,
      rotation_repeat_allowed: input.rotationRepeatAllowed ?? false,
    })
    .select('id, name, is_required_per_shift, rotation_repeat_allowed')
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'create-failed' };
  }

  return { ok: true, jobPosition: mapRow(data) };
}

export async function updateJobPosition(
  id: string,
  input: Partial<JobPositionInput>
): Promise<JobPositionResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.isRequiredPerShift !== undefined) patch.is_required_per_shift = input.isRequiredPerShift;
  if (input.rotationRepeatAllowed !== undefined) patch.rotation_repeat_allowed = input.rotationRepeatAllowed;

  const { data, error } = await supabase
    .from('job_positions')
    .update(patch)
    .eq('id', id)
    .select('id, name, is_required_per_shift, rotation_repeat_allowed')
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'update-failed' };
  }

  return { ok: true, jobPosition: mapRow(data) };
}
