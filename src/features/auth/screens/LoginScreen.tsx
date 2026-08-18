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
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/themed-text';
import { BrandFont, Spacing } from '@/constants/theme';
import { signIn, signInWithGoogle } from '@/features/auth/api/authService';

// Paleta de agteamos/design/DESIGN_SYSTEM.md — Deep Ocean (primario).
const PRIMARY = '#0B4F6C';

const HERO_BACKGROUND = require('@/assets/images/zarpeisland-welcome-modern-mobile.png');
const ICON_BADGE = require('@/assets/images/auth-badge.png');

export default function LoginScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const result = await signIn(email.trim(), password);

    setSubmitting(false);

    if (result.ok) {
      router.replace('/');
      return;
    }

    setError(result.message === 'invalid-credentials' ? t('login.genericError') : t('login.unknownError'));
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleSubmitting(true);

    const redirectTo = Linking.createURL('login');
    const result = await signInWithGoogle(redirectTo);

    setGoogleSubmitting(false);

    if (result.ok) {
      router.replace('/');
      return;
    }

    // AC#3: cancelar el flujo de Google no debe mostrar un error falso.
    if (result.message === 'cancelled') return;

    setError(t('login.unknownError'));
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
              {t('login.title')}
            </ThemedText>

            <TextInput
              testID="login-email"
              style={styles.input}
              placeholder={t('login.emailLabel')}
              placeholderTextColor="#7C8B93"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              testID="login-password"
              style={styles.input}
              placeholder={t('login.passwordLabel')}
              placeholderTextColor="#7C8B93"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              value={password}
              onChangeText={setPassword}
            />

            {error.length > 0 && (
              <ThemedText testID="login-error" type="small" style={styles.error}>
                {error}
              </ThemedText>
            )}

            <Pressable
              testID="login-submit"
              style={[styles.button, submitting && styles.buttonDisabled]}
              disabled={submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.buttonText}>
                  {t('login.submit')}
                </ThemedText>
              )}
            </Pressable>

            <Pressable testID="login-forgot-password" onPress={() => router.push('/forgot-password')}>
              <ThemedText type="link" style={styles.link}>
                {t('login.forgotPassword')}
              </ThemedText>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <ThemedText type="small" style={styles.dividerText}>
                {t('login.orDivider')}
              </ThemedText>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              testID="login-google"
              style={[styles.googleButton, googleSubmitting && styles.buttonDisabled]}
              disabled={googleSubmitting}
              onPress={handleGoogleSignIn}
            >
              {googleSubmitting ? (
                <ActivityIndicator color={PRIMARY} />
              ) : (
                <ThemedText type="smallBold" style={styles.googleButtonText}>
                  {t('login.continueWithGoogle')}
                </ThemedText>
              )}
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
    fontSize: 30,
    lineHeight: 36,
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9E1E4',
  },
  dividerText: {
    color: '#7C8B93',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1E4',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#0D2740',
    fontSize: 16,
  },
});
