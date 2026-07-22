import type { Habit } from './schemas';

/**
 * Grouping for the Habits tab (management view). The app's six schedule types
 * and three target types collapse into three human buckets:
 *
 *   - `multipleDaily` — a count target of 2+, logged several times within a day
 *     (e.g. "Water · 6 times"). This wins over the schedule, since it's the
 *     defining trait.
 *   - `daily` — a plain daily schedule (once every day).
 *   - `weekly` — every other cadence: specific weekdays, times per week/month,
 *     every N days, or a one-off.
 */
export type HabitCategory = 'multipleDaily' | 'daily' | 'weekly';

export interface HabitCategoryMeta {
  key: HabitCategory;
  label: string;
}

/** Groups in display order (most frequent first). */
export const HABIT_CATEGORIES: readonly HabitCategoryMeta[] = [
  { key: 'multipleDaily', label: 'Multiple times a day' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
];

/** Bucket a single habit. */
export function habitCategory(habit: Habit): HabitCategory {
  if (habit.target.type === 'count' && habit.target.amount >= 2) return 'multipleDaily';
  if (habit.schedule.type === 'daily') return 'daily';
  return 'weekly';
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
