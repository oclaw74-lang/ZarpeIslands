import { renderHook } from '@testing-library/react-native';
import * as Linking from 'expo-linking';

import { useAuthDeepLinkRedirect } from '@/features/auth/hooks/useAuthDeepLinkRedirect';
import { setRecoverySession } from '@/features/auth/api/authService';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/features/auth/api/authService', () => {
  const actual = jest.requireActual('@/features/auth/api/authService');
  return { ...actual, setRecoverySession: jest.fn() };
});

const mockRemove = jest.fn();
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
}));

describe('useAuthDeepLinkRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(null);
    (Linking.addEventListener as jest.Mock).mockReturnValue({ remove: mockRemove });
    (setRecoverySession as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('redirects to /reset-password with the tokens when the initial URL is a recovery link (happy path / cold start)', async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(
      'zarpeislands://reset-password#access_token=abc&refresh_token=def&type=recovery'
    );

    renderHook(() => useAuthDeepLinkRedirect());

    await new Promise((resolve) => setImmediate(() => resolve(undefined)));

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/reset-password',
      params: { access_token: 'abc', refresh_token: 'def' },
    });
  });

  it('redirects when a recovery link arrives via the url event while the app is already running (edge case / warm start)', () => {
    renderHook(() => useAuthDeepLinkRedirect());

    const handler = (Linking.addEventListener as jest.Mock).mock.calls[0][1];
    handler({ url: 'zarpeislands://reset-password#access_token=xyz&refresh_token=uvw&type=recovery' });

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/reset-password',
      params: { access_token: 'xyz', refresh_token: 'uvw' },
    });
  });

  it('does not redirect for URLs without recovery tokens (error case)', async () => {
    (Linking.getInitialURL as jest.Mock).mockResolvedValue('zarpeislands://welcome');

    renderHook(() => useAuthDeepLinkRedirect());

    await new Promise((resolve) => setImmediate(() => resolve(undefined)));

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect for a Google OAuth callback URL, even with tokens (edge case / B7 race guard)', () => {
    renderHook(() => useAuthDeepLinkRedirect());

    const handler = (Linking.addEventListener as jest.Mock).mock.calls[0][1];
    handler({ url: 'zarpeislands://login#access_token=abc&refresh_token=def&token_type=bearer' });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('establishes the session and redirects to Home for a signup confirmation link (happy path / B2)', async () => {
    renderHook(() => useAuthDeepLinkRedirect());

    const handler = (Linking.addEventListener as jest.Mock).mock.calls[0][1];
    handler({ url: 'zarpeislands://register#access_token=abc&refresh_token=def&type=signup' });

    await new Promise((resolve) => setImmediate(() => resolve(undefined)));

    expect(setRecoverySession).toHaveBeenCalledWith({ accessToken: 'abc', refreshToken: 'def' });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('removes the event subscription on unmount (edge case)', () => {
    const { unmount } = renderHook(() => useAuthDeepLinkRedirect());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
