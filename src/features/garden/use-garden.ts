'use client';

import { useMemo } from 'react';
import { useActiveHabits, useArchivedHabits, useAllCompletions, useCompletionsForDate } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { buildDayView, everResolvedHabitIds } from '@/features/completions/day-view';
import { computeStreak } from '@/features/streaks/streak';
import { goalValue } from '@/features/completions/logic';
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
  skipped: boolean;
  /** e.g. "5 / 8 glasses" for count/duration habits with progress today. */
  progress: string | null;
  /** Raw values so Today can render a stepper for count/duration habits. */
  targetType: 'boolean' | 'count' | 'duration';
  value: number;
  goal: number;
  step: number;
  unit: string;
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

/** Archived ("resting") plants, enriched, most-recent streak first. */
export function useGardenArchived(): GardenHabit[] | undefined {
  const habits = useArchivedHabits();
  const all = useAllCompletions();
  const settings = useAppSettings();
  return useMemo(() => {
    if (!habits) return undefined;
    const byHabit = completionsByHabit(all);
    const today = todayKey(new Date());
    return habits
      .map((h) => enrich(h, byHabit, today, settings.weekStartsOn))
      .sort((a, b) => b.best - a.best);
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
      const skipped = e.status === 'skipped';
      const target = e.habit.target;
      const value = e.completion && !e.completion.deletedAt ? e.completion.value : 0;
      const goal = goalValue(target);
      const step = target.type === 'duration' ? 5 : 1;
      const unit = target.type === 'duration' ? 'min' : target.type === 'count' ? target.unit : '';
      let progress: string | null = null;
      if (target.type !== 'boolean' && value > 0 && value < goal) {
        progress = `${value} / ${targetLabel(target)}`;
      }
      return { ...base, status: e.status, done, skipped, progress, targetType: target.type, value, goal, step, unit };
    });

    return { entries, doneCount: view.summary.completed + view.summary.skipped, total: view.summary.total };
  }, [habits, all, forDate, settings.weekStartsOn, today]);
}
