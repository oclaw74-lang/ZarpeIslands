/**
 * Validador de entorno para el cliente Supabase.
 *
 * Nunca lanza — devuelve un resultado tipado para que la UI decida qué
 * mostrar (ver MissingConfigScreen) en vez de crashear la app o dejarla en
 * blanco cuando falta una variable de entorno (AC #2 de A2).
 */

export type SupabaseEnv =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; missing: string[] };

const REQUIRED_VARS = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export function getSupabaseEnv(): SupabaseEnv {
  const missing = Object.entries(REQUIRED_VARS)
    .filter(([, value]) => !value || value.trim().length === 0)
    .map(([key]) => key);

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    url: REQUIRED_VARS.EXPO_PUBLIC_SUPABASE_URL as string,
    anonKey: REQUIRED_VARS.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  };
}
