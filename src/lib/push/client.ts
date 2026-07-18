import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Web Push subscription helpers. Requires a configured Supabase project (to
 * store the subscription) and NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export const isPushConfigured = Boolean(VAPID_PUBLIC_KEY) && Boolean(getSupabaseClient());

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return view;
}

class TimeoutError extends Error {}

/** Reject if `promise` hasn't settled within `ms` — some iOS push steps hang. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError()), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

async function ensureRegistration(): Promise<ServiceWorkerRegistration> {
  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) reg = await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready.then(() => reg!);
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Request permission, subscribe, and store the subscription in Supabase. */
export async function enablePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };
  if (!VAPID_PUBLIC_KEY) return { ok: false, reason: 'not-configured' };
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, reason: 'not-configured' };

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch {
    return { ok: false, reason: 'denied' };
  }
  if (permission !== 'granted') return { ok: false, reason: 'denied' };

  // Registration + subscribe can throw (e.g. iOS in Safari, not the installed
  // app) or hang — guard both so the UI never gets stuck.
  let sub: PushSubscription;
  try {
    const reg = await withTimeout(ensureRegistration(), 20_000);
    const existing = await reg.pushManager.getSubscription();
    sub =
      existing ??
      (await withTimeout(
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }),
        20_000,
      ));
  } catch (err) {
    return { ok: false, reason: err instanceof TimeoutError ? 'timeout' : 'subscribe-failed' };
  }

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, reason: 'bad-subscription' };
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
      { onConflict: 'endpoint' },
    );
  if (error) return { ok: false, reason: 'store-failed' };
  return { ok: true };
}

/** Unsubscribe this device and remove its stored subscription + reminders. */
export async function disablePush(): Promise<void> {
  const sub = await getExistingSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  const supabase = getSupabaseClient();
  if (supabase) {
    // Deleting the subscription cascades to its reminders.
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  }
}
