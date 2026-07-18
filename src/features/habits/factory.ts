import { newId, nowIso } from '@/lib/id';
import { habitSchema, type Habit, type HabitDraft } from './schemas';

export interface CreateHabitOptions {
  id?: string;
  sortOrder?: number;
  now?: Date;
}

/** Build a fully-formed, validated Habit from a user-supplied draft. */
export function createHabitFromDraft(draft: HabitDraft, options: CreateHabitOptions = {}): Habit {
  const timestamp = nowIso(options.now);
  const habit: Habit = {
    id: options.id ?? newId(),
    name: draft.name.trim(),
    notes: draft.notes?.trim() ? draft.notes.trim() : undefined,
    icon: draft.icon,
    color: draft.color,
    schedule: draft.schedule,
    target: draft.target,
    reminder: draft.reminder,
    startDate: draft.startDate,
    endDate: draft.endDate ?? null,
    sortOrder: options.sortOrder ?? 0,
    status: 'active',
    archivedAt: null,
    pausedPeriods: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  };
  // Guarantee we never persist an invalid habit.
  return habitSchema.parse(habit);
}
