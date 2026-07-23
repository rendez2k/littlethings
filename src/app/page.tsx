'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { PlaceholderPanel } from '@/components/ui/placeholder-panel';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { Welcome } from '@/components/today/welcome';
import { DateStrip } from '@/components/today/date-strip';
import { TodayHabitCard } from '@/components/today/today-habit-card';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import { useActiveHabits, useAllCompletions, useCompletionsForDate } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { buildDayView } from '@/features/completions/day-view';
import { computeStreak, type StreakResult } from '@/features/streaks/streak';
import type { Completion } from '@/features/completions/schemas';
import { encouragement } from '@/features/encouragement/messages';
import { fromDateKey, todayKey, type DateKey } from '@/lib/dates';

export default function TodayPage() {
  const habits = useActiveHabits();
  const settings = useAppSettings();
  const { openCreate } = useHabitEditor();
  const router = useRouter();

  const [today, setToday] = useState<DateKey | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateKey | null>(null);
  useEffect(() => {
    const t = todayKey(new Date());
    setToday(t);
    setSelectedDate(t);
  }, []);

  const completionsForDate = useCompletionsForDate(selectedDate ?? '');
  const allCompletions = useAllCompletions();

  const dateLabel = useMemo(() => {
    if (!selectedDate) return ' ';
    return fromDateKey(selectedDate).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [selectedDate]);

  // Group all completion records by habit so streaks are computed in memory.
  const completionsByHabit = useMemo(() => {
    const grouped = new Map<string, Completion[]>();
    for (const c of allCompletions ?? []) {
      const list = grouped.get(c.habitId) ?? [];
      list.push(c);
      grouped.set(c.habitId, list);
    }
    return grouped;
  }, [allCompletions]);

  // Habit ids completed at least once — lets one-offs linger on today until done.
  const everCompletedHabitIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of allCompletions ?? []) {
      if (!c.deletedAt) ids.add(c.habitId);
    }
    return ids;
  }, [allCompletions]);

  if (habits === undefined || today === null || selectedDate === null) {
    return <PageHeader title="Today" subtitle=" " />;
  }

  if (habits.length === 0) {
    return <Welcome />;
  }

  const view = buildDayView(
    habits,
    completionsForDate ?? [],
    selectedDate,
    today,
    everCompletedHabitIds,
  );
  const isToday = selectedDate === today;
  const doneCount = view.summary.completed + view.summary.skipped;
  const encourageLine = settings.showMotivationalMessages
    ? encouragement({
        name: settings.displayName,
        completed: doneCount,
        total: view.summary.total,
        seed: Number(selectedDate.slice(8, 10)),
      })
    : 'Keep going — small things add up.';

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={dateLabel}
        action={
          <Button
            size="sm"
            aria-label="Add habit"
            className="h-11 w-11 p-0"
            onClick={() => openCreate()}
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
          </Button>
        }
      />

      <DateStrip
        selectedDate={selectedDate}
        today={today}
        weekStartsOn={settings.weekStartsOn}
        onSelect={setSelectedDate}
      />

      {view.summary.total > 0 ? (
        <div className="mb-4 flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 shadow-card">
          <div>
            <p className="text-sm font-semibold text-text">
              {view.summary.completed + view.summary.skipped} of {view.summary.total} complete
            </p>
            <p className="text-xs text-muted">{isToday ? encourageLine : dateLabel}</p>
          </div>
          <ProgressRing
            ratio={view.summary.ratio}
            label={`${view.summary.completed + view.summary.skipped} of ${view.summary.total} complete`}
          />
        </div>
      ) : null}

      {!isToday ? (
        <button
          type="button"
          onClick={() => setSelectedDate(today)}
          className="mb-3 text-sm font-medium text-primary"
        >
          ← Back to today
        </button>
      ) : null}

      {view.entries.length === 0 ? (
        <PlaceholderPanel
          icon={CalendarClock}
          title="Nothing planned."
          description={
            isToday
              ? 'None of your habits are scheduled today. Enjoy the breather, or add something new.'
              : 'Nothing was scheduled on this day.'
          }
          action={
            isToday ? (
              <Button onClick={() => openCreate()}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add a habit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {view.entries.map((entry) => {
            const streak: StreakResult = computeStreak(
              entry.habit,
              completionsByHabit.get(entry.habit.id) ?? [],
              today,
              settings.weekStartsOn,
            );
            return (
              <li key={entry.habit.id} className="motion-safe:animate-row-in">
                <TodayHabitCard
                  entry={entry}
                  streak={streak}
                  date={selectedDate}
                  today={today}
                  showStreak={settings.showStreaks}
                  onOpen={(habit) => router.push(`/habits/${habit.id}`)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
