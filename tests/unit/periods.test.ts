import { describe, expect, it } from 'vitest';
import {
  daysInMonth,
  endOfMonthKey,
  endOfWeekKey,
  enumerateMonths,
  enumerateWeeks,
  startOfMonthKey,
  startOfWeekKey,
} from '@/lib/dates';

describe('week boundaries', () => {
  // 2024-05-15 is a Wednesday.
  it('honours a Monday week start', () => {
    expect(startOfWeekKey('2024-05-15', 1)).toBe('2024-05-13'); // Monday
    expect(endOfWeekKey('2024-05-15', 1)).toBe('2024-05-19'); // Sunday
  });
  it('honours a Sunday week start', () => {
    expect(startOfWeekKey('2024-05-15', 0)).toBe('2024-05-12'); // Sunday
    expect(endOfWeekKey('2024-05-15', 0)).toBe('2024-05-18'); // Saturday
  });
  it('keeps the start day as its own week start', () => {
    expect(startOfWeekKey('2024-05-13', 1)).toBe('2024-05-13');
    expect(startOfWeekKey('2024-05-12', 0)).toBe('2024-05-12');
  });
});

describe('month boundaries', () => {
  it('finds the first and last day, including February in a leap year', () => {
    expect(startOfMonthKey('2024-02-15')).toBe('2024-02-01');
    expect(endOfMonthKey('2024-02-15')).toBe('2024-02-29');
    expect(endOfMonthKey('2023-02-15')).toBe('2023-02-28');
    expect(endOfMonthKey('2024-12-10')).toBe('2024-12-31');
  });
  it('counts days in a month', () => {
    expect(daysInMonth('2024-02-01')).toBe(29);
    expect(daysInMonth('2024-04-01')).toBe(30);
  });
});

describe('enumerateWeeks', () => {
  it('lists week-start keys inclusively across a month', () => {
    const weeks = enumerateWeeks('2024-05-01', '2024-05-20', 1);
    expect(weeks).toEqual(['2024-04-29', '2024-05-06', '2024-05-13', '2024-05-20']);
  });
});

describe('enumerateMonths', () => {
  it('lists YYYY-MM across a year boundary', () => {
    expect(enumerateMonths('2024-11-15', '2025-02-03')).toEqual([
      '2024-11',
      '2024-12',
      '2025-01',
      '2025-02',
    ]);
  });
});
