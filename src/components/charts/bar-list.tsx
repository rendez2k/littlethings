'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitAccent } from '@/features/habits/colors';
import type { HabitPerformance } from '@/features/insights/insights';

/**
 * Habit-by-habit completion as labelled horizontal bars. Identity comes from the
 * row label and each habit's own colour; the percentage is shown directly.
 */
export function BarList({ items }: { items: HabitPerformance[] }) {
  const { resolvedTheme } = useAppearance();

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const { accent } = getHabitAccent(item.color, resolvedTheme);
        const pct = item.opportunities === 0 ? null : Math.round(item.rate * 100);
        return (
          <li key={item.habitId}>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium text-text">{item.name}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {pct === null ? '—' : `${pct}%`}
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-border"
              role="img"
              aria-label={`${item.name}: ${pct === null ? 'no data yet' : `${pct}% complete`}`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-ios"
                style={{ width: `${pct ?? 0}%`, backgroundColor: accent }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
