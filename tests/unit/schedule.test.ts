import { describe, expect, it } from 'vitest';
import { isPausedOn, isScheduledOn, matchesRecurrence } from '@/features/habits/schedule';
import type { Schedule } from '@/features/habits/schemas';
import { makeHabit } from '../factories';

describe('matchesRecurrence', () => {
  it('daily matches every day', () => {
    expect(matchesRecurrence({ type: 'daily' }, '2024-05-01', '2024-05-09')).toBe(true);
  });

  it('weekdays matches only selected days', () => {
    // Mon/Wed/Fri = 1,3,5. 2024-05-13 Mon, 14 Tue, 15 Wed.
    const sched: Schedule = { type: 'weekdays', weekdays: [1, 3, 5] };
    expect(matchesRecurrence(sched, '2024-05-01', '2024-05-13')).toBe(true);
    expect(matchesRecurrence(sched, '2024-05-01', '2024-05-14')).toBe(false);
    expect(matchesRecurrence(sched, '2024-05-01', '2024-05-15')).toBe(true);
  });

  it('every_n_days matches on the interval from the start date', () => {
    const sched = { type: 'every_n_days', intervalDays: 3 } as const;
    expect(matchesRecurrence(sched, '2024-05-01', '2024-05-01')).toBe(true);
    expect(matchesRecurrence(sched, '2024-05-01', '2024-05-04')).toBe(true);
    expect(matchesRecurrence(sched, '2024-05-01', '2024-05-03')).toBe(false);
  });

  it('once matches only the start date', () => {
    expect(matchesRecurrence({ type: 'once' }, '2024-05-01', '2024-05-01')).toBe(true);
    expect(matchesRecurrence({ type: 'once' }, '2024-05-01', '2024-05-02')).toBe(false);
  });

  it('flexible schedules are available every day', () => {
    expect(
      matchesRecurrence({ type: 'times_per_week', timesPerWeek: 3 }, '2024-05-01', '2024-05-09'),
    ).toBe(true);
    expect(
      matchesRecurrence({ type: 'times_per_month', timesPerMonth: 8 }, '2024-05-01', '2024-05-30'),
    ).toBe(true);
  });
});

describe('isScheduledOn', () => {
  it('respects the start and end dates', () => {
    const habit = makeHabit({ startDate: '2024-05-05', endDate: '2024-05-10' });
    expect(isScheduledOn(habit, '2024-05-04')).toBe(false);
    expect(isScheduledOn(habit, '2024-05-05')).toBe(true);
    expect(isScheduledOn(habit, '2024-05-10')).toBe(true);
    expect(isScheduledOn(habit, '2024-05-11')).toBe(false);
  });

  it('ignores deleted habits', () => {
    const habit = makeHabit({ deletedAt: '2024-05-06T00:00:00.000Z' });
    expect(isScheduledOn(habit, '2024-05-09')).toBe(false);
  });
});

describe('isPausedOn', () => {
  it('detects closed and open paused periods', () => {
    const habit = makeHabit({
      pausedPeriods: [
        { start: '2024-05-05', end: '2024-05-07' },
        { start: '2024-05-20', end: null },
      ],
    });
    expect(isPausedOn(habit, '2024-05-04')).toBe(false);
    expect(isPausedOn(habit, '2024-05-06')).toBe(true);
    expect(isPausedOn(habit, '2024-05-08')).toBe(false);
    expect(isPausedOn(habit, '2024-05-25')).toBe(true); // open period
  });
});
