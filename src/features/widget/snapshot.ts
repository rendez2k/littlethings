/**
 * Build a widget snapshot from a computed day view. Pure so it can be unit
 * tested and reused wherever today's view is available.
 */

import type { DayView } from '@/features/completions/day-view';
import { targetProgress } from '@/features/completions/logic';
import { HABIT_COLOR_VALUES } from '@/features/habits/colors';
import type { HabitColor } from '@/features/habits/schemas';
import { type WidgetColor, type WidgetSnapshot, WIDGET_MAX_HABITS } from './contract';

/** A habit colour key resolved to light/dark hex, defaulting gracefully. */
function colorHexFor(color: string): WidgetColor {
  const v = HABIT_COLOR_VALUES[color as HabitColor] ?? HABIT_COLOR_VALUES.lavender;
  return { light: v.light, dark: v.dark };
}

export function buildWidgetSnapshot(
  view: DayView,
  date: string,
  now: string,
  accent: WidgetColor,
): WidgetSnapshot {
  return {
    schema: 2,
    date,
    completed: view.summary.completed,
    total: view.summary.total,
    ratio: view.summary.ratio,
    accent,
    habits: view.entries.slice(0, WIDGET_MAX_HABITS).map((entry) => {
      const value =
        entry.completion && !entry.completion.deletedAt ? entry.completion.value : 0;
      const ratio =
        entry.status === 'complete'
          ? 1
          : value > 0
            ? targetProgress(entry.habit.target, value).ratio
            : 0;
      return {
        id: entry.habit.id,
        name: entry.habit.name,
        icon: entry.habit.icon,
        color: entry.habit.color,
        colorHex: colorHexFor(entry.habit.color),
        ratio,
        done: entry.status === 'complete',
        partial: entry.status === 'partial',
      };
    }),
    updatedAt: now,
  };
}
