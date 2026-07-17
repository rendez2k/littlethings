/**
 * Completion logic (brief §7.6, §12). Pure derivation of a habit's status on a
 * given day from its definition and any stored completion record.
 *
 * Distinguishes: complete, partial, skipped, missed, pending, not scheduled,
 * paused and future — future days are never counted as missed (brief §7.6).
 */
import type { DateKey } from '@/lib/dates';
import type { Habit, Target } from '@/features/habits/schemas';
import { isPausedOn, isScheduledOn } from '@/features/habits/schedule';
import type { Completion } from './schemas';

export type DayStatus =
  'complete' | 'partial' | 'skipped' | 'missed' | 'pending' | 'not_scheduled' | 'paused' | 'future';

/** The value that represents a fully satisfied target. */
export function goalValue(target: Target): number {
  return target.type === 'boolean' ? 1 : target.amount;
}

/** Whether a recorded value satisfies the target. */
export function isSatisfied(target: Target, value: number): boolean {
  return value >= goalValue(target);
}

/** Progress toward the target as a value/goal/ratio triple (ratio in [0,1]). */
export function targetProgress(target: Target, value: number) {
  const goal = goalValue(target);
  const ratio = goal <= 0 ? 0 : Math.min(1, Math.max(0, value / goal));
  return { value, goal, ratio };
}

/**
 * Derive the status of `habit` on `date`, given the completion record for that
 * day (if any) and today's date key.
 */
export function deriveDayStatus(
  habit: Habit,
  completion: Completion | undefined,
  date: DateKey,
  today: DateKey,
): DayStatus {
  if (!isScheduledOn(habit, date)) return 'not_scheduled';
  if (isPausedOn(habit, date)) return 'paused';
  if (date > today) return 'future';

  if (completion && !completion.deletedAt) {
    if (completion.state === 'skipped') return 'skipped';
    if (isSatisfied(habit.target, completion.value)) return 'complete';
    return completion.value > 0 ? 'partial' : 'pending';
  }

  // Scheduled, not paused, no record.
  return date < today ? 'missed' : 'pending';
}

/** Statuses that count as "done" for a scheduled day (do not break a streak). */
export function isGoodStatus(status: DayStatus): boolean {
  return status === 'complete' || status === 'skipped' || status === 'paused';
}
