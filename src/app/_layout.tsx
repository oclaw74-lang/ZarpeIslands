import { Sora_400Regular, Sora_600SemiBold, Sora_700Bold, useFonts } from '@expo-google-fonts/sora';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useAuthDeepLinkRedirect } from '@/features/auth/hooks/useAuthDeepLinkRedirect';
import MissingConfigScreen from '@/features/home/screens/MissingConfigScreen';
import '@/lib/i18n';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { useAutoSync } from '@/lib/watermelon/useAutoSync';

SplashScreen.preventAutoHideAsync();

// app/ es una capa de ruteo delgada — el Stack solo referencia rutas,
// la lógica y la UI real viven en src/features/<dominio>/. Ver src/README.md.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const supabaseEnv = getSupabaseEnv();
  const [fontsLoaded] = useFonts({ Sora_400Regular, Sora_600SemiBold, Sora_700Bold });
  useAutoSync();
  useAuthDeepLinkRedirect();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {fontsLoaded &&
        (supabaseEnv.ok ? (
          <Stack screenOptions={{ headerShown: false }} />
        ) : (
          <MissingConfigScreen missing={supabaseEnv.missing} />
        ))}
    </ThemeProvider>
  );
}
