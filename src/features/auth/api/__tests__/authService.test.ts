import { supabase } from '@/lib/supabase/client';

import {
  hasActiveSession,
  parseRecoveryTokensFromUrl,
  requestPasswordReset,
  setRecoverySession,
  signIn,
  updatePassword,
} from '@/features/auth/api/authService';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      getSession: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));

const mockedAuth = (supabase as NonNullable<typeof supabase>).auth as jest.Mocked<
  NonNullable<typeof supabase>['auth']
>;

describe('signIn', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns ok when credentials are valid (happy path)', async () => {
    (mockedAuth.signInWithPassword as jest.Mock).mockResolvedValue({ data: {}, error: null });

    const result = await signIn('owner@example.com', 'correct-password');

    expect(result).toEqual({ ok: true });
  });

  it('returns a generic error message on invalid credentials, without detail (error case / AC#2)', async () => {
    (mockedAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    const result = await signIn('owner@example.com', 'wrong-password');

    expect(result).toEqual({ ok: false, message: 'invalid-credentials' });
  });

  it('does not leak whether the error was "user not found" vs "wrong password" (edge case)', async () => {
    (mockedAuth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'User not found — some backend-specific detail' },
    });

    const result = await signIn('nobody@example.com', 'anything');

    expect(result).toEqual({ ok: false, message: 'invalid-credentials' });
  });
});

describe('requestPasswordReset', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns ok when the reset email is requested successfully (happy path)', async () => {
    (mockedAuth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ data: {}, error: null });

    const result = await requestPasswordReset('owner@example.com', 'zarpeislands://reset-password');

    expect(mockedAuth.resetPasswordForEmail).toHaveBeenCalledWith('owner@example.com', {
      redirectTo: 'zarpeislands://reset-password',
    });
    expect(result).toEqual({ ok: true });
  });

  it('returns an error result when Supabase rejects the request (error case)', async () => {
    (mockedAuth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'rate limit exceeded' },
    });

    const result = await requestPasswordReset('owner@example.com', 'zarpeislands://reset-password');

    expect(result).toEqual({ ok: false, message: 'rate limit exceeded' });
  });
});

describe('updatePassword', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns ok when the password is updated (happy path)', async () => {
    (mockedAuth.updateUser as jest.Mock).mockResolvedValue({ data: {}, error: null });

    const result = await updatePassword('new-strong-password');

    expect(result).toEqual({ ok: true });
  });

  it('returns an error result when Supabase rejects the update (error case)', async () => {
    (mockedAuth.updateUser as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'Password should be at least 6 characters' },
    });

    const result = await updatePassword('123');

    expect(result).toEqual({ ok: false, message: 'Password should be at least 6 characters' });
  });
});

describe('hasActiveSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns true when a session exists (happy path)', async () => {
    (mockedAuth.getSession as jest.Mock).mockResolvedValue({ data: { session: { access_token: 'x' } } });

    expect(await hasActiveSession()).toBe(true);
  });

  it('returns false when there is no session (edge case)', async () => {
    (mockedAuth.getSession as jest.Mock).mockResolvedValue({ data: { session: null } });

    expect(await hasActiveSession()).toBe(false);
  });
});

describe('parseRecoveryTokensFromUrl', () => {
  it('extracts access and refresh tokens from a fragment-style recovery URL (happy path)', () => {
    const url = 'zarpeislands://reset-password#access_token=abc123&refresh_token=def456&type=recovery';

    expect(parseRecoveryTokensFromUrl(url)).toEqual({
      accessToken: 'abc123',
      refreshToken: 'def456',
    });
  });

  it('extracts tokens from a query-string-style URL too (edge case)', () => {
    const url = 'zarpeislands://reset-password?access_token=abc123&refresh_token=def456&type=recovery';

    expect(parseRecoveryTokensFromUrl(url)).toEqual({
      accessToken: 'abc123',
      refreshToken: 'def456',
    });
  });

  it('returns null when the URL has no tokens (error case)', () => {
    expect(parseRecoveryTokensFromUrl('zarpeislands://reset-password')).toBeNull();
  });
});

describe('setRecoverySession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets the session and returns ok (happy path)', async () => {
    (mockedAuth.setSession as jest.Mock).mockResolvedValue({ data: {}, error: null });

    const result = await setRecoverySession({ accessToken: 'abc', refreshToken: 'def' });

    expect(mockedAuth.setSession).toHaveBeenCalledWith({ access_token: 'abc', refresh_token: 'def' });
    expect(result).toEqual({ ok: true });
  });

  it('returns an error result when the tokens are rejected (error case)', async () => {
    (mockedAuth.setSession as jest.Mock).mockResolvedValue({
      data: {},
      error: { message: 'invalid token' },
    });

    const result = await setRecoverySession({ accessToken: 'expired', refreshToken: 'expired' });

    expect(result).toEqual({ ok: false, message: 'invalid token' });
  });
});
