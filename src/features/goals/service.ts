import { newId, nowIso } from '@/lib/id';
import { createGoalRepository, type GoalRepository } from './repository';
import { goalSchema, type Goal, type GoalDraft } from './schemas';

export interface GoalService {
  create(draft: GoalDraft, now?: Date): Promise<Goal>;
  update(id: string, patch: Partial<GoalDraft>, now?: Date): Promise<Goal>;
  toggleDone(id: string, now?: Date): Promise<Goal>;
  remove(id: string, now?: Date): Promise<void>;
  reorder(orderedIds: string[], now?: Date): Promise<void>;
}

export function createGoalService(goals: GoalRepository = createGoalRepository()): GoalService {
  async function require(id: string): Promise<Goal> {
    const goal = await goals.getById(id);
    if (!goal) throw new Error(`Goal not found: ${id}`);
    return goal;
  }

  return {
    async create(draft, now) {
      const existing = await goals.getAll();
      const stamp = nowIso(now);
      const goal = goalSchema.parse({
        id: newId(),
        title: draft.title.trim(),
        notes: draft.notes?.trim() ? draft.notes.trim() : undefined,
        targetDate: draft.targetDate ?? null,
        done: false,
        doneAt: null,
        sortOrder: existing.length ? Math.min(...existing.map((g) => g.sortOrder)) - 1 : 0,
        createdAt: stamp,
        updatedAt: stamp,
        deletedAt: null,
      });
      await goals.put(goal);
      return goal;
    },

    async update(id, patch, now) {
      const current = await require(id);
      const next = goalSchema.parse({
        ...current,
        title: patch.title?.trim() ?? current.title,
        notes: patch.notes === undefined ? current.notes : patch.notes?.trim() || undefined,
        targetDate:
          patch.targetDate === undefined ? current.targetDate : (patch.targetDate ?? null),
        updatedAt: nowIso(now),
      });
      await goals.put(next);
      return next;
    },

    async toggleDone(id, now) {
      const current = await require(id);
      const stamp = nowIso(now);
      const done = !current.done;
      const next: Goal = { ...current, done, doneAt: done ? stamp : null, updatedAt: stamp };
      await goals.put(next);
      return next;
    },

    async remove(id, now) {
      const current = await require(id);
      await goals.put({ ...current, deletedAt: nowIso(now), updatedAt: nowIso(now) });
    },

    async reorder(orderedIds, now) {
      const stamp = nowIso(now);
      const updated: Goal[] = [];
      for (let i = 0; i < orderedIds.length; i++) {
        const goal = await goals.getById(orderedIds[i]!);
        if (goal) updated.push({ ...goal, sortOrder: i, updatedAt: stamp });
      }
      await goals.bulkPut(updated);
    },
  };
}
