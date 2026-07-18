import { describe, expect, it } from 'vitest';
import { computeHabitStats } from '@/features/completions/stats';
import { enumerateDays } from '@/lib/dates';
import { makeScheduledHabit, makeCompletion } from '../factories';

describe('computeHabitStats', () => {
  const habit = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-01' });
  const TODAY = '2024-05-15';

  it('computes completion rate over resolved days (excludes today-pending)', () => {
    // Complete 01–10, miss 11–14, today 15 not done yet.
    const recs = enumerateDays('2024-05-01', '2024-05-10').map((d) =>
      makeCompletion(habit.id, d, { value: 1 }),
    );
    const stats = computeHabitStats(habit, recs, TODAY);
    expect(stats.opportunities).toBe(14); // 01–14 resolved; 15 pending excluded
    expect(stats.totalCompletions).toBe(10);
    expect(stats.completionRate).toBeCloseTo(10 / 14, 5);
    expect(stats.best).toBe(10);
    expect(stats.current).toBe(0); // broke on the 11th
  });

  it('reports zero opportunities before any resolved day', () => {
    const future = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-15' });
    const stats = computeHabitStats(future, [], TODAY);
    expect(stats.opportunities).toBe(0);
    expect(stats.completionRate).toBe(0);
  });

  it('excludes skipped days from the rate', () => {
    const recs = [
      ...enumerateDays('2024-05-01', '2024-05-05').map((d) =>
        makeCompletion(habit.id, d, { value: 1 }),
      ),
      makeCompletion(habit.id, '2024-05-06', { state: 'skipped', value: 0 }),
    ];
    // Days 01–05 complete, 06 skipped, 07–14 missed, 15 pending.
    const stats = computeHabitStats(habit, recs, TODAY);
    expect(stats.opportunities).toBe(13); // 14 resolved days minus the skipped one
    expect(stats.totalCompletions).toBe(5);
  });
});
