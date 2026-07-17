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
- **Username + email login.** Sign-up captures username + email + password; the
  username is stored both in user metadata and in a `profiles` table. Sign-in
  accepts either an email or a username — usernames are resolved to their email
  via a `SECURITY DEFINER` RPC (`email_for_username`) before Supabase's native
  email/password sign-in.
  - The `profiles` table, its RLS policies, the new-user trigger and the RPC
    live in `supabase/migrations/0001_username_login.sql`, run once in the
    Supabase SQL editor. It can't be applied from the app with only the anon key.
  - **Graceful degradation:** with the env vars set but the migration not yet
    run, email sign-up/sign-in still work; username sign-in returns a clear
    "couldn't find that username" message and username uniqueness isn't enforced.
  - The RPC only returns an email for an _exact_ username match (no user
    enumeration/listing).
- **Graceful when unconfigured.** If the env vars are absent, the Supabase client
  is `null` and the Account screen shows the local-only state instead of forms.
