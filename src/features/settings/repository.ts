import { getDb, type LittleThingsDB } from '@/db/dexie';
import { appSettingsSchema, DEFAULT_APP_SETTINGS, type AppSettings } from './schemas';

/** Persistence boundary for behavioural app settings (brief §15). */
export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
  update(patch: Partial<AppSettings>): Promise<AppSettings>;
  reset(): Promise<AppSettings>;
}

export function createSettingsRepository(db: LittleThingsDB = getDb()): SettingsRepository {
  const get = async (): Promise<AppSettings> => {
    const row = await db.settings.get('app');
    if (!row) return { ...DEFAULT_APP_SETTINGS };
    // Validate defensively; fall back to defaults on any drift.
    const parsed = appSettingsSchema.safeParse(row.value);
    return parsed.success ? parsed.data : { ...DEFAULT_APP_SETTINGS };
  };

  const save = async (settings: AppSettings): Promise<void> => {
    await db.settings.put({ key: 'app', value: appSettingsSchema.parse(settings) });
  };

  return {
    get,
    save,
    async update(patch) {
      const next = { ...(await get()), ...patch };
      await save(next);
      return next;
    },
    async reset() {
      await save(DEFAULT_APP_SETTINGS);
      return { ...DEFAULT_APP_SETTINGS };
    },
  };
}
