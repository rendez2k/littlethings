'use client';

import { createHabitRepository } from '@/features/habits/repository';
import { scheduleLabel } from '@/features/habits/labels';
import type { Habit } from '@/features/habits/schemas';
import {
  cancelAllLocalNotifications,
  isLocalNotificationsAvailable,
  localNotificationPermission,
  scheduleLocalNotifications,
  type NativeNotification,
} from '@/lib/native-notifications';

/** Set once the user turns native reminders on. */
export const LOCAL_REMINDERS_KEY = 'little-things.local-reminders.v1';

export function localRemindersEnabled(): boolean {
  try {
    return localStorage.getItem(LOCAL_REMINDERS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setLocalRemindersEnabled(on: boolean): void {
  try {
    if (on) localStorage.setItem(LOCAL_REMINDERS_KEY, '1');
    else localStorage.removeItem(LOCAL_REMINDERS_KEY);
  } catch {
    // ignore
  }
}

/** Stable positive 32-bit id from a habit id (+ weekday slot). */
function notificationId(habitId: string, weekdaySlot: number): number {
  let hash = 0;
  for (let i = 0; i < habitId.length; i++) hash = (hash * 31 + habitId.charCodeAt(i)) | 0;
  const base = Math.abs(hash) % 100_000_000;
  return base * 10 + weekdaySlot; // < 2^31
}

function notificationsFor(habits: Habit[]): NativeNotification[] {
  const out: NativeNotification[] = [];
  for (const habit of habits) {
    if (habit.status !== 'active' || !habit.reminder.enabled) continue;
    const [h, m] = habit.reminder.time.split(':').map(Number);
    const hour = h || 0;
    const minute = m || 0;
    const title = `Time for ${habit.name}`;
    const body = scheduleLabel(habit.schedule);

    if (habit.schedule.type === 'weekdays') {
      // One repeating notification per chosen weekday (app 0=Sun..6=Sat →
      // Capacitor 1=Sun..7=Sat).
      for (const weekday of habit.schedule.weekdays) {
        out.push({
          id: notificationId(habit.id, weekday + 1),
          title,
          body,
          schedule: { on: { weekday: weekday + 1, hour, minute }, repeats: true, allowWhileIdle: true },
        });
      }
    } else {
      // Daily repeating at the set time (times-per-week/month and every-N-days
      // are "available" each day, so a daily nudge is the sensible default).
      out.push({
        id: notificationId(habit.id, 0),
        title,
        body,
        schedule: { on: { hour, minute }, repeats: true, allowWhileIdle: true },
      });
    }
  }
  return out;
}

/**
 * Reschedule all native reminders from the current habits. No-ops unless the
 * native plugin is present, the user has turned reminders on, and permission is
 * granted. Best-effort.
 */
export async function syncLocalNotifications(): Promise<void> {
  if (!isLocalNotificationsAvailable() || !localRemindersEnabled()) return;
  if ((await localNotificationPermission()) !== 'granted') return;
  const habits = await createHabitRepository().getActive();
  await cancelAllLocalNotifications();
  await scheduleLocalNotifications(notificationsFor(habits));
}
