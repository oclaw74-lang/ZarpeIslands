const mockCreateClient = jest.fn((..._args: unknown[]) => ({ mocked: true }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

jest.mock('react-native-url-polyfill/auto', () => ({}));

describe('supabase client', () => {
  beforeEach(() => {
    jest.resetModules();
    mockCreateClient.mockClear();
  });

  it('creates a client when env is valid (happy path)', () => {
    jest.doMock('@/lib/supabase/env', () => ({
      getSupabaseEnv: () => ({ ok: true, url: 'https://example.supabase.co', anonKey: 'key' }),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../client');

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'key',
      expect.objectContaining({
        auth: expect.objectContaining({ persistSession: true, autoRefreshToken: true }),
      })
    );
    expect(supabase).toEqual({ mocked: true });
  });

  it('exports null and does not call createClient when env is invalid (error case)', () => {
    jest.doMock('@/lib/supabase/env', () => ({
      getSupabaseEnv: () => ({ ok: false, missing: ['EXPO_PUBLIC_SUPABASE_URL'] }),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabase } = require('../client');

    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(supabase).toBeNull();
  });
});
