# Tasks checklist: TASK-4-i18n-base

- [ ] Instalar `i18next`, `react-i18next`, `expo-localization`
- [ ] `src/lib/i18n/index.ts` — init con detección de locale del dispositivo
- [ ] `src/lib/i18n/locales/{en,es}/common.json`
- [ ] Test: claves de `en` y `es` coinciden exactamente
- [ ] `LanguageToggle` (componente + test) en `src/features/home/components/`
- [ ] Integrar en `HomeScreen` y `_layout.tsx`
- [ ] Documentar convención de namespaces en `src/README.md`
- [ ] Verificar en emulador: togglear idioma cambia el texto sin recargar la app
