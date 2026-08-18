import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * Placeholder de Home — se reemplaza por el Home real por rol
 * (Owner/Manager/Supervisor/Secretary/Crew) en Epic B (Auth & Company Bootstrap).
 * Ver agteamos/product/roadmap.md y agteamos/product/backlog-detail.md.
 */
export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Zarpe Islands</ThemedText>
        <ThemedText type="small">Project scaffold — Epic A in progress</ThemedText>
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
  },
});
