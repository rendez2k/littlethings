import { describe, expect, it } from 'vitest';
import { createGoalRepository } from '@/features/goals/repository';
import { createGoalService } from '@/features/goals/service';
import { makeTestDb } from '../factories';

function setup() {
  const repo = createGoalRepository(makeTestDb());
  return { repo, service: createGoalService(repo) };
}

describe('GoalService', () => {
  it('creates goals newest-first and toggles done', async () => {
    const { repo, service } = setup();
    await service.create({ title: 'Learn piano' });
    const second = await service.create({ title: 'Visit Japan' });

    const all = await repo.getAll();
    expect(all[0]!.title).toBe('Visit Japan'); // newest first

    const done = await service.toggleDone(second.id);
    expect(done.done).toBe(true);
    expect(done.doneAt).not.toBeNull();

    // Done goals sort after open ones.
    expect((await repo.getAll())[0]!.title).toBe('Learn piano');
  });

  it('validates the title and stores an optional target date', async () => {
    const { service } = setup();
    await expect(service.create({ title: '   ' })).rejects.toThrow();
    const goal = await service.create({ title: 'Run a 10k', targetDate: '2024-12-31' });
    expect(goal.targetDate).toBe('2024-12-31');
  });

  it('soft-deletes a goal', async () => {
    const { repo, service } = setup();
    const goal = await service.create({ title: 'Temp' });
    await service.remove(goal.id);
    expect(await repo.getById(goal.id)).toBeUndefined();
  });
});
