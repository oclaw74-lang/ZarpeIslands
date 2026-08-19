import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

import { synchronizeApp } from '@/lib/watermelon/sync';

/**
 * Dispara synchronizeApp() automáticamente al recuperar conectividad
 * (AC #2 de A4/A4c). No dispara en el primer render si ya hay conexión
 * (evita un sync duplicado con el que dispare la pantalla que lo necesite
 * explícitamente) — solo en la transición offline → online.
 */
export function useAutoSync() {
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

      if (isOnline && wasOffline.current) {
        synchronizeApp().catch((error) => {
          console.error('Auto-sync failed:', error);
        });
      }

      wasOffline.current = !isOnline;
    });

    return unsubscribe;
  }, []);
}
