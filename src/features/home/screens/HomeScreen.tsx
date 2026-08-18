import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">{t('appName')}</ThemedText>
        <ThemedText type="small">{t('home.scaffoldStatus')}</ThemedText>
        <LanguageToggle />
        <SyncTestPanel />
        <PushNotificationsPanel />
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
