/**
 * Builds the list of habits to show for a given day, with each habit's derived
 * status for that day, plus a progress summary. Pure and tested so the Today
 * screen stays declarative.
 */
import type { DateKey } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import { isPausedOn, isScheduledOn } from '@/features/habits/schedule';
import { deriveDayStatus, type DayStatus } from './logic';
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
): DayView {
  const byHabit = new Map<string, Completion>();
  for (const c of completionsForDate) {
    if (!c.deletedAt) byHabit.set(c.habitId, c);
  }

  const entries: DayEntry[] = scheduledForDay(habits, date)
    .map((habit) => {
      const completion = byHabit.get(habit.id);
      return { habit, completion, status: deriveDayStatus(habit, completion, date, today) };
    })
    .sort((a, b) => a.habit.sortOrder - b.habit.sortOrder);

  const completed = entries.filter((e) => e.status === 'complete').length;
  const skipped = entries.filter((e) => e.status === 'skipped').length;
  const total = entries.length;
  // Skipped days count toward "done" for the day's progress.
  const done = completed + skipped;
  const ratio = total === 0 ? 0 : done / total;

  return { entries, summary: { completed, skipped, total, ratio } };
}
