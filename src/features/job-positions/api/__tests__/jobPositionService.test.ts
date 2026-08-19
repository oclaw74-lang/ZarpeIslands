import { supabase } from '@/lib/supabase/client';

import {
  createJobPosition,
  getJobPosition,
  listJobPositions,
  updateJobPosition,
} from '@/features/job-positions/api/jobPositionService';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockedFrom = (supabase as unknown as { from: jest.Mock }).from;

const row = {
  id: 'jp1',
  name: 'Captain/Skipper',
  is_required_per_shift: true,
  rotation_repeat_allowed: true,
};

describe('listJobPositions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the mapped catalog, defaults included (happy path / AC#1)', async () => {
    const order = jest.fn().mockResolvedValue({ data: [row], error: null });
    const select = jest.fn(() => ({ order }));
    mockedFrom.mockReturnValue({ select });

    const result = await listJobPositions();

    expect(result).toEqual([
      { id: 'jp1', name: 'Captain/Skipper', isRequiredPerShift: true, rotationRepeatAllowed: true },
    ]);
  });

  it('returns an empty list on a query error (error case)', async () => {
    const order = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const select = jest.fn(() => ({ order }));
    mockedFrom.mockReturnValue({ select });

    expect(await listJobPositions()).toEqual([]);
  });
});

describe('getJobPosition', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the mapped position when found (happy path)', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: row, error: null });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ select });

    expect(await getJobPosition('jp1')).toEqual(
      expect.objectContaining({ id: 'jp1', name: 'Captain/Skipper' })
    );
  });

  it('returns null when not found (edge case)', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn(() => ({ maybeSingle }));
    const select = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ select });

    expect(await getJobPosition('missing')).toBeNull();
  });
});

describe('createJobPosition', () => {
  beforeEach(() => jest.clearAllMocks());

  it('inserts a custom position scoped to the company (happy path / AC#1 editable)', async () => {
    const single = jest.fn().mockResolvedValue({
      data: { id: 'jp2', name: 'Bartender', is_required_per_shift: false, rotation_repeat_allowed: false },
      error: null,
    });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    mockedFrom.mockReturnValue({ insert });

    const result = await createJobPosition('company-1', { name: 'Bartender' });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'company-1',
        name: 'Bartender',
        is_required_per_shift: false,
        rotation_repeat_allowed: false,
      })
    );
    expect(result).toEqual({
      ok: true,
      jobPosition: { id: 'jp2', name: 'Bartender', isRequiredPerShift: false, rotationRepeatAllowed: false },
    });
  });

  it('returns an error result when RLS rejects the insert (error case / non owner-manager)', async () => {
    const single = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'new row violates row-level security policy' },
    });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    mockedFrom.mockReturnValue({ insert });

    const result = await createJobPosition('company-1', { name: 'Bartender' });

    expect(result).toEqual({ ok: false, message: 'new row violates row-level security policy' });
  });
});

describe('updateJobPosition', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates is_required_per_shift (happy path / AC#3)', async () => {
    const single = jest.fn().mockResolvedValue({ data: { ...row, is_required_per_shift: false }, error: null });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ update });

    const result = await updateJobPosition('jp1', { isRequiredPerShift: false });

    expect(update).toHaveBeenCalledWith({ is_required_per_shift: false });
    expect(result).toEqual({ ok: true, jobPosition: expect.objectContaining({ isRequiredPerShift: false }) });
  });

  it('returns an error result on failure (error case)', async () => {
    const single = jest.fn().mockResolvedValue({ data: null, error: { message: 'boom' } });
    const select = jest.fn(() => ({ single }));
    const eq = jest.fn(() => ({ select }));
    const update = jest.fn(() => ({ eq }));
    mockedFrom.mockReturnValue({ update });

    expect(await updateJobPosition('jp1', { name: 'X' })).toEqual({ ok: false, message: 'boom' });
  });
});
