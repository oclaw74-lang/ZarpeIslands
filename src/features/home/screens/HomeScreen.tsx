import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import LanguageToggle from '@/features/home/components/LanguageToggle';
import PushNotificationsPanel from '@/features/home/components/PushNotificationsPanel';
import SyncTestPanel from '@/features/home/components/SyncTestPanel';
import { Spacing } from '@/constants/theme';

/**
 * Placeholder de Home — se reemplaza por el Home real por rol
 * (Owner/Manager/Supervisor/Secretary/Crew) en Epic B (Auth & Company Bootstrap).
 * Ver agteamos/product/roadmap.md y agteamos/product/backlog-detail.md.
 */
export default function HomeScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">{t('appName')}</ThemedText>
          <ThemedText type="small">{t('home.scaffoldStatus')}</ThemedText>
          <LanguageToggle />

          <Pressable testID="home-boats-link" onPress={() => router.push('/boats')}>
            <ThemedText type="linkPrimary">Boats (C1)</ThemedText>
          </Pressable>

          <SyncTestPanel />
          <PushNotificationsPanel />
        </ScrollView>
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
  },
  scroll: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
});
