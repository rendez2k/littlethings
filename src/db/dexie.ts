import Dexie, { type Table } from 'dexie';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import type { Goal } from '@/features/goals/schemas';
import type { AppSettings } from '@/features/settings/schemas';

/**
 * Local-first IndexedDB database (brief §15). UI code must never touch this
 * directly — it goes through the repositories in `src/features/*` so a Supabase
 * adapter can be added later without rewriting the app.
 */

export const DB_NAME = 'little-things';
export const SCHEMA_VERSION = 2;

/** A single-row settings record; `key` is always `'app'`. */
export interface SettingsRow {
  key: 'app';
  value: AppSettings;
}

/** Key/value metadata (e.g. last sync timestamp) for future sync. */
export interface MetaRow {
  key: string;
  value: unknown;
}

export class LittleThingsDB extends Dexie {
  habits!: Table<Habit, string>;
  completions!: Table<Completion, string>;
  goals!: Table<Goal, string>;
  settings!: Table<SettingsRow, string>;
  meta!: Table<MetaRow, string>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({
      // Primary key first, then secondary indexes.
      habits: 'id, status, sortOrder, updatedAt, deletedAt',
      // One record per habit per day, enforced by the unique compound index.
      completions: 'id, &[habitId+date], habitId, date, updatedAt, deletedAt',
      settings: 'key',
      meta: 'key',
    });
    // v2 adds the bucket-list goals table.
    this.version(2).stores({
      goals: 'id, sortOrder, done, updatedAt, deletedAt',
    });
  }
}

let dbInstance: LittleThingsDB | null = null;

/** Lazily-created singleton database (client-side only). */
export function getDb(): LittleThingsDB {
  if (!dbInstance) {
    dbInstance = new LittleThingsDB();
  }
  return dbInstance;
}

/** For tests: replace the singleton with a provided instance (or reset). */
export function __setDbForTests(db: LittleThingsDB | null): void {
  dbInstance = db;
}
