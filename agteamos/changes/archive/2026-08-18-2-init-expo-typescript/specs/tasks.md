# Tasks checklist: TASK-2-init-expo-typescript

- [ ] `npx create-expo-app@latest .` en carpeta temporal y mover contenido al root del repo (o `--yes` en root cuidando no pisar `agteamos/`, `documents/`, `.github/`) — template default (incluye Expo Router + TypeScript)
- [ ] Configurar ESLint + Prettier (`eslint-config-expo` o equivalente) + scripts `lint`/`test`/`typecheck` en `package.json`
- [ ] Crear `app/_layout.tsx` + `app/index.tsx` (capa de ruteo delgada)
- [ ] Crear `src/features/home/screens/HomeScreen.tsx` (placeholder) importado desde `app/index.tsx`
- [ ] Crear `src/components/`, `src/features/`, `src/hooks/`, `src/lib/`, `src/store/`, `src/types/`, `src/constants/`, `src/utils/` con `.gitkeep`
- [ ] Escribir `src/README.md` documentando la convención de carpetas y regla de dependencia (`app/` sin lógica; features no se importan entre sí directo)
- [ ] Agregar smoke test `__tests__/App.test.tsx`
- [ ] Actualizar `.gitignore` raíz con entradas de Expo/Node (mezclando con las 2 líneas ya existentes de `agteamos`)
- [ ] Verificar que `.github/workflows/ci.yml` corre lint/test reales (ya no el mensaje de "no existe package.json")
- [ ] Probar arranque en Android (Expo Go o dev build)
