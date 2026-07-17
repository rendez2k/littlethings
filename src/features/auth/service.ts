import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

export interface AuthResult {
  ok: boolean;
  /** Friendly, user-facing message (present on failure, sometimes on success). */
  message?: string;
}

/** The username a user chose at sign-up, stored in user metadata. */
export function usernameOf(user: User | null | undefined): string | null {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const name = meta?.username;
  return typeof name === 'string' && name.length > 0 ? name : null;
}

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email or password is incorrect.';
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email address, then sign in.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return message;
}

export async function signUp(
  email: string,
  username: string,
  password: string,
): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: 'Accounts are not configured for this app.' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) return { ok: false, message: friendlyError(error.message) };

  // When email confirmation is enabled, no session is returned immediately.
  if (!data.session) {
    return { ok: true, message: 'Check your inbox to confirm your email, then sign in.' };
  }
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: 'Accounts are not configured for this app.' };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: friendlyError(error.message) };
  return { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: true };
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, message: friendlyError(error.message) };
  return { ok: true };
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}
