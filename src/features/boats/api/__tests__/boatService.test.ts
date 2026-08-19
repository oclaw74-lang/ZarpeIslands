import { supabase } from '@/lib/supabase/client';

import { createBoat, getBoat, listBoats, updateBoat } from '@/features/boats/api/boatService';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockedFrom = (supabase as unknown as { from: jest.Mock }).from;

const boatRow = {
  id: 'b1',
  name: 'Sea Breeze',
  registration_number: 'REG-001',
  boat_type: 'excursion',
  capacity: 12,
  status: 'active',
  notes: null,
};

describe('listBoats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('excludes inactive boats by default (happy path / AC#2)', async () => {
    const order = jest.fn().mockResolvedValue({ data: [boatRow], error: null });
    const neq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ order, neq }));
    mockedFrom.mockReturnValue({ select });

    const result = await listBoats();

    expect(neq).toHaveBeenCalledWith('status', 'inactive');
    expect(order).toHaveBeenCalledWith('name', { ascending: true });
    expect(result).toEqual([
      {
        id: 'b1',
        name: 'Sea Breeze',
        registrationNumber: 'REG-001',
        boatType: 'excursion',
        capacity: 12,
        status: 'active',
        notes: null,
      },
    ]);
  });

  it('includes inactive boats when explicitly requested (edge case)', async () => {
    const order = jest.fn().mockResolvedValue({ data: [boatRow], error: null });
    const neq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ order, neq }));
    mockedFrom.mockReturnValue({ select });

    await listBoats({ includeInactive: true });

    expect(neq).not.toHaveBeenCalled();
  });

  it('returns an empty list on a query error (error case)', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const neq = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ order, neq }));
    mockedFrom.mockReturnValue({ select });

    expect(await listBoats()).toEqual([]);
  });
});

describe('getBoat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the mapped boat when found (happy path)', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: boatRow, error: null });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ select });

    const result = await getBoat('b1');

    expect(eq).toHaveBeenCalledWith('id', 'b1');
    expect(result).toEqual(
      expect.objectContaining({ id: 'b1', name: 'Sea Breeze', boatType: 'excursion' })
    );
  });

  it('returns null when not found (edge case)', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ select });

    expect(await getBoat('missing')).toBeNull();
  });
});

describe('createBoat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inserts the boat scoped to the company and returns it (happy path / AC#1)', async () => {
    const single = jest.fn().mockResolvedValue({ data: boatRow, error: null });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    mockedFrom.mockReturnValue({ insert });

    const result = await createBoat('company-1', {
      name: 'Sea Breeze',
      registrationNumber: 'REG-001',
      boatType: 'excursion',
      capacity: 12,
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'company-1', name: 'Sea Breeze', boat_type: 'excursion' })
    );
    expect(result).toEqual({
      ok: true,
      boat: {
        id: 'b1',
        name: 'Sea Breeze',
        registrationNumber: 'REG-001',
        boatType: 'excursion',
        capacity: 12,
        status: 'active',
        notes: null,
      },
    });
  });

  it('returns an error result when RLS rejects the insert (error case / AC#3 — non owner/manager)', async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'new row violates row-level security policy' },
    });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    mockedFrom.mockReturnValue({ insert });

    const result = await createBoat('company-1', { name: 'Sea Breeze', boatType: 'excursion' });

    expect(result).toEqual({ ok: false, message: 'new row violates row-level security policy' });
  });
});

describe('updateBoat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends only the provided fields and returns the updated boat (happy path)', async () => {
    const single = jest.fn().mockResolvedValue({ data: { ...boatRow, status: 'inactive' }, error: null });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ update });

    const result = await updateBoat('b1', { status: 'inactive' });

    expect(update).toHaveBeenCalledWith({ status: 'inactive' });
    expect(eq).toHaveBeenCalledWith('id', 'b1');
    expect(result).toEqual({ ok: true, boat: expect.objectContaining({ status: 'inactive' }) });
  });

  it('returns an error result on failure (error case)', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ update });

    expect(await updateBoat('b1', { status: 'inactive' })).toEqual({ ok: false, message: 'boom' });
  });
});
