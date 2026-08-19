import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  createJobPosition,
  getJobPosition,
  JobPositionInput,
  updateJobPosition,
} from '@/features/job-positions/api/jobPositionService';
import { getCompanyMembership } from '@/features/company/api/companyService';

const PRIMARY = '#0B4F6C';

/**
 * Sirve tanto para crear (sin `id`) como para editar (`id` viene de la ruta
 * `/job-positions/[id]/edit`) — mismo patrón que `BoatFormScreen` (C1).
 */
export default function JobPositionFormScreen() {
  const { t } = useTranslation('jobPositions');
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(params.id);

  const [loading, setLoading] = useState(isEditing);
  const [name, setName] = useState('');
  const [isRequiredPerShift, setIsRequiredPerShift] = useState(false);
  const [rotationRepeatAllowed, setRotationRepeatAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;

    let mounted = true;
    getJobPosition(params.id).then((position) => {
      if (!mounted || !position) return;
      setName(position.name);
      setIsRequiredPerShift(position.isRequiredPerShift);
      setRotationRepeatAllowed(position.rotationRepeatAllowed);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const input: JobPositionInput = {
      name: name.trim(),
      isRequiredPerShift,
      rotationRepeatAllowed,
    };

    const result = params.id ? await updateJobPosition(params.id, input) : await createForCurrentCompany(input);

    setSubmitting(false);

    if (result.ok) {
      router.back();
      return;
    }

    setError(t('form.unknownError'));
  };

  async function createForCurrentCompany(input: JobPositionInput) {
    const membership = await getCompanyMembership();
    if (!membership) {
      return { ok: false as const, message: 'no-company' };
    }
    return createJobPosition(membership.companyId, input);
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
            testID="job-position-name"
            style={styles.input}
            placeholder={t('form.nameLabel')}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.switchRow}>
            <ThemedText type="small">{t('form.requiredPerShiftLabel')}</ThemedText>
            <Switch
              testID="job-position-required-per-shift"
              value={isRequiredPerShift}
              onValueChange={setIsRequiredPerShift}
            />
          </View>

          <View style={styles.switchRow}>
            <ThemedText type="small">{t('form.rotationRepeatAllowedLabel')}</ThemedText>
            <Switch
              testID="job-position-rotation-repeat-allowed"
              value={rotationRepeatAllowed}
              onValueChange={setRotationRepeatAllowed}
            />
          </View>

          {error.length > 0 && (
            <ThemedText testID="job-position-form-error" type="small" style={styles.error}>
              {error}
            </ThemedText>
          )}

          <Pressable
            testID="job-position-form-submit"
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
    gap: Spacing.three,
  },
  input: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
    minHeight: 48,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
