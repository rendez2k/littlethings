/**
 * Week and month boundary helpers, honouring the user's week-start preference.
 * All operate on and return local date keys.
 */
import { addDays, toDateKey, weekdayOf, type DateKey, type WeekStart } from './date-key';

/** Date key of the first day of the week containing `key`. */
export function startOfWeekKey(key: DateKey, weekStartsOn: WeekStart): DateKey {
  const day = weekdayOf(key);
  const diff = (day - weekStartsOn + 7) % 7;
  return addDays(key, -diff);
}

/** Date key of the last day of the week containing `key`. */
export function endOfWeekKey(key: DateKey, weekStartsOn: WeekStart): DateKey {
  return addDays(startOfWeekKey(key, weekStartsOn), 6);
}

/** Stable identifier for the week containing `key` (its start date key). */
export function weekKeyOf(key: DateKey, weekStartsOn: WeekStart): DateKey {
  return startOfWeekKey(key, weekStartsOn);
}

export function startOfMonthKey(key: DateKey): DateKey {
  const [y, m] = key.split('-').map(Number) as [number, number, number];
  return toDateKey(new Date(y, m - 1, 1));
}

export function endOfMonthKey(key: DateKey): DateKey {
  const [y, m] = key.split('-').map(Number) as [number, number, number];
  // Day 0 of next month = last day of this month.
  return toDateKey(new Date(y, m, 0));
}

/** Stable identifier for the month containing `key` (its `YYYY-MM`). */
export function monthKeyOf(key: DateKey): string {
  return key.slice(0, 7);
}

/** Number of days in the month containing `key`. */
export function daysInMonth(key: DateKey): number {
  return Number(endOfMonthKey(key).slice(8, 10));
}

/** All week-start keys from the week of `start` through the week of `end`. */
export function enumerateWeeks(start: DateKey, end: DateKey, weekStartsOn: WeekStart): DateKey[] {
  const first = startOfWeekKey(start, weekStartsOn);
  const last = startOfWeekKey(end, weekStartsOn);
  const out: DateKey[] = [];
  let cur = first;
  while (cur <= last) {
    out.push(cur);
    cur = addDays(cur, 7);
  }
  return out;
}

/** All month keys (`YYYY-MM`) from the month of `start` through `end`. */
export function enumerateMonths(start: DateKey, end: DateKey): string[] {
  const out: string[] = [];
  let [y, m] = start.split('-').map(Number) as [number, number, number];
  const [ey, em] = end.split('-').map(Number) as [number, number, number];
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${m < 10 ? `0${m}` : m}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}
