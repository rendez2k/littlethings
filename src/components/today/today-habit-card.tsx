'use client';

import { Flame, StickyNote } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { scheduleLabel, targetLabel } from '@/features/habits/labels';
import type { DayEntry } from '@/features/completions/day-view';
import type { StreakResult } from '@/features/streaks/streak';
import type { Habit } from '@/features/habits/schemas';
import type { DateKey } from '@/lib/dates';
import { CompletionControl } from '@/components/habits/completion-control';

interface Props {
  entry: DayEntry;
  streak: StreakResult;
  date: DateKey;
  today: DateKey;
  onOpen: (habit: Habit) => void;
}

const STREAK_UNIT_LABEL: Record<StreakResult['unit'], string> = {
  day: 'day',
  week: 'week',
  month: 'month',
};

export function TodayHabitCard({ entry, streak, date, today, onOpen }: Props) {
  const { resolvedTheme } = useAppearance();
  const { habit, completion, status } = entry;
  const Icon = getHabitIcon(habit.icon);
  const { accent, soft } = getHabitAccent(habit.color, resolvedTheme);
  const target = targetLabel(habit.target);
  const isFutureDay = date > today;
  const done = status === 'complete' || status === 'skipped';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card transition',
        done && 'opacity-[0.72]',
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(habit)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={`Open ${habit.name}`}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: soft, color: accent }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-semibold text-text">{habit.name}</span>
            {completion?.note ? (
              <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted" aria-label="Has a note" />
            ) : null}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-sm text-muted">
            <span className="truncate">
              {scheduleLabel(habit.schedule)}
              {target ? ` · ${target}` : ''}
            </span>
            {streak.current > 0 ? (
              <span
                className="inline-flex shrink-0 items-center gap-0.5 font-medium"
                style={{ color: accent }}
              >
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                <span aria-label={`${streak.current} ${STREAK_UNIT_LABEL[streak.unit]} streak`}>
                  {streak.current}
                </span>
              </span>
            ) : null}
          </span>
        </span>
      </button>

      <div className="shrink-0">
        <CompletionControl
          habit={habit}
          completion={completion}
          status={status}
          date={date}
          disabled={isFutureDay}
        />
      </div>
    </div>
  );
}
