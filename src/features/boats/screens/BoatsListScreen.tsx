import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AnimatedListItem } from '@/components/ui/AnimatedListItem';
import { Badge, BadgeTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Fab } from '@/components/ui/Fab';
import { PageHero } from '@/components/ui/PageHero';
import { PhotoStrip } from '@/components/ui/PhotoStrip';
import { BoatPhotoGradients, Palette, Spacing } from '@/constants/theme';
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
 * UI-2: header con degradé (`PageHero`) + franja de color por barco
 * (`PhotoStrip`, cíclica por índice) + FAB en vez del botón ancho de UI-1,
 * en respuesta al feedback de que la lista se sentía "plana"/"como una nota".
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <PageHero
          title={t('list.title')}
          subtitle={t('list.fleetCount', { count: boats.length })}
          headerRight={
            <Pressable testID="boats-toggle-inactive" onPress={() => setIncludeInactive((prev) => !prev)}>
              <ThemedText type="small" style={styles.toggle}>
                {includeInactive ? t('list.hideInactive') : t('list.showInactive')}
              </ThemedText>
            </Pressable>
          }
        />

        <View style={styles.body}>
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
                    <Card style={styles.card} flat={false}>
                      <PhotoStrip
                        title={item.name}
                        gradient={BoatPhotoGradients[index % BoatPhotoGradients.length]}
                      />
                      <View style={styles.info}>
                        {item.registrationNumber ? (
                          <ThemedText type="small">{item.registrationNumber}</ThemedText>
                        ) : (
                          <View />
                        )}
                        <Badge tone={STATUS_TONE[item.status]} label={t(`list.status${statusKey(item.status)}`)} />
                      </View>
                    </Card>
                  </Pressable>
                </AnimatedListItem>
              )}
            />
          )}
        </View>

        {canManage && (
          <Fab testID="boats-create" onPress={() => router.push('/boats/new')} />
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
  },
  toggle: {
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  loading: {
    marginTop: Spacing.five,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
  },
});
