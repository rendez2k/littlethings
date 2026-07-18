import { getDb, type LittleThingsDB } from '@/db/dexie';
import type { Goal } from './schemas';

export interface GoalRepository {
  getAll(): Promise<Goal[]>;
  getById(id: string): Promise<Goal | undefined>;
  put(goal: Goal): Promise<void>;
  bulkPut(goals: Goal[]): Promise<void>;
  hardDelete(id: string): Promise<void>;
  clear(): Promise<void>;
}

function order(a: Goal, b: Goal): number {
  // Open goals first, then by sort order, then newest.
  if (a.done !== b.done) return a.done ? 1 : -1;
  return a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt);
}

export function createGoalRepository(db: LittleThingsDB = getDb()): GoalRepository {
  return {
    async getAll() {
      const all = await db.goals.toArray();
      return all.filter((g) => !g.deletedAt).sort(order);
    },
    async getById(id) {
      const goal = await db.goals.get(id);
      return goal && !goal.deletedAt ? goal : undefined;
    },
    async put(goal) {
      await db.goals.put(goal);
    },
    async bulkPut(goals) {
      await db.goals.bulkPut(goals);
    },
    async hardDelete(id) {
      await db.goals.delete(id);
    },
    async clear() {
      await db.goals.clear();
    },
  };
}
