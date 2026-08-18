import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

import { parseRecoveryTokensFromUrl } from '@/features/auth/api/authService';

/**
 * Maneja el deep link de recuperación de Supabase
 * (`zarpeislands://reset-password#access_token=...&refresh_token=...`).
 *
 * expo-router recorta el fragmento antes de resolver la ruta, así que
 * `ResetPasswordScreen` termina montada en `/reset-password` sin forma de
 * leer los tokens ahí. Este hook parsea la URL cruda (arranque en frío vía
 * `getInitialURL`, arranque en caliente vía el evento `url` — que dispara en
 * TODOS los listeners registrados, incluyendo el propio de expo-router, así
 * que no hay problema de "quién lo consume primero") y re-navega con los
 * tokens como query params, que sí persisten y son legibles con
 * `useLocalSearchParams`.
 *
 * Debe ejecutarse desde el root layout — un listener registrado recién
 * dentro de `ResetPasswordScreen` se suscribiría DESPUÉS de que expo-router
 * ya consumió ese mismo evento nativo para decidir la ruta, y se lo perdería
 * (confirmado con un deep link real en emulador: sin este hook, la screen
 * mostraba "link inválido" incluso con tokens de Supabase genuinos).
 *
 * Solo redirige si la URL trae `type=recovery` (B7): el login con Google
 * también recibe una URL con `access_token`/`refresh_token` en el fragmento
 * al volver de `WebBrowser.openAuthSessionAsync`, pero esa promesa ya
 * resuelve el flujo completo dentro de `authService.signInWithGoogle` — si
 * este listener global también la agarrara, redirigiría a
 * `/reset-password` por encima de la navegación a Home que hace
 * `LoginScreen`, una carrera real entre dos código que procesan la misma URL.
 */
export function useAuthDeepLinkRedirect() {
  const router = useRouter();

  useEffect(() => {
    function handleUrl(url: string) {
      if (!url.includes('type=recovery')) return;

      const tokens = parseRecoveryTokensFromUrl(url);
      if (!tokens) return;

      router.replace({
        pathname: '/reset-password',
        params: { access_token: tokens.accessToken, refresh_token: tokens.refreshToken },
      });
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, [router]);
}
