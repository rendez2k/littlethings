import { describe, expect, it } from 'vitest';
import type { DayView } from '@/features/completions/day-view';
import type { Habit } from '@/features/habits/schemas';
import { buildWidgetSnapshot } from './snapshot';

function habit(id: string, name: string): Habit {
  // Only the fields the snapshot reads matter here.
  return { id, name, icon: 'droplet', color: 'blue' } as unknown as Habit;
}

const view: DayView = {
  summary: { completed: 1, skipped: 0, total: 2, ratio: 0.5 },
  entries: [
    { habit: habit('a', 'Water'), completion: undefined, status: 'complete' },
    { habit: habit('b', 'Read'), completion: undefined, status: 'pending' },
  ],
};

describe('buildWidgetSnapshot', () => {
  it('carries the summary through verbatim', () => {
    const s = buildWidgetSnapshot(view, '2026-07-23', '2026-07-23T20:00:00.000Z');
    expect(s.schema).toBe(1);
    expect(s.date).toBe('2026-07-23');
    expect(s.completed).toBe(1);
    expect(s.total).toBe(2);
    expect(s.ratio).toBe(0.5);
    expect(s.updatedAt).toBe('2026-07-23T20:00:00.000Z');
  });

  it('maps each entry, marking only "complete" as done', () => {
    const s = buildWidgetSnapshot(view, '2026-07-23', 'now');
    expect(s.habits).toHaveLength(2);
    expect(s.habits[0]).toMatchObject({ id: 'a', name: 'Water', done: true, partial: false });
    expect(s.habits[1]).toMatchObject({ id: 'b', name: 'Read', done: false, partial: false });
  });

  it('caps the habit list for a compact widget', () => {
    const many: DayView = {
      summary: { completed: 0, skipped: 0, total: 12, ratio: 0 },
      entries: Array.from({ length: 12 }, (_, i) => ({
        habit: habit(String(i), `H${i}`),
        completion: undefined,
        status: 'pending' as const,
      })),
    };
    expect(buildWidgetSnapshot(many, '2026-07-23', 'now').habits).toHaveLength(8);
  });
});
