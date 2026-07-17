'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { scheduleLabel, targetLabel } from '@/features/habits/labels';
import type { Habit } from '@/features/habits/schemas';
import { HabitActionsMenu } from './habit-actions-menu';

interface Props {
  habit: Habit;
  onOpen: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDeleted?: () => void;
}

/** A habit row for the Habits screen: tappable info + an actions menu. */
export function HabitListRow({ habit, onOpen, onEdit, onMoveUp, onMoveDown, onDeleted }: Props) {
  const { resolvedTheme } = useAppearance();
  const Icon = getHabitIcon(habit.icon);
  const { accent, soft } = getHabitAccent(habit.color, resolvedTheme);
  const target = targetLabel(habit.target);

  return (
    <div className="flex items-center gap-2 rounded-card border border-border bg-surface p-3 shadow-card">
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
          <span className="block truncate font-semibold text-text">{habit.name}</span>
          <span className="block truncate text-sm text-muted">
            {scheduleLabel(habit.schedule)}
            {target ? ` · ${target}` : ''}
            {habit.status === 'paused' ? ' · Paused' : ''}
          </span>
        </span>
      </button>
      <HabitActionsMenu
        habit={habit}
        onEdit={onEdit}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDeleted={onDeleted}
      />
    </div>
  );
}
