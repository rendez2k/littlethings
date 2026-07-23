import type { Habit } from './schemas';

/**
 * Grouping for the Habits tab (management view). The app's six schedule types
 * and three target types collapse into human buckets:
 *
 *   - `multipleDaily` — a count target of 2+, logged several times within a day
 *     (e.g. "Water · 6 times"). This wins over the schedule, since it's the
 *     defining trait.
 *   - `daily`   — a plain daily schedule (once every day).
 *   - `weekly`  — a weekly rhythm: certain weekdays, or a few times per week.
 *   - `interval`— every N days.
 *   - `monthly` — a few times per month.
 *   - `oneOff`  — a single one-off to get to (kept out of "weekly").
 */
export type HabitCategory =
  | 'multipleDaily'
  | 'daily'
  | 'weekly'
  | 'interval'
  | 'monthly'
  | 'oneOff';

export interface HabitCategoryMeta {
  key: HabitCategory;
  label: string;
}

/** Groups in display order (roughly most frequent first). */
export const HABIT_CATEGORIES: readonly HabitCategoryMeta[] = [
  { key: 'multipleDaily', label: 'Multiple times a day' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'interval', label: 'Every few days' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'oneOff', label: 'One-off' },
];

/** Bucket a single habit. */
export function habitCategory(habit: Habit): HabitCategory {
  if (habit.target.type === 'count' && habit.target.amount >= 2) return 'multipleDaily';
  switch (habit.schedule.type) {
    case 'daily':
      return 'daily';
    case 'weekdays':
    case 'times_per_week':
      return 'weekly';
    case 'every_n_days':
      return 'interval';
    case 'times_per_month':
      return 'monthly';
    case 'once':
      return 'oneOff';
    default: {
      const _exhaustive: never = habit.schedule;
      return _exhaustive;
    }
  }
}

/**
 * Split habits into their groups, preserving the given order within each and
 * dropping empty groups. Handy for rendering the sectioned list.
 */
export function groupHabits(
  habits: readonly Habit[],
): Array<{ key: HabitCategory; label: string; habits: Habit[] }> {
  return HABIT_CATEGORIES.map(({ key, label }) => ({
    key,
    label,
    habits: habits.filter((habit) => habitCategory(habit) === key),
  })).filter((group) => group.habits.length > 0);
}
