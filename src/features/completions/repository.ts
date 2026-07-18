import { getDb, type LittleThingsDB } from '@/db/dexie';
import type { DateKey } from '@/lib/dates';
import type { Completion } from './schemas';

/** Persistence boundary for completion records (brief §15). */
export interface CompletionRepository {
  getAll(): Promise<Completion[]>;
  getByHabit(habitId: string): Promise<Completion[]>;
  getByHabitAndDate(habitId: string, date: DateKey): Promise<Completion | undefined>;
  /** Like getByHabitAndDate but returns soft-deleted rows too (for upserts). */
  findRaw(habitId: string, date: DateKey): Promise<Completion | undefined>;
  getByDate(date: DateKey): Promise<Completion[]>;
  getByHabitInRange(habitId: string, start: DateKey, end: DateKey): Promise<Completion[]>;
  put(completion: Completion): Promise<void>;
  bulkPut(completions: Completion[]): Promise<void>;
  /** Hard-delete every record for a habit (used by delete/reset). */
  hardDeleteByHabit(habitId: string): Promise<void>;
  clear(): Promise<void>;
}

export function createCompletionRepository(db: LittleThingsDB = getDb()): CompletionRepository {
  return {
    async getAll() {
      const all = await db.completions.toArray();
      return all.filter((c) => !c.deletedAt);
    },
    async getByHabit(habitId) {
      const rows = await db.completions.where('habitId').equals(habitId).toArray();
      return rows.filter((c) => !c.deletedAt).sort((a, b) => a.date.localeCompare(b.date));
    },
    async getByHabitAndDate(habitId, date) {
      const row = await db.completions.where('[habitId+date]').equals([habitId, date]).first();
      return row && !row.deletedAt ? row : undefined;
    },
    async findRaw(habitId, date) {
      return db.completions.where('[habitId+date]').equals([habitId, date]).first();
    },
    async getByDate(date) {
      const rows = await db.completions.where('date').equals(date).toArray();
      return rows.filter((c) => !c.deletedAt);
    },
    async getByHabitInRange(habitId, start, end) {
      const rows = await db.completions.where('habitId').equals(habitId).toArray();
      return rows
        .filter((c) => !c.deletedAt && c.date >= start && c.date <= end)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    async put(completion) {
      await db.completions.put(completion);
    },
    async bulkPut(completions) {
      await db.completions.bulkPut(completions);
    },
    async hardDeleteByHabit(habitId) {
      await db.completions.where('habitId').equals(habitId).delete();
    },
    async clear() {
      await db.completions.clear();
    },
  };
}
