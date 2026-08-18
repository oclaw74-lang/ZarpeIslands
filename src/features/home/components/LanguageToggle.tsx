import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { Spacing } from '@/constants/theme';

/**
 * Botón de prueba para demostrar el cambio de idioma en caliente (AC #1 de
 * A3). Placeholder — Epic B6 (Perfil) lo reemplaza por el selector real,
 * persistido en `company_members.preferred_language`.
 */
export default function LanguageToggle() {
  const { t, i18n } = useTranslation('common');

  const toggleLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(
      i18n.language as (typeof SUPPORTED_LANGUAGES)[number]
    );
    const nextLanguage = SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <Pressable onPress={toggleLanguage} style={styles.button}>
      <ThemedText type="small">{t('language.current')}</ThemedText>
      <ThemedText type="link">{t('language.toggleLabel')}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    gap: Spacing.half,
  },
});
