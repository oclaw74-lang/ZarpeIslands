# Tasks checklist: TASK-14-watermelondb-client

- [ ] Instalar `@nozbe/watermelondb`, plugin de Expo, `expo-build-properties`, `@react-native-community/netinfo`
- [ ] Configurar plugin en `app.json`
- [ ] `schema.ts`, `models/Punch.ts`, `database.ts`
- [ ] **Checkpoint de riesgo**: `expo prebuild --clean` + `expo run:android` — confirmar que compila antes de seguir
- [ ] `sync.ts` (synchronizeApp) + `useAutoSync.ts`
- [ ] `SyncTestPanel` de prueba
- [ ] Verificar AC#1 en emulador (modo avión)
- [ ] Verificar AC#2 en emulador (reconectar)
- [ ] Verificar AC#3 (aislamiento, 2 sesiones)
- [ ] Tests unitarios de `sync.ts`
