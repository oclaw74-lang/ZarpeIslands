import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { PUSH_TOKEN_STORAGE_KEY, registerForPushNotificationsAsync } from '@/lib/notifications/pushToken';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { extra: { eas: { projectId: 'test-project-id' } } },
}));

describe('registerForPushNotificationsAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests permission, gets a token and stores it when already granted (happy path)', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[abc]' });

    const result = await registerForPushNotificationsAsync();

    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'granted', token: 'ExponentPushToken[abc]' });
    expect(await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY)).toBe('ExponentPushToken[abc]');
  });

  it('prompts for permission when not previously granted (happy path)', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'ExponentPushToken[xyz]' });

    const result = await registerForPushNotificationsAsync();

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'granted', token: 'ExponentPushToken[xyz]' });
  });

  it('returns denied when permission is refused (error case)', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const result = await registerForPushNotificationsAsync();

    expect(result).toEqual({ status: 'denied' });
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('returns an error result when projectId is missing (edge case)', async () => {
    (Constants as unknown as { expoConfig: { extra: object } }).expoConfig = { extra: {} };
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

    const result = await registerForPushNotificationsAsync();

    expect(result.status).toBe('error');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });
});
