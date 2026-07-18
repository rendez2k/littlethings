import { getDb, type LittleThingsDB } from '@/db/dexie';
import type { Habit } from './schemas';

/**
 * Persistence boundary for habits (brief §15). UI/services depend on this
 * interface, never on Dexie, so a cloud adapter can slot in later.
 */
export interface HabitRepository {
  /** All non-deleted habits (any status). */
  getAll(): Promise<Habit[]>;
  /** Active + paused habits, ordered by sortOrder. */
  getActive(): Promise<Habit[]>;
  /** Archived habits, ordered by sortOrder. */
  getArchived(): Promise<Habit[]>;
  getById(id: string): Promise<Habit | undefined>;
  put(habit: Habit): Promise<void>;
  bulkPut(habits: Habit[]): Promise<void>;
  /** Hard-delete a single habit (used by reset/import-replace). */
  hardDelete(id: string): Promise<void>;
  clear(): Promise<void>;
}

function bySortOrder(a: Habit, b: Habit): number {
  return a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt);
}

export function createHabitRepository(db: LittleThingsDB = getDb()): HabitRepository {
  return {
    async getAll() {
      const all = await db.habits.toArray();
      return all.filter((h) => !h.deletedAt).sort(bySortOrder);
    },
    async getActive() {
      const all = await db.habits.toArray();
      return all.filter((h) => !h.deletedAt && h.status !== 'archived').sort(bySortOrder);
    },
    async getArchived() {
      const all = await db.habits.toArray();
      return all.filter((h) => !h.deletedAt && h.status === 'archived').sort(bySortOrder);
    },
    async getById(id) {
      const habit = await db.habits.get(id);
      return habit && !habit.deletedAt ? habit : undefined;
    },
    async put(habit) {
      await db.habits.put(habit);
    },
    async bulkPut(habits) {
      await db.habits.bulkPut(habits);
    },
    async hardDelete(id) {
      await db.habits.delete(id);
    },
    async clear() {
      await db.habits.clear();
    },
  };
}
