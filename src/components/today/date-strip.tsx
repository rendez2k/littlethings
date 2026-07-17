'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  addDays,
  fromDateKey,
  startOfWeekKey,
  weekdayOf,
  type DateKey,
  type WeekStart,
} from '@/lib/dates';

const WEEKDAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DateStripProps {
  selectedDate: DateKey;
  today: DateKey;
  weekStartsOn: WeekStart;
  onSelect: (date: DateKey) => void;
}

/** Week date-strip for moving between nearby days (brief §7.2). */
export function DateStrip({ selectedDate, today, weekStartsOn, onSelect }: DateStripProps) {
  const weekStart = startOfWeekKey(selectedDate, weekStartsOn);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayWeekStart = startOfWeekKey(today, weekStartsOn);
  const canGoNext = weekStart < todayWeekStart;

  const shiftWeek = (delta: number) => {
    const next = addDays(selectedDate, delta * 7);
    onSelect(next > today ? today : next);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => shiftWeek(-1)}
          className="flex h-9 w-7 items-center justify-center rounded-lg text-muted hover:text-text"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="grid flex-1 grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = day === selectedDate;
            const isToday = day === today;
            const isFutureDay = day > today;
            const dayNum = fromDateKey(day).getDate();
            return (
              <button
                key={day}
                type="button"
                aria-pressed={isSelected}
                aria-label={fromDateKey(day).toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
                disabled={isFutureDay}
                onClick={() => onSelect(day)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl py-1.5 transition',
                  isFutureDay && 'opacity-35',
                  isSelected ? 'bg-primary text-primary-foreground' : 'text-text hover:bg-surface',
                )}
              >
                <span
                  className={cn(
                    'text-[0.65rem] font-medium uppercase',
                    isSelected ? 'text-primary-foreground/80' : 'text-muted',
                  )}
                >
                  {WEEKDAY_LETTER[weekdayOf(day)]}
                </span>
                <span className={cn('text-sm font-semibold tabular-nums')}>{dayNum}</span>
                <span
                  className={cn(
                    'h-1 w-1 rounded-full',
                    isToday && !isSelected
                      ? 'bg-primary'
                      : isSelected
                        ? 'bg-primary-foreground'
                        : 'bg-transparent',
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Next week"
          onClick={() => shiftWeek(1)}
          disabled={!canGoNext}
          className="flex h-9 w-7 items-center justify-center rounded-lg text-muted hover:text-text disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
