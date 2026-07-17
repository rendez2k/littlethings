'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useAppearance } from '@/components/theme/appearance-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HabitActionsMenu } from '@/components/habits/habit-actions-menu';
import { MonthCalendar } from '@/components/habits/month-calendar';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import { getCompletionService, useCompletionsForHabit, useHabit } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { getHabitIcon } from '@/features/habits/icons';
import { getHabitAccent } from '@/features/habits/colors';
import { scheduleLabel } from '@/features/habits/labels';
import { computeHabitStats } from '@/features/completions/stats';
import { deriveDayStatus } from '@/features/completions/logic';
import type { Completion } from '@/features/completions/schemas';
import { fromDateKey, monthKeyOf, todayKey, type DateKey } from '@/lib/dates';

function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number) as [number, number];
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function HabitDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const habit = useHabit(id);
  const completions = useCompletionsForHabit(id);
  const settings = useAppSettings();
  const { resolvedTheme } = useAppearance();
  const { openEdit } = useHabitEditor();

  const [today, setToday] = useState<DateKey | null>(null);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  useEffect(() => {
    const t = todayKey(new Date());
    setToday(t);
    setMonthKey(monthKeyOf(t));
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<DateKey, Completion>();
    for (const c of completions ?? []) if (!c.deletedAt) map.set(c.date, c);
    return map;
  }, [completions]);

  if (habit === undefined || today === null || monthKey === null) {
    return <div className="pt-6 text-sm text-muted">Loading…</div>;
  }
  if (habit === null) {
    return (
      <div className="pt-10 text-center">
        <p className="text-muted">This habit no longer exists.</p>
        <Button className="mt-4" onClick={() => router.push('/habits')}>
          Back to habits
        </Button>
      </div>
    );
  }

  const Icon = getHabitIcon(habit.icon);
  const accent = getHabitAccent(habit.color, resolvedTheme);
  const stats = computeHabitStats(habit, completions ?? [], today, settings.weekStartsOn);
  const currentMonth = monthKeyOf(today);

  const onCycle = (date: DateKey) => {
    const service = getCompletionService();
    const status = deriveDayStatus(habit, byDay.get(date), date, today);
    if (status === 'complete') service.skip(habit.id, date);
    else if (status === 'skipped') service.clear(habit.id, date);
    else service.complete(habit.id, date);
  };

  const recent = (completions ?? [])
    .filter((c) => !c.deletedAt)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between py-3">
        <button
          type="button"
          onClick={() => router.push('/habits')}
          aria-label="Back to habits"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-text"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <HabitActionsMenu
          habit={habit}
          onEdit={openEdit}
          onDeleted={() => router.push('/habits')}
        />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: accent.soft, color: accent.accent }}
          aria-hidden="true"
        >
          <Icon className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-text">{habit.name}</h1>
          <p className="text-sm text-muted">
            {scheduleLabel(habit.schedule)}
            {habit.status === 'paused' ? ' · Paused' : ''}
            {habit.status === 'archived' ? ' · Archived' : ''}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Stat
          label={`Current ${unitLabel(stats.current, stats.unit)}`}
          value={String(stats.current)}
        />
        <Stat label={`Best ${unitLabel(stats.best, stats.unit)}`} value={String(stats.best)} />
        <Stat
          label="Completion"
          value={stats.opportunities === 0 ? '—' : `${Math.round(stats.completionRate * 100)}%`}
        />
      </div>

      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonthKey(shiftMonth(monthKey, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-text"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="text-sm font-semibold text-text">
            {fromDateKey(`${monthKey}-01`).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonthKey(shiftMonth(monthKey, 1))}
            disabled={monthKey >= currentMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-text disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <MonthCalendar
          habit={habit}
          byDay={byDay}
          monthKey={monthKey}
          today={today}
          weekStartsOn={settings.weekStartsOn}
          onCycle={onCycle}
        />
        <p className="mt-3 text-xs text-muted">
          Tap a day to cycle done → skipped → clear. Nothing here is ever a failure.
        </p>
      </Card>

      {habit.notes ? (
        <Card className="mb-6">
          <h2 className="mb-1 text-sm font-semibold text-text">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{habit.notes}</p>
        </Card>
      ) : null}

      <section className="mb-6">
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Recent history
        </h2>
        {recent.length === 0 ? (
          <p className="px-1 text-sm text-muted">No history yet — tap a day above to log one.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-text">
                  {fromDateKey(c.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="capitalize text-muted">
                  {c.state === 'complete'
                    ? habit.target.type === 'boolean'
                      ? 'Completed'
                      : `${c.value}${habit.target.type === 'duration' ? ' min' : ''}`
                    : 'Skipped'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Button variant="secondary" className="w-full" onClick={() => openEdit(habit)}>
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit habit
      </Button>
    </div>
  );
}

function unitLabel(value: number, unit: 'day' | 'week' | 'month'): string {
  return value === 1 ? unit : `${unit}s`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-3 text-center shadow-card">
      <p className="text-xl font-bold text-text">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
