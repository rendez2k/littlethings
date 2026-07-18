/**
 * Streak calculation (brief §13). See `docs/STREAKS.md` for the rules.
 *
 * Pure and deterministic: given a habit, its completion records and today's date
 * key, it returns the current and best streak. No shame language is produced
 * here — this module only computes numbers.
 */
import {
  addDays,
  enumerateMonths,
  enumerateWeeks,
  endOfMonthKey,
  startOfMonthKey,
  type DateKey,
  type WeekStart,
} from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import { isPausedOn, isScheduledOn, isWithinRange } from '@/features/habits/schedule';
import { deriveDayStatus } from '@/features/completions/logic';
import type { Completion } from '@/features/completions/schemas';

export type StreakUnit = 'day' | 'week' | 'month';

export interface StreakResult {
  current: number;
  best: number;
  unit: StreakUnit;
}

type Verdict = 'inc' | 'neutral' | 'break';

function byDate(completions: Completion[]): Map<DateKey, Completion> {
  const map = new Map<DateKey, Completion>();
  for (const c of completions) {
    if (c.deletedAt) continue;
    map.set(c.date, c);
  }
  return map;
}

/** Current run length: count trailing `inc`, bridging `neutral`, stop at `break`. */
function currentRun(verdicts: Verdict[]): number {
  let run = 0;
  for (let i = verdicts.length - 1; i >= 0; i--) {
    const v = verdicts[i];
    if (v === 'inc') run += 1;
    else if (v === 'break') break;
    // neutral: bridge, keep going.
  }
  return run;
}

/** Best run length: longest sequence of `inc`, bridging `neutral`, reset on `break`. */
function bestRun(verdicts: Verdict[]): number {
  let best = 0;
  let run = 0;
  for (const v of verdicts) {
    if (v === 'inc') {
      run += 1;
      best = Math.max(best, run);
    } else if (v === 'break') {
      run = 0;
    }
    // neutral: leave run unchanged (bridge).
  }
  return best;
}

function computeDayStreak(
  habit: Habit,
  byDay: Map<DateKey, Completion>,
  today: DateKey,
): StreakResult {
  const verdicts: Verdict[] = [];
  // Walk scheduled days from start to today.
  let day = habit.startDate;
  const end = habit.endDate && habit.endDate < today ? habit.endDate : today;
  // Safety bound to avoid runaway loops on corrupt data.
  for (let guard = 0; day <= end && guard < 100_000; guard++, day = addDays(day, 1)) {
    if (!isScheduledOn(habit, day)) continue;
    const status = deriveDayStatus(habit, byDay.get(day), day, today);
    const isToday = day === today;
    if (status === 'complete') verdicts.push('inc');
    else if (status === 'skipped' || status === 'paused' || status === 'pending')
      verdicts.push('neutral');
    else if (status === 'missed' || status === 'partial')
      verdicts.push(isToday ? 'neutral' : 'break');
    // 'future' / 'not_scheduled' cannot occur here.
  }
  return { current: currentRun(verdicts), best: bestRun(verdicts), unit: 'day' };
}

interface Period {
  start: DateKey;
  end: DateKey;
}

function computePeriodStreak(
  habit: Habit,
  byDay: Map<DateKey, Completion>,
  today: DateKey,
  required: number,
  periods: Period[],
): Verdict[] {
  const verdicts: Verdict[] = [];
  for (const period of periods) {
    let available = 0;
    let complete = 0;
    let day = period.start;
    while (day <= period.end) {
      if (day <= today && isWithinRange(habit, day) && !isPausedOn(habit, day)) {
        available += 1;
        const status = deriveDayStatus(habit, byDay.get(day), day, today);
        if (status === 'complete') complete += 1;
      }
      day = addDays(day, 1);
    }

    if (available === 0) {
      verdicts.push('neutral'); // Fully paused / out of range / all future.
      continue;
    }

    const requiredEff = Math.min(required, available);
    const success = complete >= requiredEff;
    const isCurrent = period.start <= today && today <= period.end;
    if (success) verdicts.push('inc');
    else verdicts.push(isCurrent ? 'neutral' : 'break');
  }
  return verdicts;
}

function computeWeekStreak(
  habit: Habit,
  byDay: Map<DateKey, Completion>,
  today: DateKey,
  weekStartsOn: WeekStart,
  required: number,
): StreakResult {
  const lastDay = habit.endDate && habit.endDate < today ? habit.endDate : today;
  const weekStarts = enumerateWeeks(habit.startDate, lastDay, weekStartsOn);
  const periods: Period[] = weekStarts.map((start) => ({ start, end: addDays(start, 6) }));
  const verdicts = computePeriodStreak(habit, byDay, today, required, periods);
  return { current: currentRun(verdicts), best: bestRun(verdicts), unit: 'week' };
}

function computeMonthStreak(
  habit: Habit,
  byDay: Map<DateKey, Completion>,
  today: DateKey,
  required: number,
): StreakResult {
  const lastDay = habit.endDate && habit.endDate < today ? habit.endDate : today;
  const monthKeys = enumerateMonths(habit.startDate, lastDay);
  const periods: Period[] = monthKeys.map((mk) => {
    const anyDay = `${mk}-01`;
    return { start: startOfMonthKey(anyDay), end: endOfMonthKey(anyDay) };
  });
  const verdicts = computePeriodStreak(habit, byDay, today, required, periods);
  return { current: currentRun(verdicts), best: bestRun(verdicts), unit: 'month' };
}

/** Compute the current and best streak for a habit. */
export function computeStreak(
  habit: Habit,
  completions: Completion[],
  today: DateKey,
  weekStartsOn: WeekStart = 1,
): StreakResult {
  const byDay = byDate(completions);
  const { schedule } = habit;

  switch (schedule.type) {
    case 'times_per_week':
      return computeWeekStreak(habit, byDay, today, weekStartsOn, schedule.timesPerWeek);
    case 'times_per_month':
      return computeMonthStreak(habit, byDay, today, schedule.timesPerMonth);
    default:
      return computeDayStreak(habit, byDay, today);
  }
}
