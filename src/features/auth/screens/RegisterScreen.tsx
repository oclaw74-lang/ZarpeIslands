import { useState } from 'react';
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
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { BrandFont, Spacing } from '@/constants/theme';
import { signUp } from '@/features/auth/api/authService';
import { bootstrapCompany } from '@/features/company/api/companyService';

const PRIMARY = '#0B4F6C';

const HERO_BACKGROUND = require('@/assets/images/zarpeisland-welcome-modern-mobile.png');
const ICON_BADGE = require('@/assets/images/auth-badge.png');

export default function RegisterScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const result = await signUp(email.trim(), password, companyName.trim());

    if (!result.ok) {
      setSubmitting(false);
      setError(t('register.unknownError'));
      return;
    }

    if (!result.sessionActive) {
      // Confirmación de email requerida (mailer_autoconfirm: false en el
      // proyecto real) — el bootstrap de la empresa ocurre recién cuando
      // haya sesión, ver CompanyOnboardingScreen y useAuthDeepLinkRedirect.
      setSubmitting(false);
      router.replace({ pathname: '/check-email', params: { email: email.trim() } });
      return;
    }

    // mailer_autoconfirm en true (no es el caso del proyecto real hoy, pero
    // el código soporta ambos): ya hay sesión, se puede bootstrapear ahora.
    const bootstrapResult = await bootstrapCompany(companyName.trim(), email.trim());
    setSubmitting(false);

    if (bootstrapResult.ok) {
      router.replace('/');
      return;
    }

    setError(t('register.unknownError'));
  };

  return (
    <ImageBackground source={HERO_BACKGROUND} style={styles.background} resizeMode="cover" blurRadius={18}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.card}>
            <View style={styles.badgeCircle}>
              <Image source={ICON_BADGE} style={styles.badgeImage} resizeMode="contain" />
            </View>
            <ThemedText type="title" style={styles.title}>
              {t('register.title')}
            </ThemedText>

            <TextInput
              testID="register-company-name"
              style={styles.input}
              placeholder={t('register.companyNameLabel')}
              placeholderTextColor="#7C8B93"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <TextInput
              testID="register-email"
              style={styles.input}
              placeholder={t('register.emailLabel')}
              placeholderTextColor="#7C8B93"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              testID="register-password"
              style={styles.input}
              placeholder={t('register.passwordLabel')}
              placeholderTextColor="#7C8B93"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              value={password}
              onChangeText={setPassword}
            />

            {error.length > 0 && (
              <ThemedText testID="register-error" type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}

            <Pressable
              testID="register-submit"
              style={[styles.button, submitting && styles.buttonDisabled]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.buttonText}>
                  {t('register.submit')}
                </ThemedText>
              )}
            </Pressable>

            <Pressable testID="register-back-to-login" onPress={() => router.replace('/login')}>
              <ThemedText type="link" style={styles.link}>
                {t('register.alreadyHaveAccount')}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
    fontSize: 28,
    lineHeight: 34,
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
