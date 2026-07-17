import { describe, expect, it } from 'vitest';
import { deriveDayStatus, isSatisfied, targetProgress } from '@/features/completions/logic';
import { makeHabit, makeCompletion, makeTargetHabit } from '../factories';

const TODAY = '2024-05-15';

describe('isSatisfied', () => {
  it('handles boolean, count and duration targets', () => {
    expect(isSatisfied({ type: 'boolean' }, 1)).toBe(true);
    expect(isSatisfied({ type: 'boolean' }, 0)).toBe(false);
    expect(isSatisfied({ type: 'count', amount: 8, unit: 'glasses' }, 8)).toBe(true);
    expect(isSatisfied({ type: 'count', amount: 8, unit: 'glasses' }, 7)).toBe(false);
    expect(isSatisfied({ type: 'duration', amount: 30, unit: 'minutes' }, 45)).toBe(true);
  });
});

describe('targetProgress', () => {
  it('reports a clamped ratio', () => {
    expect(targetProgress({ type: 'count', amount: 8, unit: 'glasses' }, 4).ratio).toBe(0.5);
    expect(targetProgress({ type: 'count', amount: 8, unit: 'glasses' }, 20).ratio).toBe(1);
  });
});

describe('deriveDayStatus', () => {
  const habit = makeHabit({ startDate: '2024-05-01' });

  it('marks future dates as future, never missed', () => {
    expect(deriveDayStatus(habit, undefined, '2024-05-20', TODAY)).toBe('future');
  });

  it('marks a past scheduled day with no record as missed', () => {
    expect(deriveDayStatus(habit, undefined, '2024-05-10', TODAY)).toBe('missed');
  });

  it('marks today with no record as pending, not missed', () => {
    expect(deriveDayStatus(habit, undefined, TODAY, TODAY)).toBe('pending');
  });

  it('marks a completed day complete and a skipped day skipped', () => {
    const done = makeCompletion(habit.id, '2024-05-10', { state: 'complete', value: 1 });
    const skip = makeCompletion(habit.id, '2024-05-10', { state: 'skipped', value: 0 });
    expect(deriveDayStatus(habit, done, '2024-05-10', TODAY)).toBe('complete');
    expect(deriveDayStatus(habit, skip, '2024-05-10', TODAY)).toBe('skipped');
  });

  it('treats an unmet count as partial', () => {
    const counted = makeTargetHabit(
      { type: 'count', amount: 8, unit: 'glasses' },
      { startDate: '2024-05-01' },
    );
    const rec = makeCompletion(counted.id, '2024-05-10', { state: 'complete', value: 3 });
    expect(deriveDayStatus(counted, rec, '2024-05-10', TODAY)).toBe('partial');
  });

  it('reports not_scheduled and paused correctly', () => {
    const weekdays = makeHabit({
      startDate: '2024-05-01',
      schedule: { type: 'weekdays', weekdays: [1, 3, 5] },
    });
    expect(deriveDayStatus(weekdays, undefined, '2024-05-14', TODAY)).toBe('not_scheduled'); // Tue
    const paused = makeHabit({
      startDate: '2024-05-01',
      pausedPeriods: [{ start: '2024-05-08', end: '2024-05-12' }],
    });
    expect(deriveDayStatus(paused, undefined, '2024-05-10', TODAY)).toBe('paused');
  });

  it('ignores a soft-deleted completion record', () => {
    const deleted = makeCompletion(habit.id, '2024-05-10', {
      state: 'complete',
      value: 1,
      deletedAt: '2024-05-11T00:00:00.000Z',
    });
    expect(deriveDayStatus(habit, deleted, '2024-05-10', TODAY)).toBe('missed');
  });
});
