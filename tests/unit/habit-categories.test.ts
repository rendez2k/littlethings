import { describe, expect, it } from 'vitest';
import { groupHabits, habitCategory } from '@/features/habits/categories';
import { makeScheduledHabit, makeTargetHabit } from '../factories';

describe('habitCategory', () => {
  it('buckets a count target of 2+ as "multiple times a day", over the schedule', () => {
    const water = makeTargetHabit(
      { type: 'count', amount: 6, unit: 'glasses' },
      { schedule: { type: 'daily' } },
    );
    expect(habitCategory(water)).toBe('multipleDaily');
  });

  it('treats a count of 1 as a normal daily habit, not multiple', () => {
    const once = makeTargetHabit(
      { type: 'count', amount: 1, unit: 'time' },
      { schedule: { type: 'daily' } },
    );
    expect(habitCategory(once)).toBe('daily');
  });

  it('buckets a plain daily schedule as "daily"', () => {
    expect(habitCategory(makeScheduledHabit({ type: 'daily' }))).toBe('daily');
    // Duration daily still counts as daily.
    const meditate = makeTargetHabit(
      { type: 'duration', amount: 20, unit: 'minutes' },
      { schedule: { type: 'daily' } },
    );
    expect(habitCategory(meditate)).toBe('daily');
  });

  it('buckets every non-daily cadence as "weekly"', () => {
    expect(habitCategory(makeScheduledHabit({ type: 'weekdays', weekdays: [1, 3, 5] }))).toBe(
      'weekly',
    );
    expect(habitCategory(makeScheduledHabit({ type: 'times_per_week', timesPerWeek: 3 }))).toBe(
      'weekly',
    );
    expect(habitCategory(makeScheduledHabit({ type: 'every_n_days', intervalDays: 2 }))).toBe(
      'weekly',
    );
    expect(habitCategory(makeScheduledHabit({ type: 'once' }))).toBe('weekly');
  });
});

describe('groupHabits', () => {
  it('groups in display order and drops empty groups', () => {
    const weekly = makeScheduledHabit({ type: 'times_per_week', timesPerWeek: 3 });
    const daily = makeScheduledHabit({ type: 'daily' });
    const multi = makeTargetHabit(
      { type: 'count', amount: 6, unit: 'glasses' },
      { schedule: { type: 'daily' } },
    );

    const groups = groupHabits([weekly, daily, multi]);
    expect(groups.map((g) => g.key)).toEqual(['multipleDaily', 'daily', 'weekly']);
    expect(groups.every((g) => g.habits.length === 1)).toBe(true);

    // Only daily present → single group.
    const single = groupHabits([daily]);
    expect(single.map((g) => g.key)).toEqual(['daily']);
  });
});
