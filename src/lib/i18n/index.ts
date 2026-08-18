import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuth from '@/lib/i18n/locales/en/auth.json';
import en from '@/lib/i18n/locales/en/common.json';
import esAuth from '@/lib/i18n/locales/es/auth.json';
import es from '@/lib/i18n/locales/es/common.json';

/**
 * Idiomas soportados. Cada feature agrega su propio namespace (ver
 * src/README.md, sección i18n) sin tocar este archivo salvo para
 * registrar el namespace nuevo en `resources`.
 */
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const resources = {
  en: { common: en, auth: enAuth },
  es: { common: es, auth: esAuth },
};

function detectDeviceLanguage(): SupportedLanguage {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(deviceLocale as SupportedLanguage)
    ? (deviceLocale as SupportedLanguage)
    : 'en';
}

const fallbackFromEnv = process.env.EXPO_PUBLIC_DEFAULT_LOCALE;
const fallbackLng: SupportedLanguage = SUPPORTED_LANGUAGES.includes(
  fallbackFromEnv as SupportedLanguage
)
  ? (fallbackFromEnv as SupportedLanguage)
  : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng,
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React ya escapa por defecto
  },
});

export default i18n;
