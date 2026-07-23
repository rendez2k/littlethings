import { describe, expect, it } from 'vitest';
import { buildHeatmap, levelFor } from '@/features/insights/heatmap';
import { makeHabit, makeTargetHabit, makeCompletion } from '../factories';

const TODAY = '2024-05-15'; // Wednesday

describe('levelFor', () => {
  it('maps a boolean completion to full intensity', () => {
    const habit = makeHabit();
    expect(levelFor(makeCompletion(habit.id, TODAY, { state: 'complete', value: 1 }), habit)).toBe(
      4,
    );
    expect(levelFor(undefined, habit)).toBe(0);
  });

  it('buckets a count target by ratio, and treats skipped as none', () => {
    const habit = makeTargetHabit({ type: 'count', amount: 4, unit: 'glasses' });
    const at = (value: number) => makeCompletion(habit.id, TODAY, { state: 'complete', value });
    expect(levelFor(at(1), habit)).toBe(1); // 0.25
    expect(levelFor(at(2), habit)).toBe(2); // 0.5
    expect(levelFor(at(3), habit)).toBe(3); // 0.75
    expect(levelFor(at(4), habit)).toBe(4); // 1.0
    expect(levelFor(makeCompletion(habit.id, TODAY, { state: 'skipped', value: 0 }), habit)).toBe(0);
  });
});

describe('buildHeatmap', () => {
  it('produces a grid of week columns of 7 days ending at today', () => {
    const habit = makeHabit();
    const grid = buildHeatmap(habit, [], TODAY, 4, 1);
    expect(grid).toHaveLength(4);
    expect(grid.every((col) => col.length === 7)).toBe(true);
    // The last column contains today.
    const last = grid[3]!;
    expect(last.some((c) => c.date === TODAY)).toBe(true);
  });

  it('marks completed days with a level and flags future days', () => {
    const habit = makeHabit();
    const grid = buildHeatmap(
      habit,
      [makeCompletion(habit.id, TODAY, { state: 'complete', value: 1 })],
      TODAY,
      2,
      1,
    );
    const cells = grid.flat();
    expect(cells.find((c) => c.date === TODAY)?.level).toBe(4);
    // Days after today (in the current week) are marked future with level 0.
    const future = cells.filter((c) => c.date > TODAY);
    expect(future.length).toBeGreaterThan(0);
    expect(future.every((c) => c.future && c.level === 0)).toBe(true);
  });
});
