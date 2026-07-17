/**
 * Local calendar date utilities.
 *
 * A "date key" is a `YYYY-MM-DD` string in the user's **local** calendar. We use
 * these as the canonical way to identify a habit day, so history never drifts
 * because of UTC/timezone differences (brief §11, §20). All conversions here go
 * through the local Date fields (getFullYear/getMonth/getDate), never UTC.
 */

export type DateKey = string; // 'YYYY-MM-DD'

/** Day of week as stored in schedules: 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WeekStart = 0 | 1; // Sunday or Monday

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format a Date as a local date key. */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a local date key into a Date at local midnight. */
export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

/** Today's local date key. `now` is injectable for deterministic tests. */
export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

/** True for a well-formed, real calendar date key (rejects e.g. 2024-02-30). */
export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return toDateKey(fromDateKey(key)) === key;
}

/** Add (or subtract) whole days, returning a new date key. */
export function addDays(key: DateKey, days: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/**
 * Whole-day difference `a - b` (calendar days, DST-safe).
 * Positive when `a` is after `b`.
 */
export function diffInDays(a: DateKey, b: DateKey): number {
  // Compare at UTC noon of each local date to sidestep DST hour shifts.
  const [ay, am, ad] = a.split('-').map(Number) as [number, number, number];
  const [by, bm, bd] = b.split('-').map(Number) as [number, number, number];
  const au = Date.UTC(ay, am - 1, ad);
  const bu = Date.UTC(by, bm - 1, bd);
  return Math.round((au - bu) / 86_400_000);
}

export function isBefore(a: DateKey, b: DateKey): boolean {
  return a < b; // ISO date keys are lexicographically ordered.
}
export function isAfter(a: DateKey, b: DateKey): boolean {
  return a > b;
}
export function isSameOrBefore(a: DateKey, b: DateKey): boolean {
  return a <= b;
}
export function isSameOrAfter(a: DateKey, b: DateKey): boolean {
  return a >= b;
}

/** A date key is "in the future" relative to today. */
export function isFuture(key: DateKey, today: DateKey): boolean {
  return key > today;
}

/** Local weekday index for a date key (0 = Sunday). */
export function weekdayOf(key: DateKey): Weekday {
  return fromDateKey(key).getDay() as Weekday;
}

/** Inclusive list of date keys from `start` to `end`. */
export function enumerateDays(start: DateKey, end: DateKey): DateKey[] {
  if (start > end) return [];
  const out: DateKey[] = [];
  let cur = start;
  // Guard against pathological ranges.
  for (let i = 0; i <= diffInDays(end, start); i++) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** Clamp a date key into `[min, max]` (either bound optional). */
export function clampKey(key: DateKey, min?: DateKey, max?: DateKey): DateKey {
  if (min && key < min) return min;
  if (max && key > max) return max;
  return key;
}
