// Supabase Edge Function: send-reminders
// -------------------------------------------------------------------
// Runs on a schedule (e.g. every 5 minutes). Finds reminders whose local time
// is due now and sends a Web Push notification to each device. Deploy with the
// Supabase CLI and schedule it (see docs/PUSH.md).
//
// Required secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const WINDOW_MINUTES = Number(Deno.env.get('WINDOW_MINUTES') ?? '5');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:reminders@little-things.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

/** Local {date:'YYYY-MM-DD', minutes, weekday} for an IANA timezone. */
function localNow(timeZone: string): { date: string; minutes: number; weekday: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { date, minutes, weekday: weekdayMap[get('weekday')] ?? 0 };
}

function isDue(reminder: any): { due: boolean; localDate: string } {
  let now;
  try {
    now = localNow(reminder.timezone || 'UTC');
  } catch {
    now = localNow('UTC');
  }
  const [h, m] = String(reminder.time).split(':').map(Number);
  const target = (h || 0) * 60 + (m || 0);
  const diff = now.minutes - target;
  const inWindow = diff >= 0 && diff < WINDOW_MINUTES;
  const dayOk =
    !reminder.weekdays || reminder.weekdays.length === 0 || reminder.weekdays.includes(now.weekday);
  const notSentToday = reminder.last_sent_on !== now.date;
  return { due: inWindow && dayOk && notSentToday, localDate: now.date };
}

Deno.serve(async () => {
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('*, push_subscriptions!inner(endpoint, p256dh, auth)')
    .eq('enabled', true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let sent = 0;
  for (const reminder of reminders ?? []) {
    const { due, localDate } = isDue(reminder);
    if (!due) continue;

    const sub = reminder.push_subscriptions;
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };
    const payload = JSON.stringify({
      title: reminder.title,
      body: reminder.body,
      url: '/',
      habitId: reminder.habit_id,
    });

    try {
      await webpush.sendNotification(subscription as any, payload);
      sent += 1;
      await supabase.from('reminders').update({ last_sent_on: localDate }).eq('id', reminder.id);
    } catch (err: any) {
      // Subscription gone → clean it up (cascades to its reminders).
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'content-type': 'application/json' },
  });
});
