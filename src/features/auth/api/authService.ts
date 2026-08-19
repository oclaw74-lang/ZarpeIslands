import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase/client';

export type AuthResult = { ok: true } | { ok: false; message: string };

/**
 * Todas las llamadas a Supabase Auth se centralizan acá — las screens nunca
 * llaman a `supabase.auth.*` directo (ver design.md de B1). Esto permite
 * testear la lógica de auth sin renderizar componentes.
 *
 * `supabase` es `null` solo si falta configuración de entorno (A2); en ese
 * caso `_layout.tsx` ya muestra `MissingConfigScreen` antes de que estas
 * funciones puedan invocarse, pero igual se manejan defensivamente acá.
 */

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // AC #2: mensaje genérico — no distinguir "no existe el usuario" de
    // "contraseña incorrecta". GoTrue ya devuelve un mensaje genérico
    // ("Invalid login credentials"); la UI lo traduce con su propia copy.
    return { ok: false, message: 'invalid-credentials' };
  }

  return { ok: true };
}

export type SignUpResult =
  | { ok: true; sessionActive: boolean }
  | { ok: false; message: string };

/**
 * Registro (B2). El proyecto real tiene `mailer_autoconfirm: false`
 * (verificado vía `GET /auth/v1/settings`) — `signUp` casi nunca devuelve
 * sesión activa de una, el usuario tiene que confirmar el email primero.
 * `sessionActive` le dice al caller si puede bootstrapear la empresa ya
 * mismo o si hay que mandarlo a "confirmá tu email" (ver `CheckEmailScreen`).
 *
 * `companyName` se guarda en `user_metadata` (`options.data`) para
 * sobrevivir el hueco sin sesión hasta la confirmación — `CompanyOnboardingScreen`
 * lo lee de ahí, sin necesitar tabla temporal propia.
 */
export async function signUp(email: string, password: string, companyName: string): Promise<SignUpResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { pending_company_name: companyName } },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, sessionActive: data.session !== null };
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function hasActiveSession(): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

export type RecoveryTokens = { accessToken: string; refreshToken: string };

/**
 * El link de recuperación de Supabase entrega los tokens como fragmento
 * (`#access_token=...&refresh_token=...&type=recovery`) igual que un flujo
 * OAuth implícito. `detectSessionInUrl: false` en el cliente (A2) significa
 * que nadie los parsea automáticamente — se extraen acá con una regex simple
 * en vez de depender del polyfill de `URL` para fragmentos, que no todos los
 * entornos de RN resuelven igual.
 */
export function parseRecoveryTokensFromUrl(url: string): RecoveryTokens | null {
  const accessTokenMatch = url.match(/[#?&]access_token=([^&]+)/);
  const refreshTokenMatch = url.match(/[#?&]refresh_token=([^&]+)/);

  if (!accessTokenMatch || !refreshTokenMatch) {
    return null;
  }

  return {
    accessToken: decodeURIComponent(accessTokenMatch[1]),
    refreshToken: decodeURIComponent(refreshTokenMatch[1]),
  };
}

/**
 * OAuth con Google (B7). Supabase no soporta un deep link nativo directo en
 * RN — el patrón es: pedirle a Supabase la URL de autorización sin que abra
 * nada (`skipBrowserRedirect: true`), abrirla nosotros en el navegador del
 * sistema con `expo-web-browser` (que sabe esperar el redirect de vuelta a
 * nuestro esquema), y una vez que vuelve, parsear los tokens de la URL final
 * igual que en el flujo de recovery de B1 (mismo formato de fragmento).
 */
export async function signInWithGoogle(redirectTo: string): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    return { ok: false, message: error?.message ?? 'no-auth-url' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { ok: false, message: 'cancelled' };
  }

  if (result.type !== 'success') {
    return { ok: false, message: 'oauth-failed' };
  }

  const tokens = parseRecoveryTokensFromUrl(result.url);
  if (!tokens) {
    return { ok: false, message: 'no-tokens-in-callback' };
  }

  return setRecoverySession(tokens);
}

export async function setRecoverySession(tokens: RecoveryTokens): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'missing-config' };
  }

  const { error } = await supabase.auth.setSession({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
