'use client';

import { cn } from '@/lib/cn';
import type { WeekdayStat } from '@/features/insights/insights';
import type { Weekday } from '@/lib/dates';

const ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const LETTER: Record<Weekday, string> = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'T', 5: 'F', 6: 'S' };
const FULL: Record<Weekday, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/** Completion rate by weekday; the most consistent day is highlighted. */
export function WeekdayBars({
  weekdays,
  mostConsistent,
}: {
  weekdays: WeekdayStat[];
  mostConsistent: Weekday | null;
}) {
  const byIndex = new Map(weekdays.map((w) => [w.weekday, w]));

  return (
    <div className="flex items-end justify-between gap-2" style={{ height: '6rem' }}>
      {ORDER.map((wd) => {
        const stat = byIndex.get(wd);
        const rate = stat?.rate ?? 0;
        const hasData = (stat?.opportunities ?? 0) > 0;
        const highlight = mostConsistent === wd;
        const pct = Math.round(rate * 100);
        return (
          <div key={wd} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end">
              <div
                className={cn(
                  'w-full rounded-t-md transition-[height] duration-500 ease-ios',
                  !hasData && 'bg-border',
                  hasData && (highlight ? 'bg-primary' : 'bg-primary/35'),
                )}
                style={{ height: hasData ? `${Math.max(6, pct)}%` : '4px' }}
                role="img"
                aria-label={`${FULL[wd]}: ${hasData ? `${pct}% complete` : 'no data yet'}`}
              />
            </div>
            <span
              className={cn(
                'text-[0.65rem] font-medium',
                highlight ? 'text-primary' : 'text-muted',
              )}
            >
              {LETTER[wd]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
