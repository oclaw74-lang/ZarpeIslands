import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BoatStatus, BoatType, createBoat, getBoat, updateBoat } from '@/features/boats/api/boatService';
import { getCompanyMembership } from '@/features/company/api/companyService';

const PRIMARY = '#0B4F6C';
const BOAT_TYPES: BoatType[] = ['excursion', 'rental', 'mixed'];
const STATUSES: BoatStatus[] = ['active', 'in_maintenance', 'inactive'];

/**
 * Sirve tanto para crear (sin `boatId`) como para editar (`boatId` viene de
 * la ruta `/boats/[id]/edit`) — mismo form, ver design.md de C1.
 */
export default function BoatFormScreen() {
  const { t } = useTranslation('boats');
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(params.id);

  const [loading, setLoading] = useState(isEditing);
  const [name, setName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [boatType, setBoatType] = useState<BoatType>('excursion');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<BoatStatus>('active');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;

    let mounted = true;
    getBoat(params.id).then((boat) => {
      if (!mounted || !boat) return;
      setName(boat.name);
      setRegistrationNumber(boat.registrationNumber ?? '');
      setBoatType(boat.boatType);
      setCapacity(boat.capacity !== null ? String(boat.capacity) : '');
      setStatus(boat.status);
      setNotes(boat.notes ?? '');
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const input = {
      name: name.trim(),
      registrationNumber: registrationNumber.trim() || undefined,
      boatType,
      capacity: capacity.trim() ? Number(capacity) : undefined,
      status,
      notes: notes.trim() || undefined,
    };

    const result = params.id ? await updateBoat(params.id, input) : await createForCurrentCompany(input);

    setSubmitting(false);

    if (result.ok) {
      router.back();
      return;
    }

    setError(t('form.unknownError'));
  };

  async function createForCurrentCompany(input: Parameters<typeof createBoat>[1]) {
    const membership = await getCompanyMembership();
    if (!membership) {
      return { ok: false as const, message: 'no-company' };
    }
    return createBoat(membership.companyId, input);
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator color={PRIMARY} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">{isEditing ? t('form.editTitle') : t('form.createTitle')}</ThemedText>

          <TextInput
            testID="boat-name"
            style={styles.input}
            placeholder={t('form.nameLabel')}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            testID="boat-registration"
            style={styles.input}
            placeholder={t('form.registrationNumberLabel')}
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
          />

          <ThemedText type="small">{t('form.boatTypeLabel')}</ThemedText>
          <View style={styles.pillRow}>
            {BOAT_TYPES.map((type) => (
              <Pressable
                key={type}
                testID={`boat-type-${type}`}
                style={[styles.pill, boatType === type && styles.pillSelected]}
                onPress={() => setBoatType(type)}
              >
                <ThemedText type="small" style={boatType === type ? styles.pillTextSelected : undefined}>
                  {t(`form.type${capitalize(type)}`)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            testID="boat-capacity"
            style={styles.input}
            placeholder={t('form.capacityLabel')}
            keyboardType="number-pad"
            value={capacity}
            onChangeText={setCapacity}
          />

          <ThemedText type="small">{t('form.statusLabel')}</ThemedText>
          <View style={styles.pillRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                testID={`boat-status-${s}`}
                style={[styles.pill, status === s && styles.pillSelected]}
                onPress={() => setStatus(s)}
              >
                <ThemedText type="small" style={status === s ? styles.pillTextSelected : undefined}>
                  {t(`list.status${capitalize(s === 'in_maintenance' ? 'InMaintenance' : s)}`)}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            testID="boat-notes"
            style={[styles.input, styles.notesInput]}
            placeholder={t('form.notesLabel')}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {error.length > 0 && (
            <ThemedText testID="boat-form-error" type="small" style={styles.error}>
              {error}
            </ThemedText>
          )}

          <Pressable
            testID="boat-form-submit"
            style={[styles.button, submitting && styles.buttonDisabled]}
            disabled={submitting}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText type="smallBold" style={styles.buttonText}>
                {isEditing ? t('form.submitEdit') : t('form.submitCreate')}
              </ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function capitalize(value: string): string {
  const camel = value.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    minHeight: 48,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    backgroundColor: '#F0F0F3',
  },
  pillSelected: {
    backgroundColor: PRIMARY,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  error: {
    color: '#D64550',
  },
});
