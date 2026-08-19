import { Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const PRIMARY = '#0B4F6C';

const HERO_BACKGROUND = require('@/assets/images/zarpeisland-welcome-modern-mobile.png');
const ICON_BADGE = require('@/assets/images/auth-badge.png');

/**
 * Se muestra después de registrarse cuando el proyecto requiere confirmar el
 * email antes de dar sesión (`mailer_autoconfirm: false`, ver B2 design.md).
 * El bootstrap real de la empresa ocurre después, cuando el usuario vuelve
 * por el deep link de confirmación (`useAuthDeepLinkRedirect`) y llega
 * autenticado a `/onboarding`.
 */
export default function CheckEmailScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  return (
    <ImageBackground source={HERO_BACKGROUND} style={styles.background} resizeMode="cover" blurRadius={18}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <View style={styles.badgeCircle}>
            <Image source={ICON_BADGE} style={styles.badgeImage} resizeMode="contain" />
          </View>
          <ThemedText type="title" style={styles.title}>
            {t('checkEmail.title')}
          </ThemedText>
          <ThemedText type="small" style={styles.body}>
            {t('checkEmail.instructions', { email: params.email ?? '' })}
          </ThemedText>

          <Pressable testID="check-email-back-to-login" onPress={() => router.replace('/login')}>
            <ThemedText type="link" style={styles.link}>
              {t('checkEmail.backToLogin')}
            </ThemedText>
          </Pressable>
        </View>
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
  body: {
    textAlign: 'center',
  },
  link: {
    color: PRIMARY,
    textAlign: 'center',
  },
});
