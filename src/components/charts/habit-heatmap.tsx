'use client';

import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitAccent } from '@/features/habits/colors';
import { buildHeatmap } from '@/features/insights/heatmap';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import type { DateKey, WeekStart } from '@/lib/dates';

const LEVEL_ALPHA = [0, 0.26, 0.48, 0.72, 1] as const;

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.slice(0, 2), 16),
    parseInt(c.slice(2, 4), 16),
    parseInt(c.slice(4, 6), 16),
  ];
}

interface Props {
  habit: Habit;
  completions: Completion[];
  today: DateKey;
  weekStartsOn: WeekStart;
  weeks?: number;
  cell?: number;
  gap?: number;
  showLegend?: boolean;
  ariaLabel?: string;
}

/** A per-habit contribution heatmap in the habit's accent colour. */
export function HabitHeatmap({
  habit,
  completions,
  today,
  weekStartsOn,
  weeks = 15,
  cell = 11,
  gap = 3,
  showLegend = false,
  ariaLabel,
}: Props) {
  const { resolvedTheme } = useAppearance();
  const { accent } = getHabitAccent(habit.color, resolvedTheme);
  const [r, g, b] = hexToRgb(accent);

  const colorFor = (level: number): string =>
    level <= 0 ? 'rgb(var(--color-border))' : `rgba(${r}, ${g}, ${b}, ${LEVEL_ALPHA[level]})`;

  const columns = buildHeatmap(habit, completions, today, weeks, weekStartsOn);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex"
        style={{ gap }}
        role="img"
        aria-label={ariaLabel ?? `${habit.name} history heatmap`}
      >
        {columns.map((column, i) => (
          <div key={i} className="flex flex-col" style={{ gap }}>
            {column.map((c) => (
              <div
                key={c.date}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: Math.max(2, Math.round(cell / 4)),
                  backgroundColor: c.future ? 'transparent' : colorFor(c.level),
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {showLegend ? (
        <div className="flex items-center justify-end gap-1.5 text-[0.65rem] text-muted">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: colorFor(lvl),
                display: 'inline-block',
              }}
            />
          ))}
          <span>More</span>
        </div>
      ) : null}
    </div>
  );
}
