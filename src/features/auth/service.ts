import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { looksLikeEmail } from './schemas';

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
  if (m.includes('invalid login credentials')) {
    return 'That email/username or password is incorrect.';
  }
  if (m.includes('already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  // The profiles trigger raises a unique-violation when a username is taken,
  // which Supabase surfaces as a generic "database error saving new user".
  if (m.includes('database error saving new user') || m.includes('duplicate key')) {
    return 'That username is already taken. Please choose another.';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email address, then sign in.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return message;
}

/**
 * Resolve a username to its account email via the `email_for_username` RPC.
 * Returns null if the RPC is not installed yet or no match exists, so callers
 * can fall back to a friendly "not found" message.
 */
async function resolveEmailForUsername(username: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('email_for_username', { uname: username });
  if (error || typeof data !== 'string' || data.length === 0) return null;
  return data;
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

/**
 * Sign in with either an email address or a username. Usernames are resolved to
 * their email via an RPC before Supabase's email/password sign-in.
 */
export async function signIn(identifier: string, password: string): Promise<AuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, message: 'Accounts are not configured for this app.' };

  let email = identifier.trim();
  if (!looksLikeEmail(email)) {
    const resolved = await resolveEmailForUsername(email);
    if (!resolved) {
      return {
        ok: false,
        message: "We couldn't find an account with that username. Try your email instead.",
      };
    }
    email = resolved;
  }

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
