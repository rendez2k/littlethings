'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { CompletionControl } from '@/components/habits/completion-control';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import { useAppearance } from '@/components/theme/appearance-provider';
import { gardenColorVar } from '@/components/garden/mapping';
import { getHabitAccent } from '@/features/habits/colors';
import { getHabitIcon } from '@/features/habits/icons';
import { scheduleLabel } from '@/features/habits/labels';
import { emptyDraft } from '@/features/habits/draft';
import type { Habit } from '@/features/habits/schemas';
import { getCompletionService, useActiveHabits, useAllCompletions } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { everResolvedHabitIds, type DayEntry } from '@/features/completions/day-view';
import {
  groupCompletionsByDate,
  isOpenFlexibleDay,
  monthGrid,
  shiftMonth,
  summariseDays,
  type DaySummary,
} from '@/features/calendar/month';
import { fromDateKey, monthKeyOf, todayKey, type DateKey } from '@/lib/dates';

/** Habit labels shown per day before collapsing the rest into "+n more". */
const MAX_LABELS = 3;

function longDate(key: DateKey): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Both colours a habit needs here, in the vocabulary of the active look. */
interface HabitTint {
  accent: string;
  soft: string;
}

/**
 * The month view: every habit laid out on a calendar, a day to tap into, and
 * the same completion controls as Today for ticking things off. Styled with
 * the semantic tokens so it reads correctly in both looks; the garden shell
 * has no page padding, so garden mode adds its own inset.
 */
export function CalendarScreen() {
  const habits = useActiveHabits();
  const all = useAllCompletions();
  const settings = useAppSettings();
  const { appearance, resolvedTheme } = useAppearance();
  const garden = appearance.look === 'garden';
  const { openCreate } = useHabitEditor();
  const router = useRouter();

  const [today, setToday] = useState<DateKey | null>(null);
  const [selected, setSelected] = useState<DateKey | null>(null);
  const [monthKey, setMonthKey] = useState<string | null>(null);
  useEffect(() => {
    const t = todayKey(new Date());
    setToday(t);
    setSelected(t);
    setMonthKey(monthKeyOf(t));
  }, []);

  const weeks = useMemo(
    () => (monthKey ? monthGrid(monthKey, settings.weekStartsOn) : []),
    [monthKey, settings.weekStartsOn],
  );

  const days = useMemo(() => {
    if (!habits || !all || !today) return null;
    const byDate = groupCompletionsByDate(all);
    const resolved = everResolvedHabitIds(habits, all);
    return summariseDays(
      weeks.flat().map((c) => c.date),
      habits,
      byDate,
      today,
      resolved,
    );
  }, [habits, all, today, weeks]);

  const tint = (habit: Habit): HabitTint => {
    if (garden) {
      const accent = gardenColorVar(habit.color);
      return { accent, soft: `color-mix(in oklch, ${accent} 22%, transparent)` };
    }
    const a = getHabitAccent(habit.color, resolvedTheme);
    return { accent: a.accent, soft: a.soft };
  };

  const goToMonth = (next: string) => {
    if (!today) return;
    setMonthKey(next);
    // Keep the day panel on something in view: today when it's in this month,
    // otherwise the first of the month.
    setSelected(monthKeyOf(today) === next ? today : `${next}-01`);
  };

  const addOn = (date: DateKey) => {
    if (garden) router.push(`/plant?date=${date}`);
    else openCreate(emptyDraft(date));
  };

  // Section headings: the garden's display serif, or classic's bold sans.
  const headingClass = garden ? 'gd-h3' : 'text-base font-semibold text-text';

  const body =
    !today || !selected || !monthKey || !days ? (
      <PageHeader title="Calendar" backHref="/" backLabel={garden ? 'Garden' : 'Today'} />
    ) : (
      <>
        <PageHeader
          title="Calendar"
          backHref="/"
          backLabel={garden ? 'Garden' : 'Today'}
          action={
            <Button
              size="sm"
              aria-label="Add habit"
              className="h-11 w-11 p-0"
              onClick={() => addOn(selected)}
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
            </Button>
          }
        />

        <MonthNav
          monthKey={monthKey}
          currentMonth={monthKeyOf(today)}
          headingClass={headingClass}
          onChange={goToMonth}
        />

        <MonthGrid
          weeks={weeks}
          days={days}
          today={today}
          selected={selected}
          tint={tint}
          onSelect={setSelected}
          onAdd={addOn}
        />

        <MonthTally weeks={weeks} days={days} today={today} />

        <DayPanel
          date={selected}
          today={today}
          summary={days.get(selected)}
          tint={tint}
          headingClass={headingClass}
          onAdd={() => addOn(selected)}
        />
      </>
    );

  return garden ? <div style={{ padding: '54px 22px 24px' }}>{body}</div> : <div className="pb-4">{body}</div>;
}

function MonthNav({
  monthKey,
  currentMonth,
  headingClass,
  onChange,
}: {
  monthKey: string;
  currentMonth: string;
  headingClass: string;
  onChange: (monthKey: string) => void;
}) {
  const label = fromDateKey(`${monthKey}-01`).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const navClass =
    'flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-text';
  return (
    <div className="mb-2 flex items-center justify-between">
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => onChange(shiftMonth(monthKey, -1))}
        className={navClass}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex min-w-0 items-center gap-2">
        <h2 className={cn('truncate', headingClass)}>{label}</h2>
        {monthKey !== currentMonth ? (
          <button
            type="button"
            onClick={() => onChange(currentMonth)}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-primary"
          >
            Today
          </button>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Next month"
        onClick={() => onChange(shiftMonth(monthKey, 1))}
        className={navClass}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function MonthGrid({
  weeks,
  days,
  today,
  selected,
  tint,
  onSelect,
  onAdd,
}: {
  weeks: ReturnType<typeof monthGrid>;
  days: Map<DateKey, DaySummary>;
  today: DateKey;
  selected: DateKey;
  tint: (habit: Habit) => HabitTint;
  onSelect: (date: DateKey) => void;
  onAdd: (date: DateKey) => void;
}) {
  const headers = (weeks[0] ?? []).map((cell) =>
    fromDateKey(cell.date).toLocaleDateString(undefined, { weekday: 'short' }),
  );

  return (
    <div className="rounded-card border border-border bg-surface p-1.5 shadow-card sm:p-2">
      <div className="mb-1 grid grid-cols-7">
        {headers.map((h, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="truncate text-center text-[0.6rem] font-medium uppercase tracking-wide text-muted sm:text-[0.7rem]"
          >
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[3px] sm:gap-1">
        {weeks.flat().map((cell) => {
          if (!cell.inMonth) return <div key={cell.date} aria-hidden="true" />;
          const day = days.get(cell.date);
          const entries = day?.entries ?? [];
          const isToday = cell.date === today;
          const isSelected = cell.date === selected;
          const future = cell.date > today;
          const total = day?.total ?? 0;
          const summary =
            total > 0
              ? `${day?.done ?? 0} of ${total} done`
              : entries.length > 0
                ? 'nothing due'
                : 'nothing scheduled';
          const shown = entries.slice(0, MAX_LABELS);
          const extra = entries.length - shown.length;
          const dateLabel = longDate(cell.date);

          // Each date is a box: the day + its habits select the day (for the
          // panel below), and a "+" at the foot adds a habit starting that day.
          return (
            <div
              key={cell.date}
              className={cn(
                'flex min-h-[5rem] flex-col overflow-hidden rounded-lg border transition sm:min-h-[6rem]',
                isSelected ? 'border-primary bg-primary-soft' : 'border-border/60 bg-background',
              )}
            >
              <button
                type="button"
                data-date={cell.date}
                aria-label={`${dateLabel}: ${summary}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(cell.date)}
                className="flex min-w-0 flex-1 flex-col items-stretch px-[3px] pt-[3px] text-left sm:px-1 sm:pt-1"
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[0.7rem] font-semibold tabular-nums sm:text-xs',
                    isToday ? 'bg-primary text-primary-foreground' : future ? 'text-muted' : 'text-text',
                  )}
                >
                  {fromDateKey(cell.date).getDate()}
                </span>
                <span aria-hidden="true" className="mt-[3px] flex flex-col gap-[2px]">
                  {shown.map((e) => (
                    <HabitLabel key={e.habit.id} entry={e} future={future} tint={tint(e.habit)} />
                  ))}
                  {extra > 0 ? (
                    <span className="px-[3px] text-[0.55rem] font-medium leading-tight text-muted sm:text-[0.65rem]">
                      +{extra}
                    </span>
                  ) : null}
                </span>
              </button>
              <button
                type="button"
                data-add-date={cell.date}
                aria-label={`Add a habit on ${dateLabel}`}
                onClick={() => onAdd(cell.date)}
                className="mx-[3px] mb-[3px] flex h-6 shrink-0 items-center justify-center rounded-md text-muted/70 transition hover:bg-surface hover:text-text sm:mx-1 sm:mb-1"
              >
                <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One habit on one day, as a small labelled chip: a colour bar plus the name,
 * tinted when done, plain when still open, faint when nothing was due (a
 * future day, or a flexible habit's unlogged past day).
 */
function HabitLabel({ entry, future, tint }: { entry: DayEntry; future: boolean; tint: HabitTint }) {
  const done = entry.status === 'complete' || entry.status === 'skipped';
  const faint = future || isOpenFlexibleDay(entry);
  return (
    <span
      className="flex min-w-0 items-center gap-[3px] rounded-[3px] px-[3px] py-[1px] text-[0.55rem] leading-tight sm:text-[0.7rem]"
      style={
        done
          ? { backgroundColor: tint.soft, color: tint.accent, opacity: entry.status === 'skipped' ? 0.7 : 1 }
          : { color: 'rgb(var(--color-text))', opacity: faint ? 0.55 : 0.85 }
      }
    >
      <span
        className="h-[0.6rem] w-[3px] shrink-0 rounded-full"
        style={{ backgroundColor: tint.accent }}
      />
      <span className="truncate">{entry.habit.name}</span>
    </span>
  );
}

/** "12 of 20 done so far this month" — only days up to today count. */
function MonthTally({
  weeks,
  days,
  today,
}: {
  weeks: ReturnType<typeof monthGrid>;
  days: Map<DateKey, DaySummary>;
  today: DateKey;
}) {
  let done = 0;
  let total = 0;
  for (const cell of weeks.flat()) {
    if (!cell.inMonth || cell.date > today) continue;
    const day = days.get(cell.date);
    if (!day) continue;
    done += day.done;
    total += day.total;
  }
  if (total === 0) return null;
  return (
    <p className="mt-2 px-1 text-xs text-muted">
      {done} of {total} done so far this month
    </p>
  );
}

function DayPanel({
  date,
  today,
  summary,
  tint,
  headingClass,
  onAdd,
}: {
  date: DateKey;
  today: DateKey;
  summary: DaySummary | undefined;
  tint: (habit: Habit) => HabitTint;
  headingClass: string;
  onAdd: () => void;
}) {
  const entries = summary?.entries ?? [];
  const isToday = date === today;
  const past = date < today;

  return (
    <section aria-labelledby="calendar-day-heading" className="mt-5">
      <div className="mb-2 flex items-end justify-between gap-3 px-1">
        <h2 id="calendar-day-heading" className={cn('min-w-0 truncate', headingClass)}>
          {isToday ? 'Today' : longDate(date)}
        </h2>
        {summary && summary.total > 0 ? (
          <span className="shrink-0 text-xs text-muted">
            {summary.done} of {summary.total} done
          </span>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-card border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted">
            {past ? 'Nothing was scheduled this day.' : 'Nothing scheduled. Enjoy the breather 🍵'}
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={onAdd}>
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add a habit here
          </Button>
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <DayRow key={entry.habit.id} entry={entry} date={date} today={today} tint={tint(entry.habit)} />
            ))}
          </ul>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-card border border-dashed border-border text-sm font-medium text-muted hover:text-text"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add a habit on this day
          </button>
        </>
      )}
    </section>
  );
}

function statusLine(entry: DayEntry, future: boolean): string {
  switch (entry.status) {
    case 'complete':
      return 'Done 🌿';
    case 'skipped':
      return 'Skipped — the streak holds';
    case 'missed':
      // A flexible habit is judged per week/month, so an unlogged day isn't a
      // miss — just show what it is, and it can still be logged here.
      return isOpenFlexibleDay(entry) ? scheduleLabel(entry.habit.schedule) : 'Not logged';
    default:
      return future ? `Upcoming · ${scheduleLabel(entry.habit.schedule)}` : scheduleLabel(entry.habit.schedule);
  }
}

function DayRow({
  entry,
  date,
  today,
  tint,
}: {
  entry: DayEntry;
  date: DateKey;
  today: DateKey;
  tint: HabitTint;
}) {
  const { habit, completion, status } = entry;
  const Icon = getHabitIcon(habit.icon);
  const future = date > today;
  const done = status === 'complete' || status === 'skipped';
  // Skip only makes sense where something was due that day.
  const skippable = !future && !done && !isOpenFlexibleDay(entry);
  const service = getCompletionService();

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-card border border-border p-3',
        done ? 'bg-background' : 'bg-surface',
      )}
    >
      <Link
        href={`/habits/${habit.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
        aria-label={`Open ${habit.name}`}
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: tint.soft, color: tint.accent }}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 font-semibold leading-tight text-text">{habit.name}</span>
          <span className={cn('block truncate text-xs', status === 'complete' ? 'text-success' : 'text-muted')}>
            {statusLine(entry, future)}
          </span>
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        {status === 'skipped' ? (
          <button
            type="button"
            onClick={() => void service.clear(habit.id, date)}
            className="min-h-[2.25rem] rounded-full px-3 text-xs font-medium text-primary"
          >
            Undo skip
          </button>
        ) : (
          <>
            {skippable ? (
              <button
                type="button"
                aria-label={`Skip ${habit.name}`}
                onClick={() => void service.skip(habit.id, date)}
                className="min-h-[2.25rem] rounded-full px-2 text-xs font-medium text-muted hover:text-text"
              >
                Skip
              </button>
            ) : null}
            <CompletionControl
              habit={habit}
              completion={completion}
              status={status}
              date={date}
              disabled={future}
            />
          </>
        )}
      </div>
    </li>
  );
}
