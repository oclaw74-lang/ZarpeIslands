import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { IconCircle } from '@/components/ui/IconCircle';
import LanguageToggle from '@/features/home/components/LanguageToggle';
import PushNotificationsPanel from '@/features/home/components/PushNotificationsPanel';
import SyncTestPanel from '@/features/home/components/SyncTestPanel';
import { Palette, Spacing } from '@/constants/theme';

/**
 * Placeholder de Home — se reemplaza por el Home real por rol
 * (Owner/Manager/Supervisor/Secretary/Crew) en Epic B (Auth & Company Bootstrap).
 * Ver agteamos/product/roadmap.md y agteamos/product/backlog-detail.md.
 *
 * UI-1: los links de navegación temporales pasaron a tarjetas con ícono
 * (mismo patrón que las listas de Boats/Job positions), en vez de texto suelto.
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

          <Pressable testID="home-boats-link" onPress={() => router.push('/boats')} style={styles.navCard}>
            <Card style={styles.navCardInner}>
              <IconCircle name="boat" />
              <ThemedText type="smallBold">Boats (C1)</ThemedText>
            </Card>
          </Pressable>

          <Pressable
            testID="home-job-positions-link"
            onPress={() => router.push('/job-positions')}
            style={styles.navCard}
          >
            <Card style={styles.navCardInner}>
              <IconCircle name="briefcase" color={Palette.accent} />
              <ThemedText type="smallBold">Job positions (C2)</ThemedText>
            </Card>
          </Pressable>

          <View style={styles.panels}>
            <SyncTestPanel />
            <PushNotificationsPanel />
          </View>
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
    alignItems: 'stretch',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  navCard: {
    width: '100%',
  },
  navCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  panels: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
