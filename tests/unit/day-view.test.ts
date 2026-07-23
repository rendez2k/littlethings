import { describe, expect, it } from 'vitest';
import { buildDayView } from '@/features/completions/day-view';
import { makeHabit, makeCompletion } from '../factories';

const TODAY = '2024-05-15'; // Wednesday

describe('buildDayView', () => {
  it('includes only scheduled, active, non-paused habits and derives status', () => {
    const a = makeHabit({ startDate: '2024-05-01', sortOrder: 0 });
    const b = makeHabit({ startDate: '2024-05-01', sortOrder: 1 });
    const weekdayOnly = makeHabit({
      startDate: '2024-05-01',
      schedule: { type: 'weekdays', weekdays: [1] }, // Mondays only
    });
    const archived = makeHabit({ startDate: '2024-05-01', status: 'archived' });

    const view = buildDayView(
      [a, b, weekdayOnly, archived],
      [makeCompletion(a.id, TODAY, { state: 'complete', value: 1 })],
      TODAY,
      TODAY,
    );

    expect(view.entries.map((e) => e.habit.id)).toEqual([a.id, b.id]);
    expect(view.entries[0]!.status).toBe('complete');
    expect(view.entries[1]!.status).toBe('pending');
    expect(view.summary).toMatchObject({ completed: 1, total: 2 });
    expect(view.summary.ratio).toBe(0.5);
  });

  it('counts skipped days toward the day ratio', () => {
    const a = makeHabit({ startDate: '2024-05-01' });
    const b = makeHabit({ startDate: '2024-05-01' });
    const view = buildDayView(
      [a, b],
      [makeCompletion(a.id, TODAY, { state: 'skipped', value: 0 })],
      TODAY,
      TODAY,
    );
    expect(view.summary.skipped).toBe(1);
    expect(view.summary.ratio).toBe(0.5);
  });

  it('is empty when nothing is scheduled', () => {
    const weekdayOnly = makeHabit({
      startDate: '2024-05-01',
      schedule: { type: 'weekdays', weekdays: [1] },
    });
    const view = buildDayView([weekdayOnly], [], TODAY, TODAY);
    expect(view.entries).toHaveLength(0);
    expect(view.summary.ratio).toBe(0);
  });

  describe('one-off carry-over', () => {
    const oneOff = makeHabit({ startDate: '2024-05-10', schedule: { type: 'once' } });

    it('keeps an unfinished one-off on today, even after its start date', () => {
      const view = buildDayView([oneOff], [], TODAY, TODAY, new Set());
      expect(view.entries.map((e) => e.habit.id)).toEqual([oneOff.id]);
      expect(view.entries[0]!.status).toBe('pending');
    });

    it('shows a one-off completed today as complete', () => {
      const completion = makeCompletion(oneOff.id, TODAY, { state: 'complete', value: 1 });
      const view = buildDayView([oneOff], [completion], TODAY, TODAY, new Set([oneOff.id]));
      expect(view.entries).toHaveLength(1);
      expect(view.entries[0]!.status).toBe('complete');
    });

    it('drops a one-off finished on an earlier day', () => {
      // Completed before (in everCompletedHabitIds) but no completion for today.
      const view = buildDayView([oneOff], [], TODAY, TODAY, new Set([oneOff.id]));
      expect(view.entries).toHaveLength(0);
    });

    it('does not carry one-offs onto past days (only today)', () => {
      const past = '2024-05-12';
      const view = buildDayView([oneOff], [], past, TODAY, new Set());
      expect(view.entries).toHaveLength(0);
    });
  });
});
