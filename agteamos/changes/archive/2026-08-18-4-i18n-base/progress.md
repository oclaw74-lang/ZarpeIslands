# Progress: A3. i18n base (inglés/español)

**Ticket**: [#4](https://github.com/oclaw74-lang/ZarpeIslands/issues/4) — Epic A: [#1](https://github.com/oclaw74-lang/ZarpeIslands/issues/1)
**Branch**: `feature/4-i18n-base`

## Next Action

Step 7-8 completos. Listo para Step 9 (close-task).

## Decisions Made

- **2026-08-18**: Persistencia del idioma elegido entre reinicios queda fuera de alcance — se resuelve en Epic B6 (Perfil), donde vive en `company_members.preferred_language`. `LanguageToggle` es un componente de prueba, reemplazado por el selector real en ese ticket.
- **2026-08-18**: Se removió la opción `compatibilityJSON: 'v4'` del init de i18next — innecesaria desde i18next v22+ (instalada: v26.3.6), ese comportamiento ya es el default.

## Files Modified

| Archivo | Qué cambia |
|---|---|
| `package.json` | + `i18next`, `react-i18next`, `expo-localization` |
| `app.json` | Plugin `expo-localization` agregado automáticamente por `expo install` |
| `src/lib/i18n/index.ts` | Nuevo — init de i18next, detección de locale del dispositivo, `fallbackLng` desde `EXPO_PUBLIC_DEFAULT_LOCALE` o `en` |
| `src/lib/i18n/locales/{en,es}/common.json` | Nuevo — namespace de ejemplo |
| `src/features/home/components/LanguageToggle.tsx` | Nuevo — botón de prueba EN/ES |
| `src/features/home/screens/HomeScreen.tsx` | Usa `useTranslation('common')`, agrega `<LanguageToggle />` |
| `src/app/_layout.tsx` | Importa `@/lib/i18n` (side-effect, inicializa antes del primer render) |
| `src/README.md` | + sección "i18n — convención de namespaces" (AC #3) |

## Unit Tests Written

| Test | Tipo | Resultado |
|---|---|---|
| `i18n/index.test.ts` — en/es tienen exactamente las mismas claves | Happy path / regression guard | ✅ Pass |
| `i18n/index.test.ts` — ningún valor de traducción vacío | Edge case | ✅ Pass |
| `LanguageToggle.test.tsx` — muestra inglés por defecto | Happy path | ✅ Pass |
| `LanguageToggle.test.tsx` — togglear cambia a español sin remount | Edge case | ✅ Pass |
| `LanguageToggle.test.tsx` — dos toques vuelve a inglés | Edge case | ✅ Pass |

## Verificación de Acceptance Criteria

| AC | Verificación | Resultado |
|---|---|---|
| #1 — selector de prueba cambia idioma sin reiniciar | Verificado en emulador Android real: toque en "Switch language" cambió todo el texto a español instantáneamente (sin recargar la app) | ✅ Pass |
| #2 — namespace `common` con claves en `en`/`es` | `src/lib/i18n/locales/{en,es}/common.json`, test de paridad de claves | ✅ Pass |
| #3 — documentado en `src/README.md` | Sección "i18n — convención de namespaces" agregada | ✅ Pass |

## Evidence (screenshots)

- `evidence/android-emulator-a3-en.png` — Home en inglés (locale del dispositivo)
- `evidence/android-emulator-a3-es.png` — mismo Home tras tocar el toggle, en español, sin reiniciar
