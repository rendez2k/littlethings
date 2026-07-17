import { describe, expect, it } from 'vitest';
import { createDataService } from '@/features/data/service';
import { createHabitRepository } from '@/features/habits/repository';
import { createCompletionRepository } from '@/features/completions/repository';
import { createGoalRepository } from '@/features/goals/repository';
import { createGoalService } from '@/features/goals/service';
import { DEFAULT_APPEARANCE, type AppearanceSettings } from '@/features/settings/appearance';
import { makeTestDb, makeHabit, makeCompletion } from '../factories';

function serviceFor(db = makeTestDb()) {
  let appearance: AppearanceSettings = { ...DEFAULT_APPEARANCE };
  const data = createDataService({
    db,
    getAppearance: () => appearance,
    setAppearance: (a) => {
      appearance = a;
    },
  });
  return { db, data, getAppearance: () => appearance };
}

async function seed(db: ReturnType<typeof makeTestDb>) {
  const habit = makeHabit();
  await createHabitRepository(db).put(habit);
  await createCompletionRepository(db).put(makeCompletion(habit.id, '2024-05-10'));
  await createGoalService(createGoalRepository(db)).create({ title: 'Visit Japan' });
  return habit;
}

describe('DataService export/import', () => {
  it('exports a versioned bundle and round-trips through parse', async () => {
    const { db, data } = serviceFor();
    await seed(db);
    const json = await data.exportJson();
    const bundle = data.parse(json);
    expect(bundle.app).toBe('little-things');
    expect(bundle.habits).toHaveLength(1);
    expect(bundle.completions).toHaveLength(1);
    expect(bundle.goals).toHaveLength(1);
  });

  it('rejects malformed or foreign files', () => {
    const { data } = serviceFor();
    expect(() => data.parse('not json')).toThrow(/valid JSON/);
    expect(() => data.parse(JSON.stringify({ hello: 'world' }))).toThrow(/Little Things backup/);
  });

  it('imports into a fresh database and reports counts', async () => {
    const source = serviceFor();
    await seed(source.db);
    const json = await source.data.exportJson();

    const target = serviceFor();
    const bundle = target.data.parse(json);
    const { counts } = await target.data.importBundle(bundle, 'merge');

    expect(counts).toEqual({ habits: 1, completions: 1, goals: 1 });
    expect(await createHabitRepository(target.db).getAll()).toHaveLength(1);
    expect(await createGoalRepository(target.db).getAll()).toHaveLength(1);
  });

  it('replace mode clears existing data first and backs it up', async () => {
    const { db, data } = serviceFor();
    const original = await seed(db);

    // A different dataset to import.
    const other = serviceFor();
    await createHabitRepository(other.db).put(makeHabit({ name: 'Only me' }));
    const incoming = data.parse(await other.data.exportJson());

    const { backup, counts } = await data.importBundle(incoming, 'replace');
    expect(counts.habits).toBe(1);

    const habits = await createHabitRepository(db).getAll();
    expect(habits).toHaveLength(1);
    expect(habits[0]!.name).toBe('Only me'); // original replaced
    // The backup still references the original habit.
    expect(backup).toContain(original.id);
  });

  it('clears history but keeps habits', async () => {
    const { db, data } = serviceFor();
    await seed(db);
    const removed = await data.clearHistory();
    expect(removed).toBe(1);
    expect(await createCompletionRepository(db).getAll()).toHaveLength(0);
    expect(await createHabitRepository(db).getAll()).toHaveLength(1);
  });
});
