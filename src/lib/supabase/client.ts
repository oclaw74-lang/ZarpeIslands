import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { getSupabaseEnv } from '@/lib/supabase/env';

/**
 * Cliente Supabase de la app. `null` si falta configuración de entorno —
 * quien lo consuma debe manejar ese caso (en la práctica, `_layout.tsx`
 * muestra `MissingConfigScreen` antes de que cualquier pantalla intente
 * usar `supabase`).
 */
export const supabase: SupabaseClient | null = (() => {
  const env = getSupabaseEnv();
  if (!env.ok) {
    return null;
  }

  return createClient(env.url, env.anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
})();
