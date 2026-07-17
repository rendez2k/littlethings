/**
 * Insights statistics service (brief §7.7). Pure and tested. Aggregates habit
 * completion across a week / month / year window without ever fabricating
 * misleading figures — callers get the raw opportunity counts so they can show
 * an encouraging low-data state instead.
 */
import {
  addDays,
  daysInMonth,
  endOfMonthKey,
  startOfMonthKey,
  startOfWeekKey,
  weekdayOf,
  type DateKey,
  type Weekday,
  type WeekStart,
} from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import { isPausedOn, isScheduledOn } from '@/features/habits/schedule';
import { deriveDayStatus } from '@/features/completions/logic';
import type { Completion } from '@/features/completions/schemas';
import { computeStreak } from '@/features/streaks/streak';

export type InsightsRange = 'week' | 'month' | 'year';

export interface TrendPoint {
  label: string;
  /** Completion ratio in [0,1], or null for buckets with no elapsed data. */
  ratio: number | null;
}

export interface HabitPerformance {
  habitId: string;
  name: string;
  color: Habit['color'];
  rate: number;
  opportunities: number;
}

export interface WeekdayStat {
  weekday: Weekday;
  rate: number;
  opportunities: number;
}

export interface Insights {
  range: InsightsRange;
  windowStart: DateKey;
  windowEnd: DateKey;
  opportunities: number;
  completed: number;
  completionRate: number;
  totalCompletions: number;
  perfectDays: number;
  currentStreak: number;
  bestStreak: number;
  streakUnit: 'day' | 'week' | 'month';
  trend: TrendPoint[];
  habitPerformance: HabitPerformance[];
  weekdays: WeekdayStat[];
  mostConsistentDay: Weekday | null;
}

function indexCompletions(completions: Completion[]): Map<string, Map<DateKey, Completion>> {
  const byHabit = new Map<string, Map<DateKey, Completion>>();
  for (const c of completions) {
    if (c.deletedAt) continue;
    let inner = byHabit.get(c.habitId);
    if (!inner) {
      inner = new Map();
      byHabit.set(c.habitId, inner);
    }
    inner.set(c.date, c);
  }
  return byHabit;
}

/** Opportunity/completion tally for a single day across all habits. */
function dayTally(
  habits: Habit[],
  byHabit: Map<string, Map<DateKey, Completion>>,
  date: DateKey,
  today: DateKey,
): { opportunities: number; completed: number; scheduled: number; perfect: boolean } {
  let opportunities = 0;
  let completed = 0;
  let scheduled = 0;
  let missed = false;
  let pending = false;
  for (const habit of habits) {
    if (habit.status === 'archived') continue;
    if (!isScheduledOn(habit, date) || isPausedOn(habit, date)) continue;
    scheduled += 1;
    const status = deriveDayStatus(habit, byHabit.get(habit.id)?.get(date), date, today);
    if (status === 'skipped') continue; // neutral, and fine for a perfect day
    if (status === 'pending') {
      // A not-yet-done today: neutral for the rate, but the day isn't perfect.
      pending = true;
      continue;
    }
    opportunities += 1;
    if (status === 'complete') completed += 1;
    else missed = true; // missed / partial
  }
  return {
    opportunities,
    completed,
    scheduled,
    perfect: scheduled > 0 && !missed && !pending,
  };
}

function windowFor(range: InsightsRange, today: DateKey, weekStartsOn: WeekStart) {
  if (range === 'week') {
    const start = startOfWeekKey(today, weekStartsOn);
    return { start, end: addDays(start, 6) };
  }
  if (range === 'month') {
    return { start: startOfMonthKey(today), end: endOfMonthKey(today) };
  }
  const year = today.slice(0, 4);
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export function computeInsights(
  habits: Habit[],
  completions: Completion[],
  range: InsightsRange,
  today: DateKey,
  weekStartsOn: WeekStart = 1,
): Insights {
  const byHabit = indexCompletions(completions);
  const { start, end } = windowFor(range, today, weekStartsOn);
  const lastDay = end < today ? end : today;

  let opportunities = 0;
  let completed = 0;
  let perfectDays = 0;
  const weekdayTally = Array.from({ length: 7 }, () => ({ opp: 0, comp: 0 }));

  // Aggregate elapsed days in the window.
  let day = start;
  for (let guard = 0; day <= lastDay && guard < 100_000; guard++, day = addDays(day, 1)) {
    const t = dayTally(habits, byHabit, day, today);
    opportunities += t.opportunities;
    completed += t.completed;
    if (t.perfect) perfectDays += 1;
    const wd = weekdayOf(day);
    weekdayTally[wd]!.opp += t.opportunities;
    weekdayTally[wd]!.comp += t.completed;
  }

  const totalCompletions = completions.filter(
    (c) => !c.deletedAt && c.state === 'complete' && c.date >= start && c.date <= lastDay,
  ).length;

  // Streaks (all-time, best across habits — the headline numbers).
  let currentStreak = 0;
  let bestStreak = 0;
  let streakUnit: Insights['streakUnit'] = 'day';
  for (const habit of habits) {
    if (habit.status === 'archived') continue;
    const s = computeStreak(
      habit,
      completions.filter((c) => c.habitId === habit.id),
      today,
      weekStartsOn,
    );
    if (s.current > currentStreak) {
      currentStreak = s.current;
      streakUnit = s.unit;
    }
    if (s.best > bestStreak) bestStreak = s.best;
  }

  const trend = buildTrend(range, habits, byHabit, start, today, weekStartsOn);
  const habitPerformance = buildHabitPerformance(habits, byHabit, start, lastDay, today);

  const weekdays: WeekdayStat[] = weekdayTally.map((t, i) => ({
    weekday: i as Weekday,
    rate: t.opp === 0 ? 0 : t.comp / t.opp,
    opportunities: t.opp,
  }));
  const consistent = weekdays.filter((w) => w.opportunities > 0).sort((a, b) => b.rate - a.rate)[0];

  return {
    range,
    windowStart: start,
    windowEnd: end,
    opportunities,
    completed,
    completionRate: opportunities === 0 ? 0 : completed / opportunities,
    totalCompletions,
    perfectDays,
    currentStreak,
    bestStreak,
    streakUnit,
    trend,
    habitPerformance,
    weekdays,
    mostConsistentDay: consistent ? consistent.weekday : null,
  };
}

function buildTrend(
  range: InsightsRange,
  habits: Habit[],
  byHabit: Map<string, Map<DateKey, Completion>>,
  start: DateKey,
  today: DateKey,
  weekStartsOn: WeekStart,
): TrendPoint[] {
  const dayRatio = (date: DateKey): number | null => {
    if (date > today) return null;
    const t = dayTally(habits, byHabit, date, today);
    return t.opportunities === 0 ? null : t.completed / t.opportunities;
  };

  if (range === 'week') {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return {
        label: dayLetter(weekdayOf(date)),
        ratio: dayRatio(date),
      };
    });
  }

  if (range === 'month') {
    const count = daysInMonth(start);
    return Array.from({ length: count }, (_, i) => {
      const date = addDays(start, i);
      return { label: String(i + 1), ratio: dayRatio(date) };
    });
  }

  // Year: 12 monthly buckets.
  const year = start.slice(0, 4);
  return Array.from({ length: 12 }, (_, m) => {
    const monthStart = `${year}-${String(m + 1).padStart(2, '0')}-01`;
    const days = daysInMonth(monthStart);
    let opp = 0;
    let comp = 0;
    for (let d = 0; d < days; d++) {
      const date = addDays(monthStart, d);
      if (date > today) break;
      const t = dayTally(habits, byHabit, date, today);
      opp += t.opportunities;
      comp += t.completed;
    }
    void weekStartsOn;
    return { label: MONTH_LETTERS[m]!, ratio: opp === 0 ? null : comp / opp };
  });
}

function buildHabitPerformance(
  habits: Habit[],
  byHabit: Map<string, Map<DateKey, Completion>>,
  start: DateKey,
  lastDay: DateKey,
  today: DateKey,
): HabitPerformance[] {
  return habits
    .filter((h) => h.status !== 'archived')
    .map((habit) => {
      let opp = 0;
      let comp = 0;
      let day = start;
      for (let guard = 0; day <= lastDay && guard < 100_000; guard++, day = addDays(day, 1)) {
        if (!isScheduledOn(habit, day) || isPausedOn(habit, day)) continue;
        const status = deriveDayStatus(habit, byHabit.get(habit.id)?.get(day), day, today);
        if (status === 'skipped' || status === 'pending') continue;
        opp += 1;
        if (status === 'complete') comp += 1;
      }
      return {
        habitId: habit.id,
        name: habit.name,
        color: habit.color,
        rate: opp === 0 ? 0 : comp / opp,
        opportunities: opp,
      };
    })
    .sort((a, b) => b.rate - a.rate);
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
function dayLetter(wd: Weekday): string {
  return DAY_LETTERS[wd]!;
}
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
