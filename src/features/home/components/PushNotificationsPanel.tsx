import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { registerForPushNotificationsAsync } from '@/lib/notifications/pushToken';

type Step = 'context' | 'requesting' | 'granted' | 'denied' | 'error' | 'blocked-firebase';

/**
 * En Android (fuera de Expo Go), `getExpoPushTokenAsync` requiere Firebase
 * inicializado nativamente (google-services.json) incluso solo para MINTEAR
 * el token — no es exclusivo de recibir pushes reales (eso ya lo sabíamos).
 * Firebase se crea recién en Epic K (ver decisión en progress.md de esta
 * tarea), así que este error puntual se distingue de un error genérico.
 */
function isFirebaseNotConfiguredError(message: string): boolean {
  return message.includes('FirebaseApp is not initialized') || message.includes('Firebase Messaging');
}

/**
 * Panel de prueba temporal para A5 — muestra el mensaje de contexto ANTES
 * del prompt nativo (AC #1) y el resultado del token obtenido (AC #2).
 * Placeholder hasta que Epic K defina dónde se pide esto de verdad en el
 * flujo de la app.
 */
export default function PushNotificationsPanel() {
  const [step, setStep] = useState<Step>('context');
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEnable = async () => {
    setStep('requesting');
    const result = await registerForPushNotificationsAsync();

    if (result.status === 'granted') {
      setToken(result.token);
      setStep('granted');
    } else if (result.status === 'denied') {
      setStep('denied');
    } else if (isFirebaseNotConfiguredError(result.message)) {
      setStep('blocked-firebase');
    } else {
      setErrorMessage(result.message);
      setStep('error');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">Push notifications (A5)</ThemedText>

      {step === 'context' && (
        <>
          <ThemedText type="small">
            Te avisamos cuando un mantenimiento esté por vencer, se apruebe una solicitud, o cambie tu
            turno — incluso si la app está cerrada.
          </ThemedText>
          <Pressable onPress={handleEnable}>
            <ThemedText type="link">Habilitar notificaciones</ThemedText>
          </Pressable>
        </>
      )}

      {step === 'requesting' && <ThemedText type="small">Solicitando permiso...</ThemedText>}

      {step === 'granted' && (
        <ThemedText type="small" numberOfLines={2}>
          Token obtenido: {token}
        </ThemedText>
      )}

      {step === 'denied' && (
        <ThemedText type="small">Permiso denegado — no se pueden enviar notificaciones.</ThemedText>
      )}

      {step === 'blocked-firebase' && (
        <ThemedText type="small">
          Permiso concedido — falta configurar Firebase para obtener el token en Android. Se completa en
          Epic K.
        </ThemedText>
      )}

      {step === 'error' && <ThemedText type="small">Error: {errorMessage}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.half,
    marginTop: Spacing.four,
  },
});
