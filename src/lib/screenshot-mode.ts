'use client';

import { getHabitService, getCompletionService } from '@/features/habits/hooks';
import { HABIT_TEMPLATES } from '@/features/habits/templates';
import { todayKey, addDays } from '@/lib/dates';

const ONBOARDED_KEY = 'little-things.onboarded.v1';
const SEEDED_KEY = 'little-things.lkshot-seeded.v1';

/**
 * LaunchKit store-screenshot mode.
 *
 * LaunchKit's screenshot workflow captures the live web app and appends
 * `?lkshot=1` to every URL it shoots. This module lets the app react to that
 * marker so captures show the product in use rather than the first-run welcome
 * sheet (and the empty state behind it).
 */

/** True when the page is being captured by LaunchKit's screenshot workflow. */
export function isScreenshotMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has('lkshot');
  } catch {
    return false;
  }
}

// A small, tidy set that looks good across Today / Habits / Insights.
const SEED_TEMPLATE_IDS = ['drink-water', 'walk', 'meditate', 'read', 'stretch'];

/**
 * Prepare the app for a clean store screenshot: skip the welcome sheet and,
 * once, seed a few realistic habits with recent streaks so captures show a
 * populated app instead of the empty state. Idempotent and best-effort — a
 * failure simply yields an emptier screenshot, never a crash.
 */
export async function applyScreenshotMode(): Promise<void> {
  if (!isScreenshotMode()) return;

  // Never show onboarding while capturing.
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch {
    // Ignore storage errors.
  }

  // Seed exactly once per browser storage (each capture device starts fresh).
  try {
    if (localStorage.getItem(SEEDED_KEY) === '1') return;
  } catch {
    return;
  }

  const templates = SEED_TEMPLATE_IDS.map((id) =>
    HABIT_TEMPLATES.find((t) => t.id === id),
  ).filter((t): t is NonNullable<typeof t> => Boolean(t));

  const today = todayKey();
  // Anchor the habits a week back so the seeded completions fall within their
  // active range and streaks read as genuine.
  const startDate = addDays(today, -6);
  const habitSvc = getHabitService();
  const completionSvc = getCompletionService();

  try {
    for (let i = 0; i < templates.length; i++) {
      const habit = await habitSvc.create({
        ...templates[i]!.draft,
        startDate,
        endDate: null,
      });
      // Tick most of the last six days, with an occasional gap so the grid
      // looks natural rather than uniformly full.
      for (let d = 0; d < 6; d++) {
        if ((i + d) % 4 === 0) continue; // sprinkle a few misses
        await completionSvc.complete(habit.id, addDays(today, -d));
      }
    }
    localStorage.setItem(SEEDED_KEY, '1');
  } catch {
    // Seeding is best-effort; leave the app as-is on any error.
  }
}
