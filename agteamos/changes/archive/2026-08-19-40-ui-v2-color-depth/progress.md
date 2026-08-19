# Progress: UI-2. Header con color, profundidad y stats

**Ticket**: [#40](https://github.com/oclaw74-lang/ZarpeIslands/issues/40)
**Branch**: `feature/40-ui-v2-color-depth`

## Decisions Made

- **Mockup validado antes de tocar código** (Artifact HTML, iterado 2 veces: dirección visual, luego comparación de tipografías Sora/Space Grotesk/Manrope) — evita repetir el ciclo de UI-1 donde el usuario terminó insatisfecho después de implementar directo.
- **Sora confirmado como tipografía de headers/stats** — ya es la marca desde B1, cero costo de nueva fuente.
- **`expo-linear-gradient` nueva dependencia** — acordado implícitamente al aprobar el mockup con degradés; requiere rebuild nativo (`npx expo run:android`), no alcanza con reload de Metro.
- **Gradientes de foto de barco cíclicos por índice** (`BoatPhotoGradients`), no por dato real — no hay fotos de barcos todavía, es un placeholder visual intencional.
- **Stat "Alerts" fijo en 0** en el Home — no hay feature de alertas todavía, placeholder visual documentado como tal.

## Verificación

1. `npx jest` — 33 suites, 117 tests, todos verdes (incluye fix de `__tests__/App.test.tsx`, que no tenía mock de `expo-router`/servicios y rompió al agregar `useFocusEffect` a `HomeScreen`).
2. `npx tsc --noEmit`, `npx eslint src --max-warnings=0` — limpios.
3. **Rebuild nativo real** (`npx expo run:android`) para linkear `expo-linear-gradient` — sin esto la app crashea con `Can't find ViewManager ... ExpoLinearGradient` (confirmado, es el primer error real que apareció en el emulador).
4. **Verificación visual en emulador** contra una empresa real bootstrapeada en Supabase (usuario `ui2-qa-owner@zarpeislands.test`):
   - Home: header con degradé, stats reales (0→1 barco tras crear uno, 5 puestos).
   - Boats: header + card con franja de color + badge "Active" + FAB coral flotante.
   - Job positions: header + cards existentes (sin franja de foto, como se definió en el mockup) + FAB.
5. Usuario y empresa de prueba eliminados al finalizar.

## Files Modified

- `src/components/ui/{PageHero,StatChip,Fab,PhotoStrip}.tsx` (nuevos).
- `src/constants/theme.ts` — `Accent`, `BoatPhotoGradients`.
- `src/components/themed-text.tsx` — tipos `heroTitle`/`sectionTitle`/`statNumber`.
- `src/features/{boats,job-positions,home}/screens/*.tsx` — migrados al hero + FAB.
- `__tests__/App.test.tsx` — agregado mock de `expo-router` y servicios (roto por el nuevo `useFocusEffect` en Home).
- `src/lib/i18n/locales/{en,es}/{boats,jobPositions,common}.json` — nuevas claves de conteo.
- `package.json` — nueva dependencia `expo-linear-gradient`.
- `agteamos/design/DESIGN_SYSTEM.md` — sección UI-2 agregada.

## Evidence

- Mockups del proceso de aprobación: Artifacts efímeros, no versionados en el repo (compartidos por link durante la conversación).
- Capturas del emulador con la implementación real revisadas durante la sesión (no versionadas).
