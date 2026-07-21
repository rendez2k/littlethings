/**
 * A short "success" buzz for key completions — ticking a habit off, hitting a
 * count goal, or finishing a bucket-list goal.
 *
 * When running inside the Capacitor host app it uses the native **Haptics**
 * plugin via Capacitor's runtime bridge. In a normal browser / installed PWA it
 * falls back to the Web Vibration API (e.g. Android Chrome), and silently
 * no-ops where neither exists (e.g. iOS Safari, desktop).
 *
 * For the native buzz, install the plugin in the Capacitor host project:
 *   npm i @capacitor/haptics && npx cap sync
 * Capacitor auto-registers it on `window.Capacitor.Plugins.Haptics`, so the web
 * bundle needs no Capacitor dependency of its own.
 */

interface HapticsPlugin {
  impact?: (options: { style: string }) => Promise<void> | void;
}

function nativeHaptics(): HapticsPlugin | undefined {
  if (typeof window === 'undefined') return undefined;
  const cap = (window as unknown as { Capacitor?: { Plugins?: { Haptics?: HapticsPlugin } } })
    .Capacitor;
  return cap?.Plugins?.Haptics;
}

/** Fire a light completion buzz. Safe to call anywhere; never throws. */
export function completionHaptic(): void {
  const haptics = nativeHaptics();
  if (haptics?.impact) {
    // Capacitor's ImpactStyle.Light is the string 'LIGHT'.
    try {
      void Promise.resolve(haptics.impact({ style: 'LIGHT' })).catch(() => {});
      return;
    } catch {
      // Fall through to the web fallback below.
    }
  }
  try {
    navigator.vibrate?.(12);
  } catch {
    // No vibration support — nothing to do.
  }
}
