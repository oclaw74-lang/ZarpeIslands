import { supabase } from '@/lib/supabase/client';

import { bootstrapCompany, getCompanyMembership } from '@/features/company/api/companyService';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockedSupabase = supabase as unknown as { from: jest.Mock; rpc: jest.Mock };

describe('getCompanyMembership', () => {
  beforeEach(() => jest.clearAllMocks());

  function mockSelectResult(result: { data: unknown; error: unknown }) {
    const maybeSingle = jest.fn().mockResolvedValue(result);
    const select = jest.fn(() => ({ maybeSingle }));
    mockedSupabase.from.mockReturnValue({ select });
  }

  it('returns the mapped member when one exists (happy path)', async () => {
    mockSelectResult({
      data: { id: 'm1', company_id: 'c1', full_name: 'Ana Owner', email: 'ana@example.com', access_role: 'owner' },
      error: null,
    });

    const result = await getCompanyMembership();

    expect(result).toEqual({
      id: 'm1',
      companyId: 'c1',
      fullName: 'Ana Owner',
      email: 'ana@example.com',
      accessRole: 'owner',
    });
  });

  it('returns undefined when the user has no company yet (edge case / triggers onboarding)', async () => {
    mockSelectResult({ data: null, error: null });

    expect(await getCompanyMembership()).toBeUndefined();
  });

  it('returns undefined on a query error, not null (error case — distinct from missing-config)', async () => {
    mockSelectResult({ data: null, error: { message: 'network error' } });

    expect(await getCompanyMembership()).toBeUndefined();
  });
});

describe('bootstrapCompany', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls the RPC with defaults and returns the new member (happy path)', async () => {
    mockedSupabase.rpc.mockResolvedValue({
      data: { id: 'm1', company_id: 'c1', full_name: 'Ana Owner', email: 'ana@example.com', access_role: 'owner' },
      error: null,
    });

    const result = await bootstrapCompany('Zarpe Charters', 'Ana Owner');

    expect(mockedSupabase.rpc).toHaveBeenCalledWith('bootstrap_company', {
      p_name: 'Zarpe Charters',
      p_full_name: 'Ana Owner',
      p_country: null,
      p_default_currency: 'USD',
      p_default_language: 'en',
      p_timezone: null,
    });
    expect(result).toEqual({
      ok: true,
      member: { id: 'm1', companyId: 'c1', fullName: 'Ana Owner', email: 'ana@example.com', accessRole: 'owner' },
    });
  });

  it('returns an error result when the RPC rejects (error case — e.g. user already has a company)', async () => {
    mockedSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'user already belongs to a company' } });

    const result = await bootstrapCompany('Zarpe Charters', 'Ana Owner');

    expect(result).toEqual({ ok: false, message: 'user already belongs to a company' });
  });
});
