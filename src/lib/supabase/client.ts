import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Optional Supabase browser client.
 *
 * Accounts are an optional enhancement — the app is fully usable without them.
 * When the env vars are absent (the default), this returns `null` and the UI
 * falls back to the local-only experience.
 *
 * Only the publishable/anon key is used here; it is safe to ship to the client.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** Whether account features are configured for this deployment. */
export const isSupabaseConfigured = Boolean(url && anonKey);
