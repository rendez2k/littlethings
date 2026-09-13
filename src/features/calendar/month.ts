/**
 * Pure helpers for the month calendar view: the week-aligned grid of cells and
 * the per-day roll-up of every habit's status, so the screen stays declarative
 * and this logic can be unit-tested without the DOM.
 */
import type { DateKey, WeekStart } from '@/lib/dates';
import { addDays, daysInMonth, startOfMonthKey, startOfWeekKey } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import { buildDayView, type DayEntry } from '@/features/completions/day-view';

export interface MonthCell {
  date: DateKey;
  /** False for the leading/trailing padding cells outside the month. */
  inMonth: boolean;
}

/** `YYYY-MM` shifted by `delta` months (handles year boundaries). */
export function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * The month as rows of seven cells, aligned to the user's week start and padded
 * with out-of-month cells so every row is a full week.
 */
export function monthGrid(monthKey: string, weekStartsOn: WeekStart): MonthCell[][] {
  const first = startOfMonthKey(`${monthKey}-01`);
  const last = addDays(first, daysInMonth(first) - 1);
  const gridStart = startOfWeekKey(first, weekStartsOn);

  const weeks: MonthCell[][] = [];
  let cursor = gridStart;
  // Keep adding weeks until the row containing the last day is complete.
  while (cursor <= last) {
    const week: MonthCell[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({ date: cursor, inMonth: cursor >= first && cursor <= last });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export interface DaySummary {
  date: DateKey;
  entries: DayEntry[];
  /** Entries that are complete or skipped. */
  done: number;
  total: number;
}

/** Non-tombstoned completions grouped by their date key. */
export function groupCompletionsByDate(completions: Completion[]): Map<DateKey, Completion[]> {
  const map = new Map<DateKey, Completion[]>();
  for (const c of completions) {
    if (c.deletedAt) continue;
    const list = map.get(c.date) ?? [];
    list.push(c);
    map.set(c.date, list);
  }
  return map;
}

/**
 * Roll up every day in the grid. Reuses the Today screen's day-view logic so
 * the calendar agrees with Today about what's scheduled, done, and waiting
 * (including one-offs that only show on the day they were actually done).
 */
export function summariseDays(
  dates: DateKey[],
  habits: Habit[],
  byDate: Map<DateKey, Completion[]>,
  today: DateKey,
  resolvedIds: ReadonlySet<string>,
): Map<DateKey, DaySummary> {
  const out = new Map<DateKey, DaySummary>();
  for (const date of dates) {
    const view = buildDayView(habits, byDate.get(date) ?? [], date, today, resolvedIds);
    out.set(date, {
      date,
      entries: view.entries,
      done: view.summary.completed + view.summary.skipped,
      total: view.summary.total,
    });
  }
  return out;
}
