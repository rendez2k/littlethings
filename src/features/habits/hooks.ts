'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/db/dexie';
import { createHabitRepository, type HabitRepository } from './repository';
import { createHabitService, type HabitService } from './service';
import {
  createCompletionRepository,
  type CompletionRepository,
} from '@/features/completions/repository';
import { createCompletionService, type CompletionService } from '@/features/completions/service';

/**
 * Client-side data access. Reads use Dexie live queries (via the repositories,
 * never Dexie directly) so the UI re-renders when local data changes. The
 * singletons are created lazily so nothing touches IndexedDB during SSR.
 */
let habitRepo: HabitRepository | null = null;
let completionRepo: CompletionRepository | null = null;
let habitService: HabitService | null = null;
let completionService: CompletionService | null = null;

function getHabitRepo() {
  return (habitRepo ??= createHabitRepository(getDb()));
}
function getCompletionRepo() {
  return (completionRepo ??= createCompletionRepository(getDb()));
}
export function getHabitService(): HabitService {
  return (habitService ??= createHabitService(getHabitRepo(), getCompletionRepo()));
}
export function getCompletionService(): CompletionService {
  return (completionService ??= createCompletionService(getCompletionRepo(), getHabitRepo()));
}

export function useActiveHabits() {
  return useLiveQuery(() => getHabitRepo().getActive(), []);
}
export function useArchivedHabits() {
  return useLiveQuery(() => getHabitRepo().getArchived(), []);
}
export function useAllHabits() {
  return useLiveQuery(() => getHabitRepo().getAll(), []);
}
export function useHabit(id: string | null) {
  return useLiveQuery(() => (id ? getHabitRepo().getById(id) : Promise.resolve(undefined)), [id]);
}
