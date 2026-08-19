import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { JobPosition, listJobPositions } from '@/features/job-positions/api/jobPositionService';
import { getCompanyMembership } from '@/features/company/api/companyService';

const PRIMARY = '#0B4F6C';

/**
 * C2: catálogo de puestos de trabajo. Se siembra con 5 puestos default al
 * crear la empresa (trigger en la migración, AC#1) — esta lista no crea
 * ese default, solo lo muestra y permite editar/agregar (owner/manager).
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
          <Pressable
            testID="job-positions-create"
            style={styles.createButton}
            onPress={() => router.push('/job-positions/new')}
          >
            <ThemedText type="smallBold" style={styles.createButtonText}>
              {t('list.createButton')}
            </ThemedText>
          </Pressable>
        )}

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={styles.loading} />
        ) : positions.length === 0 ? (
          <ThemedText testID="job-positions-empty" type="small" style={styles.empty}>
            {t('list.empty')}
          </ThemedText>
        ) : (
          <FlatList
            data={positions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                testID={`job-position-row-${item.id}`}
                style={styles.row}
                disabled={!canManage}
                onPress={() => canManage && router.push(`/job-positions/${item.id}/edit`)}
              >
                <ThemedText type="smallBold">{item.name}</ThemedText>
                <View style={styles.badgeRow}>
                  {item.isRequiredPerShift && (
                    <ThemedText type="small" style={styles.badge}>
                      {t('list.requiredPerShift')}
                    </ThemedText>
                  )}
                  {item.rotationRepeatAllowed && (
                    <ThemedText type="small" style={styles.badge}>
                      {t('list.rotationRepeatAllowed')}
                    </ThemedText>
                  )}
                </View>
              </Pressable>
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
  createButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
  },
  loading: {
    marginTop: Spacing.five,
  },
  empty: {
    marginTop: Spacing.five,
    textAlign: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  badge: {
    color: '#0B4F6C',
  },
});
