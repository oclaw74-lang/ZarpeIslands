import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { BrandFont, Spacing } from '@/constants/theme';

const HERO_BACKGROUND = require('@/assets/images/zarpeisland-welcome-modern-mobile.png');
const ICON_BADGE = require('@/assets/images/auth-badge.png');

/**
 * Primera pantalla que ve alguien sin sesión — antes de pedirle credenciales
 * de una, se le muestra qué es la app (patrón estándar de onboarding: un solo
 * welcome screen enfocado en valor, sin carrusel — la app es una herramienta
 * operativa, no un producto de consumo que necesite varios slides).
 * Ver progress.md de esta tarea para las fuentes consultadas.
 *
 * Fondo e íconos: arte generado por el usuario (assets/images/zarpeisland-*),
 * no assets finales de un diseñador — reemplazar si en algún momento existen.
 */
export default function WelcomeScreen() {
  const { t } = useTranslation('auth');
  const router = useRouter();

  return (
    <ImageBackground source={HERO_BACKGROUND} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Image source={ICON_BADGE} style={styles.badge} resizeMode="contain" />
          <View style={styles.headerTextBackdrop}>
            <Text style={styles.appName}>zarpeIsland</Text>
            <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

          <Pressable testID="welcome-get-started" style={styles.primaryButton} onPress={() => router.push('/login')}>
            <Text style={styles.primaryButtonText}>{t('welcome.getStarted')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const TEXT_SHADOW = {
  textShadowColor: 'rgba(4, 20, 33, 0.65)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 6,
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  badge: {
    width: 68,
    height: 75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  headerTextBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(6, 20, 33, 0.45)',
    borderRadius: 18,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  appName: {
    ...TEXT_SHADOW,
    fontFamily: BrandFont.bold,
    color: '#FFFFFF',
    fontSize: 34,
  },
  tagline: {
    ...TEXT_SHADOW,
    fontFamily: BrandFont.regular,
    color: '#E4F4F8',
    fontSize: 14,
    letterSpacing: 1,
  },
  footer: {
    gap: Spacing.three,
  },
  subtitle: {
    ...TEXT_SHADOW,
    fontFamily: BrandFont.regular,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: Spacing.three,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: BrandFont.bold,
    color: '#0B4F6C',
    fontSize: 16,
  },
});
