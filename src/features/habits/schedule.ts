/**
 * Schedule matching (brief §11). Pure functions over the habit definition and a
 * local date key. "Scheduled" means the recurrence rule matches and the date is
 * within the habit's active window — it is independent of completion and pause.
 */
import { diffInDays, weekdayOf, type DateKey } from '@/lib/dates';
import type { Habit, Schedule } from './schemas';

/** Whether `key` falls within `[startDate, endDate]` (endDate optional). */
export function isWithinRange(habit: Pick<Habit, 'startDate' | 'endDate'>, key: DateKey): boolean {
  if (key < habit.startDate) return false;
  if (habit.endDate && key > habit.endDate) return false;
  return true;
}

/** Whether the habit is paused on `key` (inside any paused period). */
export function isPausedOn(habit: Pick<Habit, 'pausedPeriods'>, key: DateKey): boolean {
  return habit.pausedPeriods.some(
    (period) => key >= period.start && (period.end === null || key <= period.end),
  );
}

/** Whether the recurrence rule matches `key`, ignoring range and pause. */
export function matchesRecurrence(schedule: Schedule, startDate: DateKey, key: DateKey): boolean {
  switch (schedule.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return schedule.weekdays.includes(weekdayOf(key));
    case 'every_n_days': {
      const delta = diffInDays(key, startDate);
      return delta >= 0 && delta % schedule.intervalDays === 0;
    }
    case 'once':
      return key === startDate;
    // Flexible targets can be completed on any day within their period; they are
    // "available" every day and their success is judged per week/month.
    case 'times_per_week':
    case 'times_per_month':
      return true;
    default: {
      const _exhaustive: never = schedule;
      return _exhaustive;
    }
  }
}

/** Whether the habit is scheduled on `key` (within range and recurrence). */
export function isScheduledOn(habit: Habit, key: DateKey): boolean {
  if (habit.deletedAt) return false;
  if (!isWithinRange(habit, key)) return false;
  return matchesRecurrence(habit.schedule, habit.startDate, key);
}

/** Flexible = judged over a week/month rather than on specific weekdays. */
export function isFlexibleSchedule(schedule: Schedule): boolean {
  return schedule.type === 'times_per_week' || schedule.type === 'times_per_month';
}
