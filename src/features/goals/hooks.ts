'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/db/dexie';
import { createGoalRepository, type GoalRepository } from './repository';
import { createGoalService, type GoalService } from './service';

let repo: GoalRepository | null = null;
let service: GoalService | null = null;

function getRepo() {
  return (repo ??= createGoalRepository(getDb()));
}
export function getGoalService(): GoalService {
  return (service ??= createGoalService(getRepo()));
}

export function useGoals() {
  return useLiveQuery(() => getRepo().getAll(), []);
}
