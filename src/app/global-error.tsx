'use client';

import { useEffect, useState } from 'react';

/**
 * Root error boundary. Its main job is to make the app self-heal from a stale
 * PWA state: after a deploy, an installed client can hold an old HTML shell that
 * references JavaScript chunks the server no longer has, so a dynamic import
 * 404s and React throws a "client-side exception" on launch.
 *
 * When we detect that failure mode we clear the caches, drop the service worker
 * and reload **once** (guarded so we can never loop). Anything else just shows a
 * calm retry screen.
 */

const RECOVERY_FLAG = 'little-things.chunk-recovery.v1';

function looksLikeStaleBundle(error: Error): boolean {
  const text = `${error?.name ?? ''} ${error?.message ?? ''}`;
  return (
    /ChunkLoadError/i.test(text) ||
    /Loading chunk [\w-]+ failed/i.test(text) ||
    /Loading CSS chunk/i.test(text) ||
    /error loading dynamically imported module/i.test(text) ||
    /Importing a module script failed/i.test(text) ||
    /'text\/html' is not a valid JavaScript MIME type/i.test(text)
  );
}

async function purgeAndReload(): Promise<void> {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    // Best-effort — reload regardless.
  }
  window.location.reload();
}

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let attempted = false;
    try {
      attempted = sessionStorage.getItem(RECOVERY_FLAG) === '1';
    } catch {
      // sessionStorage may be unavailable; fall through to the manual screen.
    }

    if (looksLikeStaleBundle(error) && !attempted) {
      try {
        sessionStorage.setItem(RECOVERY_FLAG, '1');
      } catch {
        // ignore
      }
      setRecovering(true);
      void purgeAndReload();
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: '#f5f4f1',
          color: '#17151f',
        }}
      >
        <div style={{ maxWidth: '22rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.5rem' }}>
            {recovering ? 'Updating Little Things…' : 'Something went wrong'}
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#5b5766', margin: '0 0 1.25rem' }}>
            {recovering
              ? 'Getting the latest version — this only takes a moment.'
              : 'Please reload to get the latest version. Your data is safe on this device.'}
          </p>
          {!recovering ? (
            <button
              type="button"
              onClick={() => {
                setRecovering(true);
                void purgeAndReload();
              }}
              style={{
                appearance: 'none',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.7rem 1.4rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#fff',
                background: '#6c5ce7',
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          ) : null}
        </div>
      </body>
    </html>
  );
}
