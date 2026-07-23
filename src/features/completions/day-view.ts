/**
 * Builds the list of habits to show for a given day, with each habit's derived
 * status for that day, plus a progress summary. Pure and tested so the Today
 * screen stays declarative.
 */
import type { DateKey } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import { isPausedOn, isScheduledOn, isWithinRange } from '@/features/habits/schedule';
import { deriveDayStatus, isSatisfied, type DayStatus } from './logic';
import type { Completion } from './schemas';

export interface DayEntry {
  habit: Habit;
  completion: Completion | undefined;
  status: DayStatus;
}

export interface DaySummary {
  completed: number;
  skipped: number;
  total: number;
  /** Completion ratio in [0,1]; 0 when nothing is scheduled. */
  ratio: number;
}

export interface DayView {
  entries: DayEntry[];
  summary: DaySummary;
}

/** Habits that are actually shown for `date`: active, scheduled and not paused. */
export function scheduledForDay(habits: Habit[], date: DateKey): Habit[] {
  return habits.filter(
    (h) => h.status !== 'archived' && isScheduledOn(h, date) && !isPausedOn(h, date),
  );
}

export function buildDayView(
  habits: Habit[],
  completionsForDate: Completion[],
  date: DateKey,
  today: DateKey,
  /**
   * Habit ids with at least one completion ever. Used to keep a one-off visible
   * on today until it's done: a `once` habit is only "scheduled" on its start
   * date, but should linger on today so you can get to it, then drop off once
   * completed. Omit to keep the plain scheduled view.
   */
  everCompletedHabitIds?: ReadonlySet<string>,
): DayView {
  const byHabit = new Map<string, Completion>();
  for (const c of completionsForDate) {
    if (!c.deletedAt) byHabit.set(c.habitId, c);
  }

  const scheduled = scheduledForDay(habits, date);
  const shownIds = new Set(scheduled.map((h) => h.id));
  const entries: DayEntry[] = scheduled.map((habit) => {
    const completion = byHabit.get(habit.id);
    return { habit, completion, status: deriveDayStatus(habit, completion, date, today) };
  });

  // Carry unfinished one-offs onto today so they can still be ticked off.
  if (date === today && everCompletedHabitIds) {
    for (const habit of habits) {
      if (habit.schedule.type !== 'once' || shownIds.has(habit.id)) continue;
      if (habit.status === 'archived' || habit.deletedAt) continue;
      if (habit.startDate > date || !isWithinRange(habit, date) || isPausedOn(habit, date)) continue;
      const completion = byHabit.get(habit.id);
      // Hide once it was finished on an earlier day; keep it if done *today*.
      if (everCompletedHabitIds.has(habit.id) && !completion) continue;
      const status: DayStatus =
        completion && !completion.deletedAt
          ? completion.state === 'skipped'
            ? 'skipped'
            : isSatisfied(habit.target, completion.value)
              ? 'complete'
              : completion.value > 0
                ? 'partial'
                : 'pending'
          : 'pending';
      entries.push({ habit, completion, status });
    }
  }

  entries.sort((a, b) => a.habit.sortOrder - b.habit.sortOrder);

  const completed = entries.filter((e) => e.status === 'complete').length;
  const skipped = entries.filter((e) => e.status === 'skipped').length;
  const total = entries.length;
  // Skipped days count toward "done" for the day's progress.
  const done = completed + skipped;
  const ratio = total === 0 ? 0 : done / total;

  return { entries, summary: { completed, skipped, total, ratio } };
}
