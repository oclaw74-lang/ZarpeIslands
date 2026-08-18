# Tasks checklist: TASK-3-supabase-client-config

- [ ] Instalar `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`
- [ ] `src/lib/supabase/env.ts` — validador de env tipado, nunca lanza
- [ ] `src/lib/supabase/client.ts` — cliente Supabase con AsyncStorage
- [ ] `src/features/home/screens/MissingConfigScreen.tsx` — pantalla de error claro
- [ ] Modificar `src/app/_layout.tsx` para mostrar `MissingConfigScreen` si falta config
- [ ] Tests unitarios de `env.ts` (happy path, falta URL, falta anon key, faltan ambas)
- [ ] Tests unitarios de `client.ts` (crea cliente si config válida, no crea si falta)
- [ ] Verificar conexión real contra el proyecto Supabase de desarrollo (auth.getSession, storage.listBuckets)
- [ ] Confirmar `.env` sigue gitignored y `.env.example` sin valores reales
