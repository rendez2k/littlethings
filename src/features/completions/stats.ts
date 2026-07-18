/**
 * Per-habit statistics for the details screen: current/best streak, completion
 * rate and total completions. Pure and tested. Avoids misleading figures when
 * little data exists by reporting the raw counts alongside the rate.
 */
import { addDays, type DateKey, type WeekStart } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import { isPausedOn, isScheduledOn } from '@/features/habits/schedule';
import { deriveDayStatus } from './logic';
import type { Completion } from './schemas';
import { computeStreak, type StreakUnit } from '@/features/streaks/streak';

export interface HabitStats {
  current: number;
  best: number;
  unit: StreakUnit;
  /** Complete ÷ opportunities, in [0,1]. */
  completionRate: number;
  totalCompletions: number;
  /** Scheduled, elapsed, non-paused, non-skipped days considered. */
  opportunities: number;
}

export function computeHabitStats(
  habit: Habit,
  completions: Completion[],
  today: DateKey,
  weekStartsOn: WeekStart = 1,
): HabitStats {
  const byDay = new Map<DateKey, Completion>();
  for (const c of completions) if (!c.deletedAt) byDay.set(c.date, c);

  const streak = computeStreak(habit, completions, today, weekStartsOn);

  let opportunities = 0;
  let completed = 0;
  const end = habit.endDate && habit.endDate < today ? habit.endDate : today;
  let day = habit.startDate;
  for (let guard = 0; day <= end && guard < 100_000; guard++, day = addDays(day, 1)) {
    if (!isScheduledOn(habit, day)) continue;
    if (isPausedOn(habit, day)) continue;
    const status = deriveDayStatus(habit, byDay.get(day), day, today);
    // Skipped days are neutral; a not-yet-done today shouldn't hurt the rate.
    if (status === 'skipped' || status === 'pending') continue;
    opportunities += 1;
    if (status === 'complete') completed += 1;
  }

  const totalCompletions = completions.filter((c) => !c.deletedAt && c.state === 'complete').length;

  return {
    current: streak.current,
    best: streak.best,
    unit: streak.unit,
    completionRate: opportunities === 0 ? 0 : completed / opportunities,
    totalCompletions,
    opportunities,
  };
}
