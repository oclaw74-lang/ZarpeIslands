import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { AppButton } from '@/components/ui/AppButton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconCircle } from '@/components/ui/IconCircle';
import { Palette, Spacing } from '@/constants/theme';
import { JobPosition, listJobPositions } from '@/features/job-positions/api/jobPositionService';
import { getCompanyMembership } from '@/features/company/api/companyService';

/**
 * C2: catálogo de puestos de trabajo. Se siembra con 5 puestos default al
 * crear la empresa (trigger en la migración, AC#1) — esta lista no crea
 * ese default, solo lo muestra y permite editar/agregar (owner/manager).
 *
 * UI-1: filas migradas a `Card` + ícono (`IconCircle`) + `Badge`s de flags,
 * con animación de entrada escalonada (`AnimatedListItem`).
 */
export default function JobPositionsListScreen() {
  const { t } = useTranslation('jobPositions');
  const router = useRouter();

  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [membership, list] = await Promise.all([getCompanyMembership(), listJobPositions()]);
    setCanManage(
      membership !== undefined && membership !== null && ['owner', 'manager'].includes(membership.accessRole)
    );
    setPositions(list);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">{t('list.title')}</ThemedText>

        {canManage && (
          <AppButton
            testID="job-positions-create"
            label={t('list.createButton')}
            onPress={() => router.push('/job-positions/new')}
          />
        )}

        {loading ? (
          <ActivityIndicator color={Palette.primary} style={styles.loading} />
        ) : positions.length === 0 ? (
          <EmptyState testID="job-positions-empty" icon="briefcase-outline" title={t('list.empty')} />
        ) : (
          <FlatList
            data={positions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <AnimatedListItem index={index}>
                <Pressable
                  testID={`job-position-row-${item.id}`}
                  disabled={!canManage}
                  onPress={() => canManage && router.push(`/job-positions/${item.id}/edit`)}
                >
                  <Card style={styles.row}>
                    <IconCircle name="briefcase" />
                    <View style={styles.rowBody}>
                      <ThemedText type="smallBold">{item.name}</ThemedText>
                      <View style={styles.badgeRow}>
                        {item.isRequiredPerShift && (
                          <Badge tone="primary" label={t('list.requiredPerShift')} />
                        )}
                        {item.rotationRepeatAllowed && (
                          <Badge tone="neutral" label={t('list.rotationRepeatAllowed')} />
                        )}
                      </View>
                    </View>
                  </Card>
                </Pressable>
              </AnimatedListItem>
            )}
          />
        )}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  loading: {
    marginTop: Spacing.five,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowBody: {
    flex: 1,
    gap: Spacing.half,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
