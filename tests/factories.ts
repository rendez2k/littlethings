/** Shared test helpers: build valid domain objects and isolated databases. */
import { LittleThingsDB } from '@/db/dexie';
import type { Habit, HabitDraft, Schedule, Target } from '@/features/habits/schemas';
import { createHabitFromDraft } from '@/features/habits/factory';
import type { Completion, CompletionState } from '@/features/completions/schemas';
import { newId } from '@/lib/id';

let counter = 0;

/** A fresh, uniquely-named database so tests never share state. */
export function makeTestDb(): LittleThingsDB {
  counter += 1;
  return new LittleThingsDB(`little-things-test-${Date.now()}-${counter}`);
}

const FIXED_NOW = new Date('2024-05-15T12:00:00.000Z');

export function makeDraft(overrides: Partial<HabitDraft> = {}): HabitDraft {
  return {
    name: 'Drink water',
    icon: 'droplet',
    color: 'sky',
    schedule: { type: 'daily' },
    target: { type: 'boolean' },
    reminder: { enabled: false, time: '09:00' },
    startDate: '2024-05-01',
    endDate: null,
    ...overrides,
  };
}

export function makeHabit(overrides: Partial<Habit> = {}): Habit {
  const base = createHabitFromDraft(makeDraft(), { id: overrides.id ?? newId(), now: FIXED_NOW });
  return { ...base, ...overrides };
}

export function makeScheduledHabit(schedule: Schedule, overrides: Partial<Habit> = {}): Habit {
  return makeHabit({ schedule, ...overrides });
}

export function makeTargetHabit(target: Target, overrides: Partial<Habit> = {}): Habit {
  return makeHabit({ target, ...overrides });
}

export function makeCompletion(
  habitId: string,
  date: string,
  overrides: Partial<Completion> = {},
): Completion {
  const state: CompletionState = overrides.state ?? 'complete';
  return {
    id: overrides.id ?? newId(),
    habitId,
    date,
    value: overrides.value ?? 1,
    state,
    note: overrides.note,
    createdAt: '2024-05-15T12:00:00.000Z',
    updatedAt: '2024-05-15T12:00:00.000Z',
    deletedAt: overrides.deletedAt ?? null,
  };
}
