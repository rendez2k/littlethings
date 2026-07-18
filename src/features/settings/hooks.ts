'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/db/dexie';
import { createSettingsRepository, type SettingsRepository } from './repository';
import { DEFAULT_APP_SETTINGS, type AppSettings } from './schemas';

let repo: SettingsRepository | null = null;
function getRepo() {
  return (repo ??= createSettingsRepository(getDb()));
}

export function getSettingsRepository(): SettingsRepository {
  return getRepo();
}

/** Reactive app settings; falls back to defaults while loading. */
export function useAppSettings(): AppSettings {
  return useLiveQuery(() => getRepo().get(), []) ?? DEFAULT_APP_SETTINGS;
}
