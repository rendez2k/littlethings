/**
 * Build a widget snapshot from a computed day view. Pure so it can be unit
 * tested and reused wherever today's view is available.
 */

import type { DayView } from '@/features/completions/day-view';
import { type WidgetSnapshot, WIDGET_MAX_HABITS } from './contract';

export function buildWidgetSnapshot(view: DayView, date: string, now: string): WidgetSnapshot {
  return {
    schema: 1,
    date,
    completed: view.summary.completed,
    total: view.summary.total,
    ratio: view.summary.ratio,
    habits: view.entries.slice(0, WIDGET_MAX_HABITS).map((entry) => ({
      id: entry.habit.id,
      name: entry.habit.name,
      icon: entry.habit.icon,
      color: entry.habit.color,
      done: entry.status === 'complete',
      partial: entry.status === 'partial',
    })),
    updatedAt: now,
  };
}
