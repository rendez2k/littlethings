'use client';

/**
 * Reconcile completion toggles the user made from the home-screen widget.
 *
 * When the widget is tapped while the app isn't running, the native side queues
 * the change and the app applies it on the next launch/foreground. Each queued
 * toggle carries the *absolute* desired state (`done`), not a flip, so applying
 * it is idempotent and safe even if it already landed.
 */

import { createHabitRepository } from '@/features/habits/repository';
import { createCompletionRepository } from '@/features/completions/repository';
import { getCompletionService } from '@/features/habits/hooks';
import { buildDayView } from '@/features/completions/day-view';
import { todayKey } from '@/lib/dates';
import { buildWidgetSnapshot } from './snapshot';
import { drainPendingToggles, pushWidgetSnapshot } from './bridge';

/**
 * Drain any widget-initiated toggles and write them to the local data layer.
 * Returns how many were applied. Best-effort per toggle — a missing/deleted
 * habit is skipped rather than aborting the batch.
 */
export async function applyPendingWidgetToggles(): Promise<number> {
  const toggles = await drainPendingToggles();
  if (toggles.length === 0) return 0;

  const service = getCompletionService();
  let applied = 0;
  for (const t of toggles) {
    try {
      if (t.done) await service.complete(t.habitId, t.date);
      else await service.clear(t.habitId, t.date);
      applied += 1;
    } catch {
      // Habit may have been deleted since the widget rendered — ignore.
    }
  }
  return applied;
}

/**
 * Rebuild today's view from the current data and push it to the widget. Used to
 * correct the widget immediately after applying toggles, regardless of which
 * screen is showing. No-op on the web (the bridge swallows it).
 */
export async function pushTodayWidgetSnapshot(): Promise<void> {
  const today = todayKey(new Date());
  const habits = await createHabitRepository().getActive();
  const completions = createCompletionRepository();
  const [forDate, all] = await Promise.all([completions.getByDate(today), completions.getAll()]);

  // Habit ids completed at least once (getAll already excludes tombstones) — so
  // lingering one-offs match the Today screen's view exactly.
  const everCompleted = new Set<string>();
  for (const c of all) everCompleted.add(c.habitId);

  const view = buildDayView(habits, forDate, today, today, everCompleted);
  await pushWidgetSnapshot(buildWidgetSnapshot(view, today, new Date().toISOString()));
}
