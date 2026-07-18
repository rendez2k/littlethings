import { describe, expect, it } from 'vitest';
import { joinSeries, scheduleLabel, targetLabel } from '@/features/habits/labels';

describe('scheduleLabel', () => {
  it('describes each schedule type in plain language', () => {
    expect(scheduleLabel({ type: 'daily' })).toBe('Every day');
    expect(scheduleLabel({ type: 'weekdays', weekdays: [1, 2, 3, 4, 5] })).toBe('Weekdays');
    expect(scheduleLabel({ type: 'weekdays', weekdays: [0, 6] })).toBe('Weekends');
    expect(scheduleLabel({ type: 'weekdays', weekdays: [1, 3, 5] })).toBe(
      'Mondays, Wednesdays and Fridays',
    );
    expect(scheduleLabel({ type: 'times_per_week', timesPerWeek: 3 })).toBe('Three times per week');
    expect(scheduleLabel({ type: 'times_per_week', timesPerWeek: 1 })).toBe('Once per week');
    expect(scheduleLabel({ type: 'times_per_month', timesPerMonth: 2 })).toBe('Twice per month');
    expect(scheduleLabel({ type: 'every_n_days', intervalDays: 2 })).toBe('Every other day');
    expect(scheduleLabel({ type: 'every_n_days', intervalDays: 3 })).toBe('Every three days');
    expect(scheduleLabel({ type: 'once' })).toBe('One-off');
  });
});

describe('targetLabel', () => {
  it('formats count and duration, and omits boolean', () => {
    expect(targetLabel({ type: 'boolean' })).toBeNull();
    expect(targetLabel({ type: 'count', amount: 8, unit: 'glasses' })).toBe('8 glasses');
    expect(targetLabel({ type: 'duration', amount: 30, unit: 'minutes' })).toBe('30 min');
  });
});

describe('joinSeries', () => {
  it('joins with commas and a trailing "and"', () => {
    expect(joinSeries(['A'])).toBe('A');
    expect(joinSeries(['A', 'B'])).toBe('A and B');
    expect(joinSeries(['A', 'B', 'C'])).toBe('A, B and C');
  });
});
