'use client';

import { useMemo } from 'react';
import { buildHeatmap } from '@/features/insights/heatmap';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import type { DateKey, WeekStart } from '@/lib/dates';

/** A day cell's fill: bare soil at level 0, then the plant's colour deepening. */
function fill(level: number, color: string): string {
  if (level <= 0) return 'var(--gd-hair)';
  const pct = level >= 4 ? 100 : level === 3 ? 72 : level === 2 ? 48 : 26;
  return `color-mix(in oklch, ${color} ${pct}%, transparent)`;
}

/**
 * A GitHub-style contribution grid for one habit, rendered in the garden
 * palette: week columns oldest → newest, the plant's colour deepening with
 * completion intensity. Scrolls horizontally inside its own container.
 */
export function GardenHeatmap({
  habit,
  completions,
  color,
  today,
  weeks,
  weekStartsOn,
}: {
  habit: Habit;
  completions: Completion[];
  color: string;
  today: DateKey;
  weeks: number;
  weekStartsOn: WeekStart;
}) {
  const columns = useMemo(
    () => buildHeatmap(habit, completions, today, weeks, weekStartsOn),
    [habit, completions, today, weeks, weekStartsOn],
  );

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'min-content' }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {col.map((cell) => (
              <div
                key={cell.date}
                title={cell.date}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  background: cell.future ? 'transparent' : fill(cell.level, color),
                  boxShadow: cell.level >= 4 ? '0 0 6px color-mix(in oklch, ' + color + ' 60%, transparent)' : 'none',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
