import NetInfo from '@react-native-community/netinfo';
import { renderHook } from '@testing-library/react-native';

import { useAutoSync } from '@/lib/watermelon/useAutoSync';
import { synchronizeApp } from '@/lib/watermelon/sync';

jest.mock('@/lib/watermelon/sync', () => ({ synchronizeApp: jest.fn() }));

describe('useAutoSync', () => {
  let listener: (state: { isConnected: boolean; isInternetReachable: boolean | null }) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    (synchronizeApp as jest.Mock).mockResolvedValue(undefined);
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return jest.fn();
    });
  });

  it('does not sync on the initial connected state (edge case — avoids duplicate sync on mount)', () => {
    renderHook(() => useAutoSync());

    listener({ isConnected: true, isInternetReachable: true });

    expect(synchronizeApp).not.toHaveBeenCalled();
  });

  it('syncs when transitioning from offline to online (happy path, AC #2)', () => {
    renderHook(() => useAutoSync());

    listener({ isConnected: false, isInternetReachable: false });
    listener({ isConnected: true, isInternetReachable: true });

    expect(synchronizeApp).toHaveBeenCalledTimes(1);
  });

  it('does not sync again while already online (edge case)', () => {
    renderHook(() => useAutoSync());

    listener({ isConnected: false, isInternetReachable: false });
    listener({ isConnected: true, isInternetReachable: true });
    listener({ isConnected: true, isInternetReachable: true });

    expect(synchronizeApp).toHaveBeenCalledTimes(1);
  });
});
