'use client';

/**
 * Mounted once at the app root. Reconciles any completion toggles the user made
 * from the home-screen widget (drain → apply → re-push today's snapshot) on
 * launch and on every foreground.
 *
 * Safety: an earlier version ran this synchronously from the root during
 * startup and could take the native shell down on launch. So this deliberately
 * does NOTHING at startup:
 *   - it statically imports no widget / Capacitor code (that stays out of the
 *     root bundle — it's lazy-loaded below), and
 *   - the first reconcile is deferred until after `load` and the browser is
 *     idle, well clear of first paint and hydration.
 * Everything is gated on the LKWidget plugin, so it's inert on the web / PWA.
 */

import { useEffect } from 'react';

/** Capacitor App plugin, reached through the runtime bridge (no hard dep). */
interface AppPlugin {
  addListener(
    event: 'appStateChange',
    cb: (state: { isActive: boolean }) => void,
  ): Promise<{ remove: () => void | Promise<void> }>;
}

function appPlugin(): AppPlugin | undefined {
  return (window as unknown as { Capacitor?: { Plugins?: { App?: AppPlugin } } }).Capacitor?.Plugins
    ?.App;
}

export function WidgetSyncBridge() {
  useEffect(() => {
    let cancelled = false;
    let detach = () => {};

    const start = async () => {
      // Lazy-load so no widget/Capacitor module is evaluated during startup.
      const [{ widgetsAvailable }, { applyPendingWidgetToggles, pushTodayWidgetSnapshot }] =
        await Promise.all([import('./bridge'), import('./pending-toggles')]);
      if (cancelled || !widgetsAvailable()) return;

      let running = false;
      const reconcile = async () => {
        if (running) return; // Coalesce overlapping launch/foreground signals.
        running = true;
        try {
          await applyPendingWidgetToggles();
          await pushTodayWidgetSnapshot();
        } catch {
          // Best-effort — a rejected DB read or bridge call must never surface.
        } finally {
          running = false;
        }
      };

      // First pass — now safely after load + idle.
      void reconcile();

      // Foreground via visibility (covers installed PWAs) …
      const onVisible = () => {
        if (document.visibilityState === 'visible') void reconcile();
      };
      document.addEventListener('visibilitychange', onVisible);

      // … and via Capacitor's app-state event (native), if the plugin is there.
      let removeAppListener = () => {};
      const app = appPlugin();
      if (app) {
        try {
          const handle = await app.addListener('appStateChange', (state) => {
            if (state.isActive) void reconcile();
          });
          removeAppListener = () => {
            try {
              void handle.remove();
            } catch {
              // ignore
            }
          };
        } catch {
          // ignore — visibility still covers foregrounding.
        }
      }

      detach = () => {
        document.removeEventListener('visibilitychange', onVisible);
        removeAppListener();
      };
    };

    // Defer the whole thing until the page has loaded and the browser is idle.
    const schedule = () => {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(() => void start(), { timeout: 3000 });
      } else {
        setTimeout(() => void start(), 800);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      cancelled = true;
      detach();
      window.removeEventListener('load', schedule);
    };
  }, []);

  return null;
}
