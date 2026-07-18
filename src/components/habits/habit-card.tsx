'use client';

import { ChevronRight } from 'lucide-react';
import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { scheduleLabel, targetLabel } from '@/features/habits/labels';
import type { Habit } from '@/features/habits/schemas';

/**
 * Compact habit card used in lists. Phase 3 uses it to open the editor; the
 * completion controls arrive in Phase 4 (daily tracking).
 */
export function HabitCard({ habit, onOpen }: { habit: Habit; onOpen: (habit: Habit) => void }) {
  const { resolvedTheme } = useAppearance();
  const Icon = getHabitIcon(habit.icon);
  const { accent, soft } = getHabitAccent(habit.color, resolvedTheme);
  const target = targetLabel(habit.target);

  return (
    <button
      type="button"
      onClick={() => onOpen(habit)}
      className="flex w-full items-center gap-3 rounded-card border border-border bg-surface p-3 text-left shadow-card transition active:scale-[0.99]"
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
      <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
    </button>
  );
}
