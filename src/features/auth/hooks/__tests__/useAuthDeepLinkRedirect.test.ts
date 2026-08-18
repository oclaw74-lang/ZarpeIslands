import { renderHook } from '@testing-library/react-native';
import * as Linking from 'expo-linking';

import { useAuthDeepLinkRedirect } from '@/features/auth/hooks/useAuthDeepLinkRedirect';

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

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

  it('removes the event subscription on unmount (edge case)', () => {
    const { unmount } = renderHook(() => useAuthDeepLinkRedirect());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });
});
