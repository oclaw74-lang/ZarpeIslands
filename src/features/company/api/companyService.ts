import { supabase } from '@/lib/supabase/client';

export type CompanyMember = {
  id: string;
  companyId: string;
  fullName: string;
  email: string;
  accessRole: 'owner' | 'manager' | 'supervisor' | 'secretary' | 'crew';
};

export type CompanyResult = { ok: true; member: CompanyMember } | { ok: false; message: string };

/**
 * Todas las llamadas relacionadas a `companies`/`company_members` se
 * centralizan acá (mismo criterio que `authService` para Auth — ver B1).
 */

/**
 * `null` = sin sesión o sin config. `undefined` = con sesión pero todavía sin
 * empresa (el estado que dispara `/onboarding`, ver B2 design.md).
 */
export async function getCompanyMembership(): Promise<CompanyMember | null | undefined> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('company_members')
    .select('id, company_id, full_name, email, access_role')
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    id: data.id,
    companyId: data.company_id,
    fullName: data.full_name,
    email: data.email,
    accessRole: data.access_role,
  };
}

export async function bootstrapCompany(
  companyName: string,
  fullName: string,
  options?: { country?: string; defaultCurrency?: string; defaultLanguage?: string; timezone?: string }
): Promise<CompanyResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { data, error } = await supabase.rpc('bootstrap_company', {
    p_name: companyName,
    p_full_name: fullName,
    p_country: options?.country ?? null,
    p_default_currency: options?.defaultCurrency ?? 'USD',
    p_default_language: options?.defaultLanguage ?? 'en',
    p_timezone: options?.timezone ?? null,
  });

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'bootstrap-failed' };
  }

  return {
    ok: true,
    member: {
      id: data.id,
      companyId: data.company_id,
      fullName: data.full_name,
      email: data.email,
      accessRole: data.access_role,
    },
  };
}
