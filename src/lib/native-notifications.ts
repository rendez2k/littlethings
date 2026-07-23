/**
 * Bridge to the Capacitor **Local Notifications** plugin for on-device reminders
 * in the native app (Android + iOS). Unlike Web Push, these are scheduled and
 * fired entirely on the device — no server, and they work where the WebView has
 * no Web Push (e.g. Android).
 *
 * Called through Capacitor's runtime bridge so the web bundle needs no Capacitor
 * dependency. Install the plugin in the Capacitor host to light this up:
 *   npm i @capacitor/local-notifications && npx cap sync
 */

export interface NativeNotification {
  id: number;
  title: string;
  body: string;
  schedule: {
    on: { hour: number; minute: number; weekday?: number };
    repeats: boolean;
    allowWhileIdle?: boolean;
  };
}

type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';

interface LocalNotificationsPlugin {
  checkPermissions(): Promise<{ display: PermissionState }>;
  requestPermissions(): Promise<{ display: PermissionState }>;
  schedule(options: { notifications: NativeNotification[] }): Promise<unknown>;
  cancel(options: { notifications: Array<{ id: number }> }): Promise<unknown>;
  getPending(): Promise<{ notifications: Array<{ id: number }> }>;
}

function plugin(): LocalNotificationsPlugin | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    window as unknown as { Capacitor?: { Plugins?: { LocalNotifications?: LocalNotificationsPlugin } } }
  ).Capacitor?.Plugins?.LocalNotifications;
}

/** True when running in the native app with the Local Notifications plugin. */
export function isLocalNotificationsAvailable(): boolean {
  return Boolean(plugin());
}

export async function localNotificationPermission(): Promise<PermissionState | 'unsupported'> {
  const p = plugin();
  if (!p) return 'unsupported';
  try {
    return (await p.checkPermissions()).display;
  } catch {
    return 'unsupported';
  }
}

export async function requestLocalNotificationPermission(): Promise<boolean> {
  const p = plugin();
  if (!p) return false;
  try {
    return (await p.requestPermissions()).display === 'granted';
  } catch {
    return false;
  }
}

/** Cancel every reminder this app has scheduled. */
export async function cancelAllLocalNotifications(): Promise<void> {
  const p = plugin();
  if (!p) return;
  try {
    const pending = await p.getPending();
    const ids = pending?.notifications ?? [];
    if (ids.length) await p.cancel({ notifications: ids.map((n) => ({ id: n.id })) });
  } catch {
    // ignore
  }
}

export async function scheduleLocalNotifications(notifications: NativeNotification[]): Promise<void> {
  const p = plugin();
  if (!p || notifications.length === 0) return;
  try {
    await p.schedule({ notifications });
  } catch {
    // ignore
  }
}
