'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { Card } from '@/components/ui/card';
import { getHabitIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { computeStreak } from '@/features/streaks/streak';
import { HabitHeatmap } from '@/components/charts/habit-heatmap';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import type { DateKey, WeekStart } from '@/lib/dates';

interface Props {
  habit: Habit;
  completions: Completion[];
  today: DateKey;
  weekStartsOn: WeekStart;
}

/** One habit's contribution history: icon, name, streaks and a heatmap. */
export function HabitHistoryCard({ habit, completions, today, weekStartsOn }: Props) {
  const { resolvedTheme } = useAppearance();
  const Icon = getHabitIcon(habit.icon);
  const { accent, soft } = getHabitAccent(habit.color, resolvedTheme);
  const streak = computeStreak(habit, completions, today, weekStartsOn);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: soft, color: accent }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-text">{habit.name}</p>
          <p className="text-xs text-muted">
            {streak.current} current · {streak.best} best
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <HabitHeatmap
          habit={habit}
          completions={completions}
          today={today}
          weekStartsOn={weekStartsOn}
          showLegend
        />
      </div>
    </Card>
  );
}
