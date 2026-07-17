# Architectural decisions

A running log of notable decisions. Keep entries short.

## Phase 1 — Foundation

- **Next.js App Router, TypeScript strict.** Matches the brief; deploys cleanly to
  Vercel with no custom server. `noUncheckedIndexedAccess` is on for extra safety.
- **Semantic design tokens as RGB channels.** Colours live in `globals.css` as
  `--color-*: R G B;` and are exposed to Tailwind via `rgb(var(--x) / <alpha>)`.
  This keeps Tailwind's opacity modifiers working while allowing theme + palette
  to be swapped purely in CSS. Components never hard-code colours.
- **Two orthogonal axes: theme and palette.** `data-theme` (light/dark) and
  `data-palette` (six pastels) are independent attributes on `<html>`. `system`
  resolves against `prefers-color-scheme` and reacts to OS changes live.
- **No theme flash.** A tiny, dependency-free blocking script
  (`theme-script.tsx`) reads the persisted appearance from `localStorage` and
  sets the `<html>` attributes before first paint.
- **Appearance persisted in `localStorage` (Phase 1).** Small and serialisable;
  it will migrate into the `SettingsRepository` when the Dexie layer lands, but
  local storage is required anyway to apply appearance pre-paint.
- **Hand-rolled service worker** instead of `next-pwa`. Keeps control over the
  caching strategy and avoids App Router compatibility friction. Network-first
  for navigations (fresh when online, cached shell/offline page when not),
  stale-while-revalidate for static assets, same-origin GET only.
- **Placeholder icons generated in-repo** via `scripts/generate-icons.mjs` (pure
  Node PNG encoder — no native image deps). Replace before launch.
- **Playwright on Chromium**, auto-detecting a pre-installed browser at
  `/opt/pw-browsers/chromium` when present.

## Optional accounts (Supabase)

- **Local-first is preserved.** Accounts are strictly optional; the app never
  gates habit tracking behind sign-in (per brief §16). Auth lives in
  Settings → Account.
- **Client-side auth with `@supabase/supabase-js`.** For a local-first PWA this
  is the simplest fit — the session is stored client-side and refreshed
  automatically. No server session/cookie plumbing is required for v1.
- **Only the publishable (anon) key ships to the client.** Read from
  `NEXT_PUBLIC_SUPABASE_*`. The service-role key must never be added here.
- **Username at sign-up is stored in user metadata**, not a separate table, so no
  database schema/RLS setup is required to get accounts working with just the
  anon key. Sign-in uses email + password (Supabase's native flow); the username
  is shown on the account screen.
  - _Follow-up:_ true "log in with username" needs a `profiles` table plus an
    RPC that maps username → email (or a server route). That requires DB/RLS
    setup in the Supabase project and is intentionally deferred.
- **Graceful when unconfigured.** If the env vars are absent, the Supabase client
  is `null` and the Account screen shows the local-only state instead of forms.
