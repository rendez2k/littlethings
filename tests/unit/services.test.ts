import { describe, expect, it } from 'vitest';
import { createHabitRepository } from '@/features/habits/repository';
import { createCompletionRepository } from '@/features/completions/repository';
import { createHabitService } from '@/features/habits/service';
import { createCompletionService } from '@/features/completions/service';
import { makeTestDb, makeDraft } from '../factories';

function setup() {
  const db = makeTestDb();
  const habitRepo = createHabitRepository(db);
  const completionRepo = createCompletionRepository(db);
  const habitService = createHabitService(habitRepo, completionRepo);
  const completionService = createCompletionService(completionRepo, habitRepo);
  return { habitRepo, completionRepo, habitService, completionService };
}

describe('HabitService', () => {
  it('assigns increasing sort orders on create', async () => {
    const { habitService } = setup();
    const a = await habitService.create(makeDraft({ name: 'A' }));
    const b = await habitService.create(makeDraft({ name: 'B' }));
    expect(b.sortOrder).toBeGreaterThan(a.sortOrder);
  });

  it('updates fields and bumps updatedAt', async () => {
    const { habitService } = setup();
    const created = await habitService.create(makeDraft(), {
      now: new Date('2024-05-01T00:00:00Z'),
    });
    const updated = await habitService.update(
      created.id,
      { name: 'Renamed' },
      new Date('2024-05-02T00:00:00Z'),
    );
    expect(updated.name).toBe('Renamed');
    expect(updated.updatedAt > created.updatedAt).toBe(true);
  });

  it('pauses and resumes, recording paused periods', async () => {
    const { habitService } = setup();
    const created = await habitService.create(makeDraft());
    const paused = await habitService.pause(
      created.id,
      undefined,
      new Date('2024-05-10T00:00:00Z'),
    );
    expect(paused.status).toBe('paused');
    expect(paused.pausedPeriods).toHaveLength(1);
    expect(paused.pausedPeriods[0]!.end).toBeNull();

    const resumed = await habitService.resume(created.id, new Date('2024-05-12T00:00:00Z'));
    expect(resumed.status).toBe('active');
    expect(resumed.pausedPeriods[0]!.end).toBe('2024-05-11'); // yesterday
  });

  it('archives and unarchives', async () => {
    const { habitService, habitRepo } = setup();
    const created = await habitService.create(makeDraft());
    await habitService.archive(created.id);
    expect((await habitRepo.getById(created.id))!.status).toBe('archived');
    await habitService.unarchive(created.id);
    expect((await habitRepo.getById(created.id))!.status).toBe('active');
  });

  it('soft-deletes a habit and removes its completions', async () => {
    const { habitService, completionService, habitRepo, completionRepo } = setup();
    const created = await habitService.create(makeDraft());
    await completionService.complete(created.id, '2024-05-10');
    await habitService.softDelete(created.id);
    expect(await habitRepo.getById(created.id)).toBeUndefined();
    expect(await completionRepo.getByHabit(created.id)).toHaveLength(0);
  });

  it('reorders habits by the provided id order', async () => {
    const { habitService, habitRepo } = setup();
    const a = await habitService.create(makeDraft({ name: 'A' }));
    const b = await habitService.create(makeDraft({ name: 'B' }));
    await habitService.reorder([b.id, a.id]);
    expect((await habitRepo.getActive()).map((h) => h.name)).toEqual(['B', 'A']);
  });
});

describe('CompletionService', () => {
  it('completes a boolean habit at the goal value and toggles it off', async () => {
    const { habitService, completionService, completionRepo } = setup();
    const habit = await habitService.create(makeDraft());
    const rec = await completionService.complete(habit.id, '2024-05-10');
    expect(rec.value).toBe(1);
    expect(rec.state).toBe('complete');

    const toggled = await completionService.toggle(habit.id, '2024-05-10');
    expect(toggled).toBeNull();
    expect(await completionRepo.getByHabitAndDate(habit.id, '2024-05-10')).toBeUndefined();
  });

  it('reuses the same row when re-completing after a clear (unique index)', async () => {
    const { habitService, completionService, completionRepo } = setup();
    const habit = await habitService.create(makeDraft());
    const first = await completionService.complete(habit.id, '2024-05-10');
    await completionService.clear(habit.id, '2024-05-10');
    const second = await completionService.complete(habit.id, '2024-05-10');
    expect(second.id).toBe(first.id); // revived, not duplicated
    expect((await completionRepo.getByHabit(habit.id)).length).toBe(1);
  });

  it('increments and decrements a count target', async () => {
    const { habitService, completionService } = setup();
    const habit = await habitService.create(
      makeDraft({ target: { type: 'count', amount: 8, unit: 'glasses' } }),
    );
    await completionService.increment(habit.id, '2024-05-10', 3);
    const rec = await completionService.increment(habit.id, '2024-05-10', 2);
    expect(rec.value).toBe(5);
    const back = await completionService.increment(habit.id, '2024-05-10', -5);
    expect(back.deletedAt).not.toBeNull(); // dropped to zero → cleared
  });

  it('records a skip without breaking (state skipped)', async () => {
    const { habitService, completionService } = setup();
    const habit = await habitService.create(makeDraft());
    const rec = await completionService.skip(habit.id, '2024-05-10');
    expect(rec.state).toBe('skipped');
    expect(rec.value).toBe(0);
  });
});
