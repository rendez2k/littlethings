import { newId, nowIso } from '@/lib/id';
import type { DateKey } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import { createHabitRepository, type HabitRepository } from '@/features/habits/repository';
import { completionSchema, type Completion, type CompletionState } from './schemas';
import { createCompletionRepository, type CompletionRepository } from './repository';
import { goalValue } from './logic';

/**
 * Completion service (brief §15): create, update and undo completions. Undo is
 * a soft-delete (tombstone) so the row can be revived and later synced; the
 * unique [habitId+date] index means we always reuse a day's row.
 *
 * Ordinary completion changes are never destructive from the user's point of
 * view (brief §7.2) — clearing simply tombstones the record.
 */
export interface CompletionService {
  /** Mark a boolean/whole target complete (sets value to the goal). */
  complete(habitId: string, date: DateKey, now?: Date): Promise<Completion>;
  /** Set an explicit progress value (count/duration). */
  setValue(habitId: string, date: DateKey, value: number, now?: Date): Promise<Completion>;
  /** Add to the current value (count/duration), clamped at >= 0. */
  increment(habitId: string, date: DateKey, step?: number, now?: Date): Promise<Completion>;
  /** Mark the day skipped (does not break streaks). */
  skip(habitId: string, date: DateKey, now?: Date): Promise<Completion>;
  /** Toggle a boolean habit between complete and cleared. */
  toggle(habitId: string, date: DateKey, now?: Date): Promise<Completion | null>;
  /** Undo any record for the day (tombstone). */
  clear(habitId: string, date: DateKey, now?: Date): Promise<void>;
  setNote(habitId: string, date: DateKey, note: string, now?: Date): Promise<Completion>;
}

export function createCompletionService(
  completions: CompletionRepository = createCompletionRepository(),
  habits: HabitRepository = createHabitRepository(),
): CompletionService {
  async function requireHabit(id: string): Promise<Habit> {
    const habit = await habits.getById(id);
    if (!habit) throw new Error(`Habit not found: ${id}`);
    return habit;
  }

  async function upsert(
    habitId: string,
    date: DateKey,
    fields: { state: CompletionState; value: number; note?: string },
    now?: Date,
  ): Promise<Completion> {
    const stamp = nowIso(now);
    const existing = await completions.findRaw(habitId, date);
    const record: Completion = completionSchema.parse({
      id: existing?.id ?? newId(),
      habitId,
      date,
      value: fields.value,
      state: fields.state,
      note: fields.note ?? existing?.note,
      createdAt: existing?.createdAt ?? stamp,
      updatedAt: stamp,
      deletedAt: null,
    });
    await completions.put(record);
    return record;
  }

  return {
    async complete(habitId, date, now) {
      const habit = await requireHabit(habitId);
      return upsert(habitId, date, { state: 'complete', value: goalValue(habit.target) }, now);
    },

    async setValue(habitId, date, value, now) {
      const safe = Math.max(0, value);
      if (safe <= 0) {
        await this.clear(habitId, date, now);
        // Represent the cleared state with a zero-value tombstone read-back.
        const raw = await completions.findRaw(habitId, date);
        if (raw) return raw;
      }
      return upsert(habitId, date, { state: 'complete', value: safe }, now);
    },

    async increment(habitId, date, step = 1, now) {
      const existing = await completions.getByHabitAndDate(habitId, date);
      const base = existing && existing.state === 'complete' ? existing.value : 0;
      const value = Math.max(0, base + step);
      if (value <= 0) {
        await this.clear(habitId, date, now);
        const raw = await completions.findRaw(habitId, date);
        return raw!;
      }
      return upsert(habitId, date, { state: 'complete', value }, now);
    },

    async skip(habitId, date, now) {
      await requireHabit(habitId);
      return upsert(habitId, date, { state: 'skipped', value: 0 }, now);
    },

    async toggle(habitId, date, now) {
      const existing = await completions.getByHabitAndDate(habitId, date);
      if (existing && existing.state === 'complete') {
        await this.clear(habitId, date, now);
        return null;
      }
      return this.complete(habitId, date, now);
    },

    async clear(habitId, date, now) {
      const existing = await completions.findRaw(habitId, date);
      if (!existing) return;
      await completions.put({
        ...existing,
        value: 0,
        deletedAt: nowIso(now),
        updatedAt: nowIso(now),
      });
    },

    async setNote(habitId, date, note, now) {
      const existing = await completions.getByHabitAndDate(habitId, date);
      const state: CompletionState = existing?.state ?? 'complete';
      const value = existing?.value ?? 0;
      return upsert(habitId, date, { state, value, note }, now);
    },
  };
}
