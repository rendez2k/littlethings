# Reminders / Web Push — setup

Reminders send a real notification at each habit's set time, even when the app
is closed. This needs a few one-time steps because a local-first app can't send
notifications by itself — your Supabase project does the sending.

**What leaves the device:** only the reminder time, the habit name (used as the
notification text), your timezone, and a push endpoint. Your habit history stays
local. See the security note in `supabase/migrations/0002_push_reminders.sql`.

**iPhone:** Web Push only works when Little Things is **installed to the Home
Screen** (iOS 16.4+). Add it via Settings → Install first, then enable reminders
from inside the installed app.

## One-time setup

1. **Generate VAPID keys** (from the repo):

   ```bash
   node scripts/generate-vapid.mjs
   ```

   You'll get a **public** and a **private** key.

2. **Set the client env vars** (local `.env.local` and Vercel → Project →
   Environment Variables). Reminders need Supabase configured too:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key from step 1>
   ```

   Redeploy Vercel after adding them.

3. **Create the tables** — Supabase → SQL Editor → run
   [`supabase/migrations/0002_push_reminders.sql`](../supabase/migrations/0002_push_reminders.sql).

4. **Deploy the Edge Function** (needs the [Supabase CLI](https://supabase.com/docs/guides/cli)):

   ```bash
   supabase functions deploy send-reminders --project-ref <your-project-ref>

   supabase secrets set --project-ref <your-project-ref> \
     VAPID_PUBLIC_KEY=<public key> \
     VAPID_PRIVATE_KEY=<private key> \
     VAPID_SUBJECT="mailto:you@example.com"
   ```

5. **Schedule it** — Supabase → Edge Functions → `send-reminders` → **Cron**, and
   run it every 5 minutes (`*/5 * * * *`). (Or use `pg_cron` to POST the function
   URL on that schedule.)

6. **Turn it on** — open the installed app → Settings → **Reminders → Enable**,
   and allow notifications when prompted. Set a reminder time on any habit (the
   app syncs it automatically). Notifications arrive within ~5 minutes of the set
   time.

## How it works

- The browser subscribes to push and stores the subscription in
  `push_subscriptions` (keyed by endpoint — no account needed).
- Each habit reminder is written to `reminders` with its time, weekdays and
  timezone.
- The scheduled `send-reminders` function checks which reminders are due in each
  device's local timezone, sends the push, and de-dupes per day.

## Troubleshooting

- **Nothing arrives:** confirm the function is scheduled and its secrets are set;
  check the function logs in the Supabase dashboard.
- **iPhone:** it must be the installed (Home Screen) app, not Safari.
- **Blocked:** if you denied notifications, re-enable them for the site in your
  browser/OS settings, then toggle reminders on again.
