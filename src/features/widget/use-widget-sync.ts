'use client';

/**
 * Keep the native home-screen widget in step with today.
 *
 * Call this once, unconditionally, near the top of the Today screen (before any
 * early returns so it obeys the rules of hooks). It rebuilds today's view from
 * the raw data and pushes a snapshot whenever the meaningful content changes.
 *
 * It only syncs while the app is actually showing today — browsing history must
 * not overwrite the widget with a past day. Because the app opens on today and
 * completions are toggled there, the widget stays fresh in normal use.
 */

import { useEffect, useRef } from 'react';
import type { DateKey } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import { buildDayView } from '@/features/completions/day-view';
import { buildWidgetSnapshot } from './snapshot';
import { pushWidgetSnapshot } from './bridge';

export function useTodayWidgetSync(
  habits: Habit[] | undefined,
  completionsForDate: Completion[] | undefined,
  selectedDate: DateKey | null,
  today: DateKey | null,
  everCompletedHabitIds: ReadonlySet<string>,
): void {
  // Last-pushed content (minus updatedAt) so identical days don't re-push.
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!habits || !today || !selectedDate) return;
    // Only mirror the widget when the app is showing today.
    if (selectedDate !== today) return;

    const view = buildDayView(
      habits,
      completionsForDate ?? [],
      today,
      today,
      everCompletedHabitIds,
    );
    const snapshot = buildWidgetSnapshot(view, today, new Date().toISOString());

    const { updatedAt: _ignored, ...content } = snapshot;
    const key = JSON.stringify(content);
    if (key === lastKey.current) return;
    lastKey.current = key;

    void pushWidgetSnapshot(snapshot);
  }, [habits, completionsForDate, selectedDate, today, everCompletedHabitIds]);
}
