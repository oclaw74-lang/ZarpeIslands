import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * Se muestra en vez de crashear/quedar en blanco cuando falta configuración
 * de entorno requerida (ver src/lib/supabase/env.ts). AC #2 de A2.
 */
export default function MissingConfigScreen({ missing }: { missing: string[] }) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Falta configuración</ThemedText>
        <ThemedText type="small">
          Faltan las siguientes variables de entorno: {missing.join(', ')}
        </ThemedText>
        <ThemedText type="small">Revisa tu archivo .env (ver .env.example).</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
