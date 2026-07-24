'use client';

/**
 * Mounted once at the app root. On launch and on every foreground it reconciles
 * any toggles the user made from the home-screen widget, then re-pushes today's
 * snapshot so the widget reflects the corrected state. Entirely inert on the web
 * / plugin-less builds — the whole thing is gated on the LKWidget plugin.
 */

import { useEffect } from 'react';
import { widgetsAvailable } from './bridge';
import { applyPendingWidgetToggles, pushTodayWidgetSnapshot } from './pending-toggles';

/** Capacitor App plugin, reached through the runtime bridge (no hard dep). */
interface AppPlugin {
  addListener(
    event: 'appStateChange',
    cb: (state: { isActive: boolean }) => void,
  ): Promise<{ remove: () => void | Promise<void> }>;
}

function appPlugin(): AppPlugin | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Capacitor?: { Plugins?: { App?: AppPlugin } } }).Capacitor?.Plugins
    ?.App;
}

export function WidgetSyncBridge() {
  useEffect(() => {
    if (!widgetsAvailable()) return;

    let running = false;
    const reconcile = async () => {
      if (running) return; // Coalesce overlapping launch/foreground signals.
      running = true;
      try {
        await applyPendingWidgetToggles();
        await pushTodayWidgetSnapshot();
      } catch {
        // Widget reconciliation is best-effort — never surface a rejection to
        // the app (an unhandled rejection here must not take down the UI).
      } finally {
        running = false;
      }
    };

    // App launch.
    void reconcile();

    // Foreground via Capacitor's app-state event (native) …
    let removeAppListener: (() => void | Promise<void>) | undefined;
    void appPlugin()
      ?.addListener('appStateChange', (state) => {
        if (state.isActive) void reconcile();
      })
      .then((handle) => {
        removeAppListener = handle.remove;
      })
      .catch(() => {});

    // … and via visibility, which also covers installed PWAs.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reconcile();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void removeAppListener?.();
    };
  }, []);

  return null;
}
