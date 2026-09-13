import { describe, expect, it } from 'vitest';
import { groupCompletionsByDate, monthGrid, shiftMonth, summariseDays } from './month';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';

function habit(over: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Water',
    notes: undefined,
    icon: 'droplet',
    color: 'sky',
    schedule: { type: 'daily' },
    target: { type: 'boolean' },
    reminder: { enabled: false, time: '09:00' },
    startDate: '2026-01-01',
    endDate: null,
    status: 'active',
    pausedPeriods: [],
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...over,
  } as Habit;
}

function completion(over: Partial<Completion> = {}): Completion {
  return {
    id: 'c1',
    habitId: 'h1',
    date: '2026-09-10',
    value: 1,
    state: 'complete',
    note: undefined,
    createdAt: '2026-09-10T00:00:00.000Z',
    updatedAt: '2026-09-10T00:00:00.000Z',
    deletedAt: null,
    ...over,
  } as Completion;
}

describe('shiftMonth', () => {
  it('moves forwards and backwards across a year boundary', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-09', 0)).toBe('2026-09');
  });
});

describe('monthGrid', () => {
  it('pads to full weeks aligned to a Monday start', () => {
    // September 2026 starts on a Tuesday and ends on a Wednesday.
    const weeks = monthGrid('2026-09', 1);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]![0]).toEqual({ date: '2026-08-31', inMonth: false });
    expect(weeks[0]![1]).toEqual({ date: '2026-09-01', inMonth: true });
    expect(weeks[4]![2]).toEqual({ date: '2026-09-30', inMonth: true });
    expect(weeks[4]![6]).toEqual({ date: '2026-10-04', inMonth: false });
    for (const week of weeks) expect(week).toHaveLength(7);
  });

  it('aligns to a Sunday start', () => {
    const weeks = monthGrid('2026-09', 0);
    expect(weeks[0]![0]).toEqual({ date: '2026-08-30', inMonth: false });
    expect(weeks[0]![2]).toEqual({ date: '2026-09-01', inMonth: true });
  });

  it('needs six rows for a month that spans them', () => {
    // August 2026 starts on a Saturday and has 31 days → six Monday-start rows.
    expect(monthGrid('2026-08', 1)).toHaveLength(6);
  });
});

describe('summariseDays', () => {
  it('rolls up done vs scheduled per day and drops tombstones', () => {
    const h = habit();
    const byDate = groupCompletionsByDate([
      completion({ date: '2026-09-10' }),
      completion({ id: 'c2', date: '2026-09-11', deletedAt: '2026-09-11T00:00:00.000Z' }),
    ]);
    const days = summariseDays(
      ['2026-09-10', '2026-09-11', '2026-09-20'],
      [h],
      byDate,
      '2026-09-13',
      new Set(),
    );
    expect(days.get('2026-09-10')).toMatchObject({ done: 1, total: 1 });
    expect(days.get('2026-09-11')).toMatchObject({ done: 0, total: 1 });
    expect(days.get('2026-09-11')!.entries[0]!.status).toBe('missed');
    // A future day is scheduled but never "missed".
    expect(days.get('2026-09-20')!.entries[0]!.status).toBe('future');
  });

  it('shows a one-off only on the day it was done, or waiting on today', () => {
    const once = habit({ id: 'o1', schedule: { type: 'once' }, startDate: '2026-09-01' });
    const days = summariseDays(
      ['2026-09-05', '2026-09-13'],
      [once],
      groupCompletionsByDate([completion({ habitId: 'o1', date: '2026-09-05' })]),
      '2026-09-13',
      new Set(['o1']),
    );
    expect(days.get('2026-09-05')).toMatchObject({ done: 1, total: 1 });
    expect(days.get('2026-09-13')).toMatchObject({ total: 0 });
  });
});
