import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { BrandFont, Spacing } from '@/constants/theme';
import { setRecoverySession, updatePassword } from '@/features/auth/api/authService';

const PRIMARY = '#0B4F6C';

const HERO_BACKGROUND = require('@/assets/images/zarpeisland-welcome-modern-mobile.png');
const ICON_BADGE = require('@/assets/images/auth-badge.png');

/**
 * Se llega acá vía `useAuthDeepLinkRedirect` (root layout), que ya extrajo
 * `access_token`/`refresh_token` del deep link de recuperación de Supabase y
 * los pasó como query params — ver ese hook para por qué no se leen acá
 * directo del link (race condition con el listener de `Linking` de
 * expo-router).
 */
export default function ResetPasswordScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>();

  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid'>('loading');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function establishSession() {
      if (!params.access_token || !params.refresh_token) {
        if (mounted) setStatus('invalid');
        return;
      }

      const result = await setRecoverySession({
        accessToken: params.access_token,
        refreshToken: params.refresh_token,
      });
      if (mounted) setStatus(result.ok ? 'ready' : 'invalid');
    }

    establishSession();
    return () => {
      mounted = false;
    };
  }, [params.access_token, params.refresh_token]);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const result = await updatePassword(password);

    setSubmitting(false);

    if (result.ok) {
      setDone(true);
      return;
    }

    setError(t('login.unknownError'));
  };

  return (
    <ImageBackground source={HERO_BACKGROUND} style={styles.background} resizeMode="cover" blurRadius={18}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {status === 'loading' && (
          <View style={styles.centered}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        {status === 'invalid' && (
          <View style={styles.keyboardAvoiding}>
            <View style={styles.card}>
              <ThemedText testID="reset-password-invalid" type="small" style={styles.centeredBody}>
                {t('resetPassword.invalidLink')}
              </ThemedText>
              <Pressable onPress={() => router.replace('/login')}>
                <ThemedText type="link" style={styles.link}>
                  {t('resetPassword.goToLogin')}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {status === 'ready' && (
          <KeyboardAvoidingView
            style={styles.keyboardAvoiding}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.card}>
              <View style={styles.badgeCircle}>
                <Image source={ICON_BADGE} style={styles.badgeImage} resizeMode="contain" />
              </View>
              <ThemedText type="title" style={styles.title}>
                {t('resetPassword.title')}
              </ThemedText>

              {done ? (
                <>
                  <ThemedText testID="reset-password-success" type="small" style={styles.centeredBody}>
                    {t('resetPassword.success')}
                  </ThemedText>
                  <Pressable onPress={() => router.replace('/login')}>
                    <ThemedText type="link" style={styles.link}>
                      {t('resetPassword.goToLogin')}
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    testID="reset-password-input"
                    style={styles.input}
                    placeholder={t('resetPassword.passwordLabel')}
                    placeholderTextColor="#7C8B93"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />

                  {error.length > 0 && (
                    <ThemedText testID="reset-password-error" type="small" style={styles.error}>
                      {error}
                    </ThemedText>
                  )}

                  <Pressable
                    testID="reset-password-submit"
                    style={[styles.button, submitting && styles.buttonDisabled]}
                    disabled={submitting}
                    onPress={handleSubmit}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <ThemedText type="smallBold" style={styles.buttonText}>
                        {t('resetPassword.submit')}
                      </ThemedText>
                    )}
                  </Pressable>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 20, 33, 0.4)',
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoiding: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: Spacing.five,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  badgeCircle: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  badgeImage: {
    width: 44,
    height: 48,
  },
  title: {
    color: PRIMARY,
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 32,
  },
  centeredBody: {
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F3F6F7',
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: BrandFont.regular,
    fontSize: 16,
    minHeight: 50,
    color: '#0D2740',
  },
  button: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  link: {
    color: PRIMARY,
    textAlign: 'center',
  },
  error: {
    color: '#D64550',
  },
});
