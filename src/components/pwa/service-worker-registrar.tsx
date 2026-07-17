'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker that provides the offline application shell.
 * Registration is deferred until after load so it never competes with the
 * first paint. Disabled in development to avoid stale caches while iterating.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failures must never break the app; it works without SW.
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
