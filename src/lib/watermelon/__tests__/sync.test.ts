const mockSynchronize = jest.fn();

jest.mock('@nozbe/watermelondb/sync', () => ({
  synchronize: (...args: unknown[]) => mockSynchronize(...args),
}));

jest.mock('@/lib/watermelon/database', () => ({ database: {} }));

describe('synchronizeApp', () => {
  beforeEach(() => {
    jest.resetModules();
    mockSynchronize.mockClear();
  });

  it('does nothing when there is no Supabase client (happy path — missing config, A2)', async () => {
    jest.doMock('@/lib/supabase/client', () => ({ supabase: null }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { synchronizeApp } = require('../sync');
    await synchronizeApp();

    expect(mockSynchronize).not.toHaveBeenCalled();
  });

  it('calls pull_changes/push_changes scoped to the punches table (happy path)', async () => {
    const rpc = jest
      .fn()
      .mockResolvedValueOnce({
        data: { punches: { created: [{ id: '1' }], updated: [], deleted: [] }, timestamp: '2026-08-18T00:00:00Z' },
        error: null,
      })
      .mockResolvedValueOnce({ error: null });

    jest.doMock('@/lib/supabase/client', () => ({ supabase: { rpc } }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { synchronizeApp } = require('../sync');
    await synchronizeApp();

    expect(mockSynchronize).toHaveBeenCalledTimes(1);
    const options = mockSynchronize.mock.calls[0][0];

    const pullResult = await options.pullChanges({ lastPulledAt: null });
    expect(rpc).toHaveBeenCalledWith('pull_changes', { last_pulled_at: null });
    expect(pullResult.changes.punches.created).toEqual([{ id: '1' }]);

    await options.pushChanges({ changes: { punches: { created: [], updated: [{ id: '1' }], deleted: [] } } });
    expect(rpc).toHaveBeenCalledWith('push_changes', {
      changes: { punches: { created: [], updated: [{ id: '1' }], deleted: [] } },
    });
  });

  it('throws when pull_changes returns an error (error case)', async () => {
    const rpc = jest.fn().mockResolvedValueOnce({ data: null, error: new Error('boom') });
    jest.doMock('@/lib/supabase/client', () => ({ supabase: { rpc } }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { synchronizeApp } = require('../sync');
    await synchronizeApp();

    const options = mockSynchronize.mock.calls[0][0];
    await expect(options.pullChanges({ lastPulledAt: null })).rejects.toThrow('boom');
  });
});
