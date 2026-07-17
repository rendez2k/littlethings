'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitAccent } from '@/features/habits/colors';
import { deriveDayStatus, type DayStatus } from '@/features/completions/logic';
import type { Completion } from '@/features/completions/schemas';
import type { Habit } from '@/features/habits/schemas';
import {
  addDays,
  daysInMonth,
  fromDateKey,
  startOfMonthKey,
  startOfWeekKey,
  type DateKey,
  type WeekStart,
} from '@/lib/dates';

const STATUS_TEXT: Record<DayStatus, string> = {
  complete: 'completed',
  partial: 'in progress',
  skipped: 'skipped',
  missed: 'missed',
  pending: 'not done yet',
  not_scheduled: 'not scheduled',
  paused: 'paused',
  future: 'upcoming',
};

interface Props {
  habit: Habit;
  byDay: Map<DateKey, Completion>;
  monthKey: string; // YYYY-MM
  today: DateKey;
  weekStartsOn: WeekStart;
  onCycle: (date: DateKey) => void;
}

export function MonthCalendar({ habit, byDay, monthKey, today, weekStartsOn, onCycle }: Props) {
  const { resolvedTheme } = useAppearance();
  const accent = getHabitAccent(habit.color, resolvedTheme);

  const first = startOfMonthKey(`${monthKey}-01`);
  const total = daysInMonth(first);
  const gridStart = startOfWeekKey(first, weekStartsOn);
  // Enough cells to cover the month from the aligned week start.
  const leading = Math.round(
    (fromDateKey(first).getTime() - fromDateKey(gridStart).getTime()) / 86_400_000,
  );
  const cellCount = Math.ceil((leading + total) / 7) * 7;

  const weekdayHeaders = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(gridStart, i);
    return { key: i, label: fromDateKey(d).toLocaleDateString(undefined, { weekday: 'narrow' }) };
  });

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekdayHeaders.map((h) => (
          <div key={h.key} className="text-center text-[0.65rem] font-medium uppercase text-muted">
            {h.label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: cellCount }, (_, i) => {
          const date = addDays(gridStart, i);
          const inMonth = date >= first && date <= addDays(first, total - 1);
          if (!inMonth) return <div key={date} aria-hidden="true" />;

          const status = deriveDayStatus(habit, byDay.get(date), date, today);
          const dayNum = fromDateKey(date).getDate();
          const editable = status !== 'not_scheduled' && status !== 'future' && status !== 'paused';
          const label = `${fromDateKey(date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}: ${STATUS_TEXT[status]}`;

          const style = cellStyle(status, accent);
          const common =
            'flex aspect-square items-center justify-center rounded-lg text-xs font-semibold tabular-nums';

          if (!editable) {
            return (
              <div
                key={date}
                className={common}
                style={style.container}
                aria-label={label}
                title={label}
              >
                <span style={style.text}>{dayNum}</span>
              </div>
            );
          }
          return (
            <button
              key={date}
              type="button"
              onClick={() => onCycle(date)}
              aria-label={`${label}. Tap to change.`}
              title={label}
              className={`${common} transition active:scale-90`}
              style={style.container}
            >
              <span style={style.text}>{dayNum}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function cellStyle(
  status: DayStatus,
  accent: { accent: string; soft: string; on: string },
): { container: React.CSSProperties; text: React.CSSProperties } {
  switch (status) {
    case 'complete':
      return { container: { backgroundColor: accent.accent }, text: { color: accent.on } };
    case 'partial':
      return { container: { backgroundColor: accent.soft }, text: { color: accent.accent } };
    case 'skipped':
      return {
        container: { border: '1px dashed rgb(var(--color-muted))' },
        text: { color: 'rgb(var(--color-muted))' },
      };
    case 'missed':
      return {
        container: { border: '1px solid rgb(var(--color-destructive) / 0.5)' },
        text: { color: 'rgb(var(--color-destructive))' },
      };
    case 'pending':
      return {
        container: { border: '2px solid rgb(var(--color-primary))' },
        text: { color: 'rgb(var(--color-text))' },
      };
    default:
      return { container: {}, text: { color: 'rgb(var(--color-muted) / 0.5)' } };
  }
}
