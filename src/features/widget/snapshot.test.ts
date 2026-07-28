import { describe, expect, it } from 'vitest';
import type { DayView } from '@/features/completions/day-view';
import type { Habit } from '@/features/habits/schemas';
import { buildWidgetSnapshot } from './snapshot';

const ACCENT = { light: '#6355c9', dark: '#b7adfb' };

function habit(id: string, name: string, color = 'lavender'): Habit {
  // Only the fields the snapshot reads matter here.
  return { id, name, icon: 'droplet', color, target: { type: 'boolean' } } as unknown as Habit;
}

const view: DayView = {
  summary: { completed: 1, skipped: 0, total: 2, ratio: 0.5 },
  entries: [
    { habit: habit('a', 'Water'), completion: undefined, status: 'complete' },
    { habit: habit('b', 'Read'), completion: undefined, status: 'pending' },
  ],
};

describe('buildWidgetSnapshot', () => {
  it('carries the summary and accent through', () => {
    const s = buildWidgetSnapshot(view, '2026-07-23', '2026-07-23T20:00:00.000Z', ACCENT);
    expect(s.schema).toBe(2);
    expect(s.date).toBe('2026-07-23');
    expect(s.completed).toBe(1);
    expect(s.total).toBe(2);
    expect(s.ratio).toBe(0.5);
    expect(s.accent).toEqual(ACCENT);
    expect(s.updatedAt).toBe('2026-07-23T20:00:00.000Z');
  });

  it('maps each entry with colour hex and progress ratio', () => {
    const s = buildWidgetSnapshot(view, '2026-07-23', 'now', ACCENT);
    expect(s.habits).toHaveLength(2);
    expect(s.habits[0]).toMatchObject({
      id: 'a',
      name: 'Water',
      done: true,
      partial: false,
      ratio: 1,
      colorHex: { light: '#6355c9', dark: '#b7adfb' },
    });
    expect(s.habits[1]).toMatchObject({ id: 'b', name: 'Read', done: false, ratio: 0 });
  });

  it('reports a partial progress ratio from the completion value', () => {
    const countHabit = {
      id: 'c',
      name: 'Water',
      icon: 'droplet',
      color: 'sky',
      target: { type: 'count', amount: 4, unit: 'glasses' },
    } as unknown as Habit;
    const partialView: DayView = {
      summary: { completed: 0, skipped: 0, total: 1, ratio: 0 },
      entries: [{ habit: countHabit, completion: { value: 3 } as never, status: 'partial' }],
    };
    const s = buildWidgetSnapshot(partialView, '2026-07-23', 'now', ACCENT);
    const h = s.habits[0]!;
    expect(h.partial).toBe(true);
    expect(h.ratio).toBe(0.75);
    expect(h.colorHex).toEqual({ light: '#2a72c4', dark: '#7cb8f2' });
  });

  it('falls back to a default colour for an unknown key', () => {
    const oddView: DayView = {
      summary: { completed: 0, skipped: 0, total: 1, ratio: 0 },
      entries: [{ habit: habit('d', 'X', 'not-a-colour'), completion: undefined, status: 'pending' }],
    };
    const s = buildWidgetSnapshot(oddView, '2026-07-23', 'now', ACCENT);
    expect(s.habits[0]!.colorHex).toEqual({ light: '#6355c9', dark: '#b7adfb' });
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
    expect(buildWidgetSnapshot(many, '2026-07-23', 'now', ACCENT).habits).toHaveLength(8);
  });
});
