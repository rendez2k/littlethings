import { describe, expect, it } from 'vitest';
import { computeInsights } from '@/features/insights/insights';
import { makeScheduledHabit, makeCompletion } from '../factories';

describe('computeInsights (week range)', () => {
  // Monday-start week; today is Wednesday 2024-05-15.
  const TODAY = '2024-05-15';
  const a = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-13' });
  const b = makeScheduledHabit({ type: 'daily' }, { startDate: '2024-05-13' });

  const completions = [
    makeCompletion(a.id, '2024-05-13', { value: 1 }),
    makeCompletion(a.id, '2024-05-14', { value: 1 }),
    makeCompletion(a.id, '2024-05-15', { value: 1 }),
    makeCompletion(b.id, '2024-05-13', { value: 1 }),
  ];

  const insights = computeInsights([a, b], completions, 'week', TODAY, 1);

  // Habit A is completed 13–15; habit B only on the 13th (14 missed, 15 pending).
  it('aggregates opportunities, completions and rate over elapsed days', () => {
    // Today's not-yet-done habit (B on the 15th) is neutral, not counted.
    expect(insights.opportunities).toBe(5);
    expect(insights.completed).toBe(4);
    expect(insights.completionRate).toBeCloseTo(4 / 5, 5);
    expect(insights.totalCompletions).toBe(4);
  });

  it('counts perfect days (all scheduled habits done)', () => {
    expect(insights.perfectDays).toBe(1); // only the 13th
  });

  it('builds a 7-point weekly trend with null for future days', () => {
    expect(insights.trend).toHaveLength(7);
    expect(insights.trend[0]!.ratio).toBe(1); // Mon
    expect(insights.trend[1]!.ratio).toBeCloseTo(0.5, 5); // Tue
    expect(insights.trend[2]!.ratio).toBe(1); // Wed (A done, B pending → 1/1)
    expect(insights.trend[3]!.ratio).toBeNull(); // Thu (future)
  });

  it('ranks habit performance and finds the most consistent day', () => {
    expect(insights.habitPerformance[0]!.habitId).toBe(a.id);
    expect(insights.habitPerformance[0]!.rate).toBe(1);
    expect(insights.habitPerformance[1]!.rate).toBeCloseTo(0.5, 5);
    expect(insights.mostConsistentDay).toBe(1); // Monday
  });

  it('reports the best current and all-time streak across habits', () => {
    expect(insights.currentStreak).toBe(3);
    expect(insights.bestStreak).toBe(3);
  });

  it('handles no habits gracefully', () => {
    const empty = computeInsights([], [], 'week', TODAY, 1);
    expect(empty.opportunities).toBe(0);
    expect(empty.completionRate).toBe(0);
    expect(empty.mostConsistentDay).toBeNull();
  });
});
