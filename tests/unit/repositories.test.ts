import { describe, expect, it } from 'vitest';
import { createHabitRepository } from '@/features/habits/repository';
import { createCompletionRepository } from '@/features/completions/repository';
import { createSettingsRepository } from '@/features/settings/repository';
import { DEFAULT_APP_SETTINGS } from '@/features/settings/schemas';
import { makeTestDb, makeHabit, makeCompletion } from '../factories';

describe('HabitRepository', () => {
  it('orders by sortOrder and separates archived / deleted', async () => {
    const repo = createHabitRepository(makeTestDb());
    await repo.put(makeHabit({ id: crypto.randomUUID(), name: 'B', sortOrder: 2 }));
    await repo.put(makeHabit({ id: crypto.randomUUID(), name: 'A', sortOrder: 1 }));
    await repo.put(
      makeHabit({ id: crypto.randomUUID(), name: 'Z', status: 'archived', sortOrder: 0 }),
    );
    await repo.put(
      makeHabit({ id: crypto.randomUUID(), name: 'gone', deletedAt: '2024-05-11T00:00:00.000Z' }),
    );

    const active = await repo.getActive();
    expect(active.map((h) => h.name)).toEqual(['A', 'B']);
    expect((await repo.getArchived()).map((h) => h.name)).toEqual(['Z']);
    expect((await repo.getAll()).map((h) => h.name)).toEqual(['Z', 'A', 'B']);
  });

  it('hides deleted habits from getById', async () => {
    const repo = createHabitRepository(makeTestDb());
    const habit = makeHabit({ deletedAt: '2024-05-11T00:00:00.000Z' });
    await repo.put(habit);
    expect(await repo.getById(habit.id)).toBeUndefined();
  });
});

describe('CompletionRepository', () => {
  it('queries by habit, date and range and can find soft-deleted rows', async () => {
    const repo = createCompletionRepository(makeTestDb());
    const habitId = crypto.randomUUID();
    await repo.put(makeCompletion(habitId, '2024-05-10'));
    await repo.put(makeCompletion(habitId, '2024-05-12'));
    await repo.put(
      makeCompletion(habitId, '2024-05-14', { deletedAt: '2024-05-15T00:00:00.000Z' }),
    );

    expect((await repo.getByHabit(habitId)).map((c) => c.date)).toEqual([
      '2024-05-10',
      '2024-05-12',
    ]);
    expect(await repo.getByHabitAndDate(habitId, '2024-05-14')).toBeUndefined();
    expect(await repo.findRaw(habitId, '2024-05-14')).toBeDefined();
    expect(
      (await repo.getByHabitInRange(habitId, '2024-05-11', '2024-05-13')).map((c) => c.date),
    ).toEqual(['2024-05-12']);
    expect((await repo.getByDate('2024-05-10')).length).toBe(1);
  });
});

describe('SettingsRepository', () => {
  it('returns defaults, updates and resets', async () => {
    const repo = createSettingsRepository(makeTestDb());
    expect(await repo.get()).toEqual(DEFAULT_APP_SETTINGS);

    const updated = await repo.update({ showStreaks: false, weekStartsOn: 0 });
    expect(updated.showStreaks).toBe(false);
    expect(updated.weekStartsOn).toBe(0);
    expect((await repo.get()).showStreaks).toBe(false);

    const reset = await repo.reset();
    expect(reset).toEqual(DEFAULT_APP_SETTINGS);
  });
});
