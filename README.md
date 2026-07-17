# Little Things

A calm, mobile-first **habit tracker** built as an installable Progressive Web App.
Track your habits privately — no account required, works offline, looks great in
light and dark mode.

> **Status:** Phases 1–3 complete — foundation & application shell, an optional
> email/username account layer (Supabase), the full local-first domain layer
> (Dexie, repositories, schedule/completion/streak logic), and habit creation
> (first-launch welcome, templates, create/edit sheet with advanced options).
> Daily tracking (completing habits) arrives next per `BUILD_BRIEF.md`.

## Tech stack

- **Next.js** (App Router) + **React** + **TypeScript** (strict)
- **Tailwind CSS** with semantic design tokens (CSS custom properties)
- **Lucide** icons
- **Dexie** (IndexedDB) for local-first storage, behind repository interfaces
- **date-fns**-style local date utilities (custom, timezone-safe)
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

#### Enable username login (one-time SQL)

Email sign-up and sign-in work as soon as the env vars are set. To also allow
**unique usernames** and **signing in with a username**, run the migration once:

Supabase Dashboard → **SQL Editor** → New query → paste the contents of
[`supabase/migrations/0001_username_login.sql`](supabase/migrations/0001_username_login.sql)
→ **Run**.

It creates a `profiles` table (with RLS), a trigger that saves each new user's
username, and an `email_for_username` function the app calls to resolve a
username to its email at sign-in. Until it's run, usernames are still collected
at sign-up (and shown on your profile) but sign-in uses email only.

## Scripts

| Script                            | Purpose                          |
| --------------------------------- | -------------------------------- |
| `npm run dev`                     | Start the dev server             |
| `npm run build`                   | Production build                 |
| `npm run start`                   | Serve the production build       |
| `npm run lint`                    | ESLint                           |
| `npm run typecheck`               | `tsc --noEmit`                   |
| `npm run format`                  | Prettier write                   |
| `npm run test`                    | Vitest (unit + component)        |
| `npm run test:e2e`                | Playwright journeys              |
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
    habits/           # Habit schema, schedule matching, repository, service, factory
    completions/      # Completion schema, day-status logic, repository, service
    streaks/          # Tested streak calculation (see docs/STREAKS.md)
    settings/         # Appearance + app-settings model, repository
    auth/             # Optional Supabase account layer
  db/                 # Dexie database definition
  lib/
    dates/            # Local date keys, week/month boundaries (timezone-safe)
    …                 # cn, id, constants, supabase client
  styles/             # Global tokens + Tailwind layers
supabase/migrations/  # Optional SQL for username login
tests/                # Vitest setup, unit tests, Playwright e2e
public/               # manifest, service worker, icons
scripts/              # Icon generator
```

## Domain & data model

The app is local-first (brief §15). UI never touches Dexie directly — it goes
through **repositories** (`HabitRepository`, `CompletionRepository`,
`SettingsRepository`) and **services** that stamp IDs/timestamps and keep
invariants. This keeps a future Supabase sync adapter a drop-in.

- **Habits** carry a schedule (daily / weekdays / N-per-week / N-per-month /
  every-N-days / one-off) and a target (boolean / count / duration).
- **Completions** are stored separately, keyed by local calendar date, with a
  soft-deletion tombstone for future sync. Absence of a record on a past
  scheduled day means "missed" — never counted for future days.
- **Streaks** are computed in one tested module — see
  [`docs/STREAKS.md`](docs/STREAKS.md) for the exact rules.

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
