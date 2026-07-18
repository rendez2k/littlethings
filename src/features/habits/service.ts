import { nowIso } from '@/lib/id';
import type { DateKey } from '@/lib/dates';
import { addDays, todayKey } from '@/lib/dates';
import { createHabitRepository, type HabitRepository } from './repository';
import {
  createCompletionRepository,
  type CompletionRepository,
} from '@/features/completions/repository';
import { habitSchema, type Habit, type HabitDraft } from './schemas';
import { createHabitFromDraft, type CreateHabitOptions } from './factory';

/**
 * Habit service (brief §15): the only place UI calls to mutate habits. Composes
 * the repositories, stamps timestamps, and keeps invariants (validation, sort
 * order, paused periods). All mutations are safe to call optimistically.
 */
export interface HabitService {
  create(draft: HabitDraft, options?: CreateHabitOptions): Promise<Habit>;
  update(id: string, patch: Partial<HabitDraft>, now?: Date): Promise<Habit>;
  archive(id: string, now?: Date): Promise<Habit>;
  unarchive(id: string, now?: Date): Promise<Habit>;
  pause(id: string, from?: DateKey, now?: Date): Promise<Habit>;
  resume(id: string, now?: Date): Promise<Habit>;
  /** Soft-delete (tombstone) a habit and hard-delete its completion records. */
  softDelete(id: string, now?: Date): Promise<void>;
  reorder(orderedIds: string[], now?: Date): Promise<void>;
}

async function requireHabit(repo: HabitRepository, id: string): Promise<Habit> {
  const habit = await repo.getById(id);
  if (!habit) throw new Error(`Habit not found: ${id}`);
  return habit;
}

export function createHabitService(
  habits: HabitRepository = createHabitRepository(),
  completions: CompletionRepository = createCompletionRepository(),
): HabitService {
  return {
    async create(draft, options) {
      const existing = await habits.getAll();
      const sortOrder =
        options?.sortOrder ??
        (existing.length ? Math.max(...existing.map((h) => h.sortOrder)) + 1 : 0);
      const habit = createHabitFromDraft(draft, { ...options, sortOrder });
      await habits.put(habit);
      return habit;
    },

    async update(id, patch, now) {
      const current = await requireHabit(habits, id);
      const next = habitSchema.parse({
        ...current,
        ...patch,
        // Preserve identity/lifecycle fields.
        id: current.id,
        endDate: patch.endDate === undefined ? current.endDate : (patch.endDate ?? null),
        notes: patch.notes === undefined ? current.notes : patch.notes?.trim() || undefined,
        updatedAt: nowIso(now),
      });
      await habits.put(next);
      return next;
    },

    async archive(id, now) {
      const current = await requireHabit(habits, id);
      const stamp = nowIso(now);
      const next: Habit = { ...current, status: 'archived', archivedAt: stamp, updatedAt: stamp };
      await habits.put(next);
      return next;
    },

    async unarchive(id, now) {
      const current = await requireHabit(habits, id);
      const next: Habit = {
        ...current,
        status: 'active',
        archivedAt: null,
        updatedAt: nowIso(now),
      };
      await habits.put(next);
      return next;
    },

    async pause(id, from, now) {
      const current = await requireHabit(habits, id);
      const start = from ?? todayKey(now);
      // Ignore if already paused with an open period.
      const hasOpen = current.pausedPeriods.some((p) => p.end === null);
      const pausedPeriods = hasOpen
        ? current.pausedPeriods
        : [...current.pausedPeriods, { start, end: null }];
      const next: Habit = {
        ...current,
        status: 'paused',
        pausedPeriods,
        updatedAt: nowIso(now),
      };
      await habits.put(next);
      return next;
    },

    async resume(id, now) {
      const current = await requireHabit(habits, id);
      const today = todayKey(now);
      // Close any open paused period at yesterday so today is active again.
      const pausedPeriods = current.pausedPeriods.map((p) =>
        p.end === null ? { ...p, end: addDays(today, -1) } : p,
      );
      const next: Habit = {
        ...current,
        status: 'active',
        pausedPeriods,
        updatedAt: nowIso(now),
      };
      await habits.put(next);
      return next;
    },

    async softDelete(id, now) {
      const current = await requireHabit(habits, id);
      await habits.put({ ...current, deletedAt: nowIso(now), updatedAt: nowIso(now) });
      await completions.hardDeleteByHabit(id);
    },

    async reorder(orderedIds, now) {
      const stamp = nowIso(now);
      const updated: Habit[] = [];
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i]!;
        const habit = await habits.getById(id);
        if (habit) updated.push({ ...habit, sortOrder: i, updatedAt: stamp });
      }
      await habits.bulkPut(updated);
    },
  };
}
