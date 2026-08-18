describe('getSupabaseEnv', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns ok:true with url and anonKey when both vars are set (happy path)', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

    // eslint-disable-next-line @typescript-eslint/no-require-imports -- reimport with fresh env
    const { getSupabaseEnv } = require('../env');
    const result = getSupabaseEnv();

    expect(result).toEqual({
      ok: true,
      url: 'https://example.supabase.co',
      anonKey: 'anon-key-123',
    });
  });

  it('returns ok:false listing the missing var when the URL is absent (error case)', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getSupabaseEnv } = require('../env');
    const result = getSupabaseEnv();

    expect(result).toEqual({ ok: false, missing: ['EXPO_PUBLIC_SUPABASE_URL'] });
  });

  it('returns ok:false listing both vars when everything is missing (edge case)', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getSupabaseEnv } = require('../env');
    const result = getSupabaseEnv();

    expect(result).toEqual({
      ok: false,
      missing: ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'],
    });
  });

  it('treats a blank/whitespace-only value as missing (edge case)', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = '   ';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-123';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getSupabaseEnv } = require('../env');
    const result = getSupabaseEnv();

    expect(result).toEqual({ ok: false, missing: ['EXPO_PUBLIC_SUPABASE_URL'] });
  });
});
