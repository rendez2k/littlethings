import { nowIso } from '@/lib/id';
import { getDb, type LittleThingsDB } from '@/db/dexie';
import { createHabitRepository, type HabitRepository } from '@/features/habits/repository';
import {
  createCompletionRepository,
  type CompletionRepository,
} from '@/features/completions/repository';
import { createGoalRepository, type GoalRepository } from '@/features/goals/repository';
import { createSettingsRepository, type SettingsRepository } from '@/features/settings/repository';
import {
  DEFAULT_APPEARANCE,
  loadAppearance,
  saveAppearance,
  type AppearanceSettings,
} from '@/features/settings/appearance';
import {
  EXPORT_SCHEMA_VERSION,
  exportBundleSchema,
  type ExportBundle,
  type ImportCounts,
  type ImportMode,
} from './schema';

interface DataServiceDeps {
  db?: LittleThingsDB;
  habits?: HabitRepository;
  completions?: CompletionRepository;
  goals?: GoalRepository;
  settings?: SettingsRepository;
  getAppearance?: () => AppearanceSettings;
  setAppearance?: (a: AppearanceSettings) => void;
}

export interface DataService {
  exportBundle(now?: Date): Promise<ExportBundle>;
  exportJson(now?: Date): Promise<string>;
  /** Validate raw text into a bundle, throwing a friendly error otherwise. */
  parse(text: string): ExportBundle;
  /**
   * Import a validated bundle. Returns the pre-import backup JSON (so the UI can
   * offer to save it) and how many records were imported.
   */
  importBundle(
    bundle: ExportBundle,
    mode: ImportMode,
    now?: Date,
  ): Promise<{ backup: string; counts: ImportCounts }>;
  /** Delete all completion history but keep habits and goals. */
  clearHistory(): Promise<number>;
  /** Wipe everything (habits, completions, goals, settings). */
  resetAll(): Promise<void>;
}

export function createDataService(deps: DataServiceDeps = {}): DataService {
  const db = deps.db ?? getDb();
  const habits = deps.habits ?? createHabitRepository(db);
  const completions = deps.completions ?? createCompletionRepository(db);
  const goals = deps.goals ?? createGoalRepository(db);
  const settings = deps.settings ?? createSettingsRepository(db);
  const getAppearance = deps.getAppearance ?? loadAppearance;
  const setAppearance = deps.setAppearance ?? saveAppearance;

  const exportBundle = async (now?: Date): Promise<ExportBundle> => ({
    app: 'little-things',
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: nowIso(now),
    appearance: getAppearance(),
    settings: await settings.get(),
    habits: await habits.getAll(),
    completions: await completions.getAll(),
    goals: await goals.getAll(),
  });

  return {
    exportBundle,

    async exportJson(now) {
      return JSON.stringify(await exportBundle(now), null, 2);
    },

    parse(text) {
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('That file isn’t valid JSON.');
      }
      const result = exportBundleSchema.safeParse(data);
      if (!result.success) {
        throw new Error('This doesn’t look like a Little Things backup.');
      }
      return result.data;
    },

    async importBundle(bundle, mode, now) {
      const backup = JSON.stringify(await exportBundle(now));

      if (mode === 'replace') {
        await Promise.all([habits.clear(), completions.clear(), goals.clear()]);
      }

      await habits.bulkPut(bundle.habits);
      await completions.bulkPut(bundle.completions);
      await goals.bulkPut(bundle.goals);
      await settings.save(bundle.settings);
      setAppearance(bundle.appearance);

      return {
        backup,
        counts: {
          habits: bundle.habits.length,
          completions: bundle.completions.length,
          goals: bundle.goals.length,
        },
      };
    },

    async clearHistory() {
      const all = await completions.getAll();
      await completions.clear();
      return all.length;
    },

    async resetAll() {
      await Promise.all([habits.clear(), completions.clear(), goals.clear(), db.settings.clear()]);
      setAppearance({ ...DEFAULT_APPEARANCE });
    },
  };
}
