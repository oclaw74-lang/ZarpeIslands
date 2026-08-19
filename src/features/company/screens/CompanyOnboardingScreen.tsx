import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { BrandFont, Spacing } from '@/constants/theme';
import { bootstrapCompany } from '@/features/company/api/companyService';
import { supabase } from '@/lib/supabase/client';

const PRIMARY = '#0B4F6C';
const BACKGROUND = '#F8F9F5';

const ICON_BADGE = require('@/assets/images/auth-badge.png');

type Status = 'checking' | 'auto-bootstrapping' | 'manual' | 'submitting' | 'error';

/**
 * Se llega acá desde el gate de `src/app/index.tsx`: hay sesión pero
 * todavía no hay fila en `company_members` (ver B2 design.md). El nombre de
 * empresa elegido en `RegisterScreen` viaja en `user_metadata.pending_company_name`
 * (sobrevive el hueco sin sesión de la confirmación de email) — si está,
 * el bootstrap es automático; si no (ej. alguien que entró por Google sin
 * pasar por el registro), se pide a mano.
 */
export default function CompanyOnboardingScreen() {
  const { t } = useTranslation('company');
  const router = useRouter();

  const [status, setStatus] = useState<Status>('checking');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [pendingName, setPendingName] = useState('');

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!supabase) return;

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const metadataName = (user?.user_metadata?.pending_company_name as string | undefined)?.trim();
      const email = user?.email ?? '';

      if (!mounted) return;

      setFullName(email.split('@')[0] ?? '');

      if (metadataName) {
        setPendingName(metadataName);
        setStatus('auto-bootstrapping');
        const result = await bootstrapCompany(metadataName, email.split('@')[0] ?? email);
        if (!mounted) return;

        if (result.ok) {
          router.replace('/');
        } else {
          setStatus('error');
        }
        return;
      }

      setStatus('manual');
    }

    run();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleManualSubmit = async () => {
    setStatus('submitting');
    const result = await bootstrapCompany(companyName.trim(), fullName.trim());

    if (result.ok) {
      router.replace('/');
      return;
    }

    setStatus('error');
  };

  if (status === 'checking' || status === 'auto-bootstrapping') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator color={PRIMARY} />
          {status === 'auto-bootstrapping' && (
            <ThemedText type="small" style={styles.centeredBody}>
              {t('onboarding.settingUpBody', { companyName: pendingName })}
            </ThemedText>
          )}
        </SafeAreaView>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <ThemedText testID="onboarding-error" type="small" style={styles.centeredBody}>
            {t('onboarding.errorTitle')}
          </ThemedText>
          <Pressable testID="onboarding-retry" onPress={() => setStatus('manual')}>
            <ThemedText type="link" style={styles.link}>
              {t('onboarding.retry')}
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.badgeCircle}>
            <Image source={ICON_BADGE} style={styles.badgeImage} resizeMode="contain" />
          </View>
          <ThemedText type="title" style={styles.title}>
            {t('onboarding.manualTitle')}
          </ThemedText>
          <ThemedText type="small" style={styles.centeredBody}>
            {t('onboarding.manualInstructions')}
          </ThemedText>
        </View>

        <TextInput
          testID="onboarding-company-name"
          style={styles.input}
          placeholder={t('onboarding.companyNameLabel')}
          placeholderTextColor="#7C8B93"
          value={companyName}
          onChangeText={setCompanyName}
        />

        <Pressable
          testID="onboarding-submit"
          style={[styles.button, status === 'submitting' && styles.buttonDisabled]}
          disabled={status === 'submitting' || companyName.trim().length === 0}
          onPress={handleManualSubmit}
        >
          {status === 'submitting' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText type="smallBold" style={styles.buttonText}>
              {t('onboarding.submit')}
            </ThemedText>
          )}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  badgeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: 44,
    height: 48,
  },
  title: {
    color: PRIMARY,
    textAlign: 'center',
  },
  centeredBody: {
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D1D6',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: BrandFont.regular,
    fontSize: 16,
    minHeight: 44,
    color: '#0D2740',
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: Spacing.three,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  link: {
    color: PRIMARY,
    textAlign: 'center',
  },
});
