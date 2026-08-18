import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import MissingConfigScreen from '@/features/home/screens/MissingConfigScreen';
import { getSupabaseEnv } from '@/lib/supabase/env';

SplashScreen.preventAutoHideAsync();

// app/ es una capa de ruteo delgada — el Stack solo referencia rutas,
// la lógica y la UI real viven en src/features/<dominio>/. Ver src/README.md.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const supabaseEnv = getSupabaseEnv();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {supabaseEnv.ok ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <MissingConfigScreen missing={supabaseEnv.missing} />
      )}
    </ThemeProvider>
  );
}
