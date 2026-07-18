/*
 * Little Things — service worker
 * ------------------------------
 * Provides the offline application shell. Strategy:
 *   - Navigations: network-first, fall back to cached shell, then /offline.
 *   - Static build assets (/_next/static, icons, fonts): stale-while-revalidate.
 *   - Only same-origin GET requests are cached. Personal/authenticated API
 *     responses are never cached indiscriminately (there are none yet, and
 *     cross-origin + non-GET requests are explicitly skipped).
 *
 * Bump CACHE_VERSION to invalidate old caches on deploy.
 */
const CACHE_VERSION = 'v2';
const SHELL_CACHE = `little-things-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `little-things-assets-${CACHE_VERSION}`;

const SHELL_ROUTES = ['/', '/habits', '/goals', '/insights', '/settings', '/offline'];
const PRECACHE_URLS = [
  ...SHELL_ROUTES,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Cache best-effort: a single missing URL must not fail the install.
      await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App navigations: network-first so users get fresh content when online,
  // but a cached shell (or the offline page) keeps the app usable offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          const shell = await cache.match('/');
          if (shell) return shell;
          return (await cache.match('/offline')) ?? Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => undefined);
        return cached ?? (await network) ?? Response.error();
      })(),
    );
  }
});
