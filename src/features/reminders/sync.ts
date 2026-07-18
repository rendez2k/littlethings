import { getSupabaseClient } from '@/lib/supabase/client';
import { getExistingSubscription } from '@/lib/push/client';
import { createHabitRepository } from '@/features/habits/repository';
import { scheduleLabel } from '@/features/habits/labels';
import type { Habit } from '@/features/habits/schemas';

/**
 * Push the current set of habit reminders to Supabase for this device, so the
 * scheduled Edge Function can deliver them. Best-effort: silently no-ops when
 * push isn't set up or the device isn't subscribed.
 */
function weekdaysFor(habit: Habit): number[] {
  return habit.schedule.type === 'weekdays' ? [...habit.schedule.weekdays] : [];
}

function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export async function syncReminders(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const sub = await getExistingSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;

  const habits = await createHabitRepository().getActive();
  const tz = timezone();
  const rows = habits
    .filter((h) => h.status === 'active' && h.reminder.enabled)
    .map((h) => ({
      endpoint,
      habit_id: h.id,
      title: `Time for ${h.name}`,
      body: scheduleLabel(h.schedule),
      time: h.reminder.time,
      weekdays: weekdaysFor(h),
      timezone: tz,
      enabled: true,
    }));

  // Replace this device's reminders with the current set.
  await supabase.from('reminders').delete().eq('endpoint', endpoint);
  if (rows.length > 0) {
    await supabase.from('reminders').insert(rows);
  }
}
