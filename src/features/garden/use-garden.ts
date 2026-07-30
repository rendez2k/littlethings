'use client';

import { useMemo } from 'react';
import { useActiveHabits, useAllCompletions, useCompletionsForDate } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { buildDayView, everResolvedHabitIds } from '@/features/completions/day-view';
import { computeStreak } from '@/features/streaks/streak';
import { targetProgress } from '@/features/completions/logic';
import { targetLabel } from '@/features/habits/labels';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import type { DayStatus } from '@/features/completions/logic';
import { frequencyLabel, gardenColorVar, stageFromStreak } from '@/components/garden/mapping';
import { todayKey } from '@/lib/dates';

export interface GardenHabit {
  habit: Habit;
  current: number;
  best: number;
  stage: number;
  colorVar: string;
  frequency: string;
}

export interface GardenEntry extends GardenHabit {
  status: DayStatus;
  done: boolean;
  /** e.g. "5 / 8 glasses" for count/duration habits with progress today. */
  progress: string | null;
}

function completionsByHabit(all: Completion[] | undefined): Map<string, Completion[]> {
  const map = new Map<string, Completion[]>();
  for (const c of all ?? []) {
    const list = map.get(c.habitId) ?? [];
    list.push(c);
    map.set(c.habitId, list);
  }
  return map;
}

function enrich(habit: Habit, byHabit: Map<string, Completion[]>, today: string, weekStartsOn: 0 | 1): GardenHabit {
  const streak = computeStreak(habit, byHabit.get(habit.id) ?? [], today, weekStartsOn);
  return {
    habit,
    current: streak.current,
    best: streak.best,
    stage: stageFromStreak(streak.current),
    colorVar: gardenColorVar(habit.color),
    frequency: frequencyLabel(habit.schedule.type),
  };
}

/** All active habits, enriched for the Plants / Season screens. */
export function useGardenHabits(): GardenHabit[] | undefined {
  const habits = useActiveHabits();
  const all = useAllCompletions();
  const settings = useAppSettings();
  return useMemo(() => {
    if (!habits) return undefined;
    const byHabit = completionsByHabit(all);
    const today = todayKey(new Date());
    return habits
      .map((h) => enrich(h, byHabit, today, settings.weekStartsOn))
      .sort((a, b) => b.current - a.current);
  }, [habits, all, settings.weekStartsOn]);
}

/** Today's plot: scheduled entries with done state + progress, plus a summary. */
export function useGardenToday(): { entries: GardenEntry[]; doneCount: number; total: number } | undefined {
  const habits = useActiveHabits();
  const all = useAllCompletions();
  const settings = useAppSettings();
  const today = todayKey(new Date());
  const forDate = useCompletionsForDate(today);

  return useMemo(() => {
    if (!habits || forDate === undefined || all === undefined) return undefined;
    const byHabit = completionsByHabit(all);
    const resolved = everResolvedHabitIds(habits, all);
    const view = buildDayView(habits, forDate, today, today, resolved);

    const entries: GardenEntry[] = view.entries.map((e) => {
      const base = enrich(e.habit, byHabit, today, settings.weekStartsOn);
      const done = e.status === 'complete' || e.status === 'skipped';
      let progress: string | null = null;
      if (e.habit.target.type !== 'boolean' && e.completion && !e.completion.deletedAt) {
        const { value, goal } = targetProgress(e.habit.target, e.completion.value);
        if (value > 0 && value < goal) progress = `${value} / ${targetLabel(e.habit.target)}`;
      }
      return { ...base, status: e.status, done, progress };
    });

    return { entries, doneCount: view.summary.completed + view.summary.skipped, total: view.summary.total };
  }, [habits, all, forDate, settings.weekStartsOn, today]);
}
