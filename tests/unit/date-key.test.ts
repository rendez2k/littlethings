import { describe, expect, it } from 'vitest';
import {
  addDays,
  diffInDays,
  enumerateDays,
  fromDateKey,
  isValidDateKey,
  toDateKey,
  todayKey,
  weekdayOf,
} from '@/lib/dates';

describe('toDateKey / fromDateKey', () => {
  it('round-trips a local date', () => {
    const key = '2024-05-15';
    expect(toDateKey(fromDateKey(key))).toBe(key);
  });

  it('formats single-digit months and days with padding', () => {
    expect(toDateKey(new Date(2024, 0, 3))).toBe('2024-01-03');
  });

  it('uses the injected clock for today', () => {
    expect(todayKey(new Date(2024, 11, 25, 23, 59))).toBe('2024-12-25');
  });
});

describe('isValidDateKey', () => {
  it('accepts real dates and rejects impossible or malformed ones', () => {
    expect(isValidDateKey('2024-02-29')).toBe(true); // leap year
    expect(isValidDateKey('2023-02-29')).toBe(false); // not a leap year
    expect(isValidDateKey('2024-13-01')).toBe(false);
    expect(isValidDateKey('2024-04-31')).toBe(false);
    expect(isValidDateKey('2024-5-1')).toBe(false);
    expect(isValidDateKey('not-a-date')).toBe(false);
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2024-01-31', 1)).toBe('2024-02-01');
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29'); // leap day
  });
});

describe('diffInDays', () => {
  it('counts whole calendar days regardless of DST', () => {
    // US spring-forward happened 2024-03-10; the gap is still 1 day.
    expect(diffInDays('2024-03-11', '2024-03-10')).toBe(1);
    expect(diffInDays('2024-03-10', '2024-03-11')).toBe(-1);
    expect(diffInDays('2025-01-01', '2024-01-01')).toBe(366); // 2024 is a leap year
  });
});

describe('weekdayOf', () => {
  it('returns 0 for Sunday and 1 for Monday', () => {
    expect(weekdayOf('2024-05-12')).toBe(0); // Sunday
    expect(weekdayOf('2024-05-13')).toBe(1); // Monday
    expect(weekdayOf('2024-05-18')).toBe(6); // Saturday
  });
});

describe('enumerateDays', () => {
  it('is inclusive and ordered', () => {
    expect(enumerateDays('2024-05-01', '2024-05-03')).toEqual([
      '2024-05-01',
      '2024-05-02',
      '2024-05-03',
    ]);
  });
  it('returns a single day for equal bounds and empty for reversed', () => {
    expect(enumerateDays('2024-05-01', '2024-05-01')).toEqual(['2024-05-01']);
    expect(enumerateDays('2024-05-03', '2024-05-01')).toEqual([]);
  });
});
