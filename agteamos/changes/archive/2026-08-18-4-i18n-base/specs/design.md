# Technical Design: TASK-4-i18n-base

## Approach

`i18next` + `react-i18next`, con `expo-localization` para detectar el idioma del dispositivo al arrancar. Inglés es el locale base del código (claves en inglés, ej. `common.appName`), español vive completo desde el día uno como segundo archivo de traducción. Estructura de namespaces por feature (`locales/<lang>/<namespace>.json`) para que cada epic agregue el suyo sin tocar un archivo compartido gigante.

Persistencia del idioma elegido por el usuario entre reinicios queda fuera de este ticket — se resuelve en Epic B6 (Perfil), donde el idioma vive en `company_members.preferred_language` (backend), no solo en el dispositivo.

Fuentes: [Expo Localization docs](https://docs.expo.dev/versions/latest/sdk/localization/), [Phrase — React Native i18n with Expo and i18next](https://phrase.com/blog/posts/react-native-i18n-with-expo-and-i18next-part-1/).

## Files to Create

| File | Description |
|------|--------------|
| `src/lib/i18n/index.ts` | Inicializa `i18next`: detecta locale del dispositivo vía `expo-localization`, `fallbackLng: 'en'`, registra los namespaces disponibles |
| `src/lib/i18n/locales/en/common.json` | Namespace de ejemplo, inglés (claves base) |
| `src/lib/i18n/locales/es/common.json` | Namespace de ejemplo, español |
| `src/lib/i18n/__tests__/index.test.ts` | Verifica que `en`/`es` tengan exactamente las mismas claves (evita traducciones incompletas por typo) |
| `src/features/home/components/LanguageToggle.tsx` | Botón de prueba EN/ES — demuestra cambio de idioma en caliente (AC #1), placeholder hasta que Epic B6 lo reemplace por el selector real de Perfil |
| `src/features/home/components/__tests__/LanguageToggle.test.tsx` | Test de componente: togglear cambia el texto renderizado sin remount |

## Files to Modify

| File | What changes |
|------|--------------|
| `src/app/_layout.tsx` | Importa `@/lib/i18n` (side-effect, inicializa antes del primer render) |
| `src/features/home/screens/HomeScreen.tsx` | Usa `useTranslation('common')` para su texto; agrega `<LanguageToggle />` |
| `src/README.md` | Nueva sección: convención de namespaces de i18n (AC #3) |
| `package.json` | + `i18next`, `react-i18next`, `expo-localization` |

## Database Changes

Ninguno.

## API Changes

Ninguno.

## Environment Variables

Ninguna nueva — `EXPO_PUBLIC_DEFAULT_LOCALE` ya existe en `.env.example` (Step 1 de `agteamos-new-project`) y se usa como `fallbackLng` si está definida, si no `'en'`.

## Security Considerations

Ninguna superficie nueva.
