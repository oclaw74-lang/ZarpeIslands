import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { AppButton } from '@/components/ui/AppButton';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconCircle } from '@/components/ui/IconCircle';
import { Palette, Spacing } from '@/constants/theme';
import { Boat, BoatStatus, listBoats } from '@/features/boats/api/boatService';
import { getCompanyMembership } from '@/features/company/api/companyService';

const STATUS_TONE: Record<BoatStatus, BadgeTone> = {
  active: 'success',
  in_maintenance: 'warning',
  inactive: 'neutral',
};

/**
 * C1: lista de barcos de la empresa. El botón "Agregar barco" solo se
 * muestra a Owner/Manager (AC#3) — el rol ya está disponible desde B2 vía
 * `getCompanyMembership()`, no hace falta esperar al routing por rol de B3.
 * `includeInactive` en false por default demuestra AC#2 (los inactivos
 * quedan afuera de la vista salvo que se pidan explícitamente).
 *
 * UI-1: filas migradas a `Card` + ícono de barco (`IconCircle`) + `Badge`
 * de estado, con animación de entrada escalonada (`AnimatedListItem`).
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
          <AppButton testID="boats-create" label={t('list.createButton')} onPress={() => router.push('/boats/new')} />
        )}

        {loading ? (
          <ActivityIndicator color={Palette.primary} style={styles.loading} />
        ) : boats.length === 0 ? (
          <EmptyState testID="boats-empty" icon="boat-outline" title={t('list.empty')} />
        ) : (
          <FlatList
            data={boats}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <AnimatedListItem index={index}>
                <Pressable
                  testID={`boat-row-${item.id}`}
                  disabled={!canManage}
                  onPress={() => canManage && router.push(`/boats/${item.id}/edit`)}
                >
                  <Card style={styles.row}>
                    <IconCircle name="boat" />
                    <View style={styles.rowBody}>
                      <View style={styles.rowHeader}>
                        <ThemedText type="smallBold">{item.name}</ThemedText>
                        <Badge tone={STATUS_TONE[item.status]} label={t(`list.status${statusKey(item.status)}`)} />
                      </View>
                      {item.registrationNumber && (
                        <ThemedText type="small">{item.registrationNumber}</ThemedText>
                      )}
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
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
});
