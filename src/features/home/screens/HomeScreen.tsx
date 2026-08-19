import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { IconCircle } from '@/components/ui/IconCircle';
import { PageHero } from '@/components/ui/PageHero';
import { StatChip } from '@/components/ui/StatChip';
import LanguageToggle from '@/features/home/components/LanguageToggle';
import PushNotificationsPanel from '@/features/home/components/PushNotificationsPanel';
import SyncTestPanel from '@/features/home/components/SyncTestPanel';
import { Accent, Spacing } from '@/constants/theme';
import { listBoats } from '@/features/boats/api/boatService';
import { listJobPositions } from '@/features/job-positions/api/jobPositionService';

/**
 * Placeholder de Home — se reemplaza por el Home real por rol
 * (Owner/Manager/Supervisor/Secretary/Crew) en Epic B (Auth & Company Bootstrap).
 * Ver agteamos/product/roadmap.md y agteamos/product/backlog-detail.md.
 *
 * UI-2: header con degradé (`PageHero`) + stats reales de barcos/puestos, en
 * vez del título plano + links de texto de UI-1 (feedback: "se siente como
 * una nota, no como una app"). "Alerts" queda fijo en 0 — no hay feature de
 * alertas todavía, es un placeholder visual hasta que exista el dato real.
 */
export default function HomeScreen() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const [boatsCount, setBoatsCount] = useState(0);
  const [positionsCount, setPositionsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const [boats, positions] = await Promise.all([listBoats({}), listJobPositions()]);
        if (cancelled) return;
        setBoatsCount(boats.length);
        setPositionsCount(positions.length);
      })();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <PageHero title={t('appName')} subtitle={t('home.scaffoldStatus')}>
          <StatChip testID="home-stat-boats" value={boatsCount} label={t('home.statBoats')} />
          <StatChip testID="home-stat-positions" value={positionsCount} label={t('home.statPositions')} />
          <StatChip testID="home-stat-alerts" value={0} label={t('home.statAlerts')} />
        </PageHero>

        <ScrollView contentContainerStyle={styles.scroll}>
          <LanguageToggle />

          <Pressable testID="home-boats-link" onPress={() => router.push('/boats')}>
            <Card style={styles.navCard}>
              <IconCircle name="boat" />
              <ThemedText type="smallBold">Boats (C1)</ThemedText>
            </Card>
          </Pressable>

          <Pressable testID="home-job-positions-link" onPress={() => router.push('/job-positions')}>
            <Card style={styles.navCard}>
              <IconCircle name="briefcase" color={Accent.coral} backgroundColor={Accent.coralTint} />
              <ThemedText type="smallBold">Job positions (C2)</ThemedText>
            </Card>
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
