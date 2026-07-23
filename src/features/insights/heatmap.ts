import { addDays, startOfWeekKey, type DateKey, type WeekStart } from '@/lib/dates';
import { goalValue } from '@/features/completions/logic';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';

export interface HeatCell {
  date: DateKey;
  /** 0 = none, 1–4 = increasing completion intensity. */
  level: number;
  future: boolean;
}

/** Completion intensity for one day, as a 0–4 level (boolean done → 4). */
export function levelFor(completion: Completion | undefined, habit: Habit): number {
  if (!completion || completion.deletedAt || completion.state === 'skipped') return 0;
  const goal = goalValue(habit.target);
  const ratio = goal <= 0 ? 0 : completion.value / goal;
  if (ratio <= 0) return 0;
  if (ratio >= 1) return 4;
  if (ratio >= 0.66) return 3;
  if (ratio >= 0.34) return 2;
  return 1;
}

/**
 * Build a GitHub-style contribution grid for a habit: an array of week columns
 * (oldest → newest), each 7 days (top → bottom, aligned to the week start),
 * ending with the week containing `today`.
 */
export function buildHeatmap(
  habit: Habit,
  completions: Completion[],
  today: DateKey,
  weeks: number,
  weekStartsOn: WeekStart,
): HeatCell[][] {
  const byDate = new Map<string, Completion>();
  for (const c of completions) if (!c.deletedAt) byDate.set(c.date, c);

  const firstColumn = addDays(startOfWeekKey(today, weekStartsOn), -(weeks - 1) * 7);
  const columns: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(firstColumn, w * 7 + d);
      const future = date > today;
      column.push({ date, future, level: future ? 0 : levelFor(byDate.get(date), habit) });
    }
    columns.push(column);
  }
  return columns;
}
