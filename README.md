# Little Things

A calm, mobile-first **habit tracker** built as an installable Progressive Web App.
Track your habits privately — no account required, works offline, looks great in
light and dark mode.

> **Status:** Phase 1 (foundation & application shell) complete, plus an optional
> email/username account layer (Supabase). Habit tracking, local database and
> insights arrive in later phases per `BUILD_BRIEF.md`.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS** with semantic design tokens (CSS custom properties)
- **Lucide** icons
- **Supabase** (optional, for accounts) — the app is fully usable without it
- **React Hook Form** + **Zod** for forms and validation
- **Vitest** + **React Testing Library** (unit/component), **Playwright** (E2E)
- Hand-rolled **service worker** for the offline application shell

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app runs entirely locally.

### Optional: enable accounts (Supabase)

Accounts are optional — everything works without them. To enable email/username
sign-up and sign-in, create `.env.local` from the example and add your Supabase
project URL and **publishable (anon)** key:

```bash
cp .env.example .env.local
# then edit .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

Only the **publishable/anon** key belongs in the client. Never put a
service-role key here — it would be exposed in the browser bundle.

If these are unset, the Account screen simply shows the local-only experience.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |
| `npm run test` | Vitest (unit + component) |
| `npm run test:e2e` | Playwright journeys |
| `node scripts/generate-icons.mjs` | Regenerate placeholder PWA icons |

## Design system

Colours are semantic tokens defined in `src/styles/globals.css` as space-separated
RGB channels, so Tailwind opacity modifiers keep working (`bg-surface/70`).

- **Themes:** System / Light / Dark, applied via `data-theme` on `<html>`. The
  choice is persisted and applied before first paint (no theme flash).
- **Palettes:** Lavender, Sky, Mint, Peach, Rose, Lemon — applied via
  `data-palette`. Each has accessible light and dark variants.

Components consume tokens only, never hard-coded colours.

## Progressive Web App

- `public/manifest.webmanifest` — name, theme colours, standalone display,
  portrait orientation, 192/512 icons + maskable variants + Apple touch icon.
- `public/sw.js` — offline shell: network-first navigations with a cached-shell
  fallback and an `/offline` page; stale-while-revalidate for static assets.
  Only same-origin GET requests are cached.
- The service worker registers in production only (see
  `src/components/pwa/service-worker-registrar.tsx`).

Icons in `public/icons` are generated placeholders — replace them before launch.

## Project structure

```text
src/
  app/                # App Router routes: Today (/), habits, insights, settings, offline
  components/
    layout/           # App shell, page header, offline indicator
    navigation/       # Bottom navigation
    settings/         # Appearance + settings sections
    theme/            # Appearance provider + pre-paint theme script
    pwa/              # Service worker registrar
    ui/               # Restyled primitives (button, card, switch, …)
  features/
    settings/         # Appearance model + persistence
    auth/             # Optional Supabase account layer
  lib/                # Small utilities (cn, constants, supabase client)
  styles/             # Global tokens + Tailwind layers
tests/                # Vitest setup, unit tests, Playwright e2e
public/               # manifest, service worker, icons
scripts/              # Icon generator
```

## Testing

```bash
npm run test        # Vitest unit + component tests
npm run test:e2e    # Playwright shell journeys (uses a production build)
```

Playwright uses Chromium. In managed environments a pre-installed browser at
`/opt/pw-browsers/chromium` is detected automatically; otherwise run
`npx playwright install chromium`.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import it into Vercel — it auto-detects Next.js; no custom server required.
3. (Optional) add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   in Vercel project settings to enable accounts.
4. Deploy.

## Accessibility

- Semantic HTML, visible focus styles, skip-to-content link.
- Theme/palette pickers are keyboard-operable radio groups.
- Respects `prefers-reduced-motion` and an in-app reduced-motion toggle.
- Colour is never the only signal; pastel accents are chosen for contrast.

See `docs/DECISIONS.md` for architectural notes.
