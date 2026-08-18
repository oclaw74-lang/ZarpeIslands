import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export const PUSH_TOKEN_STORAGE_KEY = 'expoPushToken';

export type RegisterPushResult =
  | { status: 'granted'; token: string }
  | { status: 'denied' }
  | { status: 'error'; message: string };

/**
 * Pide permiso de notificaciones (si no se pidió antes) y, de concederse,
 * obtiene el Expo push token y lo guarda localmente. No envía nada a ningún
 * backend todavía — eso es Epic K, cuando exista la tabla `notifications`
 * y login real (Epic B1).
 *
 * El llamador es responsable de mostrar el mensaje de contexto ANTES de
 * invocar esta función (AC #1) — acá solo se dispara el prompt nativo.
 */
export async function registerForPushNotificationsAsync(): Promise<RegisterPushResult> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { status: 'denied' };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return { status: 'error', message: 'Falta extra.eas.projectId en app.json' };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    // Log temporal para verificación manual en esta etapa (AC #2) — se retira
    // en Epic K cuando el token se envíe al backend real en vez de solo loguearse.
    console.log('Expo push token:', token);
    return { status: 'granted', token };
  } catch (error) {
    return { status: 'error', message: (error as Error).message };
  }
}
