import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Boat, BoatStatus, listBoats } from '@/features/boats/api/boatService';
import { getCompanyMembership } from '@/features/company/api/companyService';

const PRIMARY = '#0B4F6C';
const STATUS_COLORS: Record<BoatStatus, string> = {
  active: '#2E8B57',
  in_maintenance: '#E9B44C',
  inactive: '#6C8791',
};

/**
 * C1: lista de barcos de la empresa. El botón "Agregar barco" solo se
 * muestra a Owner/Manager (AC#3) — el rol ya está disponible desde B2 vía
 * `getCompanyMembership()`, no hace falta esperar al routing por rol de B3.
 * `includeInactive` en false por default demuestra AC#2 (los inactivos
 * quedan afuera de la vista salvo que se pidan explícitamente).
 */
export default function BoatsListScreen() {
  const { t } = useTranslation('boats');
  const router = useRouter();

  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [canManage, setCanManage] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [membership, boatList] = await Promise.all([
      getCompanyMembership(),
      listBoats({ includeInactive }),
    ]);
    setCanManage(
      membership !== undefined && membership !== null && ['owner', 'manager'].includes(membership.accessRole)
    );
    setBoats(boatList);
    setLoading(false);
  }, [includeInactive]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title">{t('list.title')}</ThemedText>
          <Pressable testID="boats-toggle-inactive" onPress={() => setIncludeInactive((prev) => !prev)}>
            <ThemedText type="link">
              {includeInactive ? t('list.hideInactive') : t('list.showInactive')}
            </ThemedText>
          </Pressable>
        </View>

        {canManage && (
          <Pressable
            testID="boats-create"
            style={styles.createButton}
            onPress={() => router.push('/boats/new')}
          >
            <ThemedText type="smallBold" style={styles.createButtonText}>
              {t('list.createButton')}
            </ThemedText>
          </Pressable>
        )}

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={styles.loading} />
        ) : boats.length === 0 ? (
          <ThemedText testID="boats-empty" type="small" style={styles.empty}>
            {t('list.empty')}
          </ThemedText>
        ) : (
          <FlatList
            data={boats}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                testID={`boat-row-${item.id}`}
                style={styles.row}
                disabled={!canManage}
                onPress={() => canManage && router.push(`/boats/${item.id}/edit`)}
              >
                <View style={styles.rowHeader}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                  <ThemedText type="small">{t(`list.status${statusKey(item.status)}`)}</ThemedText>
                </View>
                {item.registrationNumber && (
                  <ThemedText type="small">{item.registrationNumber}</ThemedText>
                )}
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function statusKey(status: BoatStatus): string {
  return { active: 'Active', in_maintenance: 'InMaintenance', inactive: 'Inactive' }[status];
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
