import { describe, expect, it } from 'vitest';
import { computeStreak } from '@/features/streaks/streak';
import type { Completion } from '@/features/completions/schemas';
import { enumerateDays, type DateKey } from '@/lib/dates';
import { makeScheduledHabit, makeCompletion } from '../factories';

/** Build `complete` records for a list of dates. */
function completed(habitId: string, dates: DateKey[]): Completion[] {
  return dates.map((d) => makeCompletion(habitId, d, { state: 'complete', value: 1 }));
}

describe('computeStreak — daily', () => {
  const habit = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-01' });
  const TODAY = '2024-05-15';

  it('counts a full run, with today pending treated as neutral', () => {
    const recs = completed(habit.id, enumerateDays('2024-05-01', '2024-05-14'));
    const result = computeStreak(habit, recs, TODAY);
    expect(result).toEqual({ current: 14, best: 14, unit: 'day' });
  });

  it("includes today once it's completed", () => {
    const recs = completed(habit.id, enumerateDays('2024-05-01', '2024-05-15'));
    expect(computeStreak(habit, recs, TODAY).current).toBe(15);
  });

  it('breaks the current streak on a missed past day', () => {
    const recs = completed(habit.id, [
      ...enumerateDays('2024-05-01', '2024-05-09'),
      ...enumerateDays('2024-05-11', '2024-05-15'), // 05-10 missed
    ]);
    const result = computeStreak(habit, recs, TODAY);
    expect(result.current).toBe(5); // 11,12,13,14,15
    expect(result.best).toBe(9); // 01..09
  });
});

describe('computeStreak — neutral bridges', () => {
  const TODAY = '2024-05-15';

  it('a skipped day bridges the streak', () => {
    const habit = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-01' });
    const recs = [
      ...completed(habit.id, enumerateDays('2024-05-01', '2024-05-09')),
      makeCompletion(habit.id, '2024-05-10', { state: 'skipped', value: 0 }),
      ...completed(habit.id, enumerateDays('2024-05-11', '2024-05-14')),
    ];
    const result = computeStreak(habit, recs, TODAY);
    expect(result.current).toBe(13); // skip does not break, does not inflate
    expect(result.best).toBe(13);
  });

  it('a paused span bridges the streak', () => {
    const habit = makeScheduledHabit(
      { type: 'daily' },
      { startDate: '2024-05-01', pausedPeriods: [{ start: '2024-05-08', end: '2024-05-10' }] },
    );
    const recs = [
      ...completed(habit.id, enumerateDays('2024-05-01', '2024-05-07')),
      ...completed(habit.id, enumerateDays('2024-05-11', '2024-05-14')),
    ];
    const result = computeStreak(habit, recs, TODAY);
    expect(result.current).toBe(11); // 7 + 4, pause bridges
  });
});

describe('computeStreak — every N days', () => {
  it('counts only scheduled days', () => {
    const habit = makeScheduledHabit(
      { type: 'every_n_days', intervalDays: 2 },
      { startDate: '2024-05-01' },
    );
    const TODAY = '2024-05-15';
    // Scheduled: 01,03,05,07,09,11,13,15. Miss 07.
    const recs = completed(habit.id, [
      '2024-05-01',
      '2024-05-03',
      '2024-05-05',
      '2024-05-09',
      '2024-05-11',
      '2024-05-13',
      '2024-05-15',
    ]);
    const result = computeStreak(habit, recs, TODAY);
    expect(result.current).toBe(4); // 09,11,13,15
    expect(result.best).toBe(4);
  });
});

describe('computeStreak — times per week', () => {
  const habit = makeScheduledHabit(
    { type: 'times_per_week', timesPerWeek: 3 },
    { startDate: '2024-05-01' },
  );
  const TODAY = '2024-05-15'; // Wednesday, Monday week-start

  it('counts successful weeks; current week is neutral until met', () => {
    const recs = completed(habit.id, [
      '2024-05-01',
      '2024-05-02',
      '2024-05-03', // week of 04-29: 3 ✓
      '2024-05-06',
      '2024-05-07',
      '2024-05-08', // week of 05-06: 3 ✓
      '2024-05-13',
      '2024-05-14', // week of 05-13 (current): 2, not yet
    ]);
    const result = computeStreak(habit, recs, TODAY, 1);
    expect(result).toEqual({ current: 2, best: 2, unit: 'week' });
  });

  it('counts the current week once its target is reached', () => {
    const recs = completed(habit.id, [
      '2024-05-01',
      '2024-05-02',
      '2024-05-03',
      '2024-05-06',
      '2024-05-07',
      '2024-05-08',
      '2024-05-13',
      '2024-05-14',
      '2024-05-15', // current week now 3 ✓
    ]);
    expect(computeStreak(habit, recs, TODAY, 1).current).toBe(3);
  });

  it('breaks when a past week misses its target', () => {
    const recs = completed(habit.id, [
      '2024-05-01',
      '2024-05-02',
      '2024-05-03', // week ✓
      '2024-05-06', // only 1 this week ✗
      '2024-05-13',
      '2024-05-14', // current week in progress
    ]);
    const result = computeStreak(habit, recs, TODAY, 1);
    expect(result.current).toBe(0);
    expect(result.best).toBe(1);
  });
});

describe('computeStreak — times per month', () => {
  it('counts successful months', () => {
    const habit = makeScheduledHabit(
      { type: 'times_per_month', timesPerMonth: 8 },
      { startDate: '2024-04-10' },
    );
    const TODAY = '2024-05-15';
    const recs = completed(habit.id, [
      ...enumerateDays('2024-04-10', '2024-04-17'), // 8 in April ✓
      '2024-05-01',
      '2024-05-02',
      '2024-05-03', // May in progress
    ]);
    const result = computeStreak(habit, recs, TODAY);
    expect(result).toEqual({ current: 1, best: 1, unit: 'month' });
  });
});

describe('computeStreak — recalculation & DST', () => {
  it('recalculates when history changes', () => {
    const habit = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-01' });
    const TODAY = '2024-05-15';
    const base = completed(habit.id, [
      ...enumerateDays('2024-05-01', '2024-05-09'),
      ...enumerateDays('2024-05-11', '2024-05-15'),
    ]);
    expect(computeStreak(habit, base, TODAY).current).toBe(5);
    // Correct the missed 05-10 → the streak heals.
    const fixed = [...base, makeCompletion(habit.id, '2024-05-10', { value: 1 })];
    expect(computeStreak(habit, fixed, TODAY).current).toBe(15);
  });

  it('counts correctly across a daylight-saving boundary', () => {
    const habit = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-03-08' });
    const TODAY = '2024-03-12'; // spans US spring-forward on 03-10
    const recs = completed(habit.id, enumerateDays('2024-03-08', '2024-03-12'));
    expect(computeStreak(habit, recs, TODAY).current).toBe(5);
  });
});
