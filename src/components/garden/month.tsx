'use client';

import { useState } from 'react';
import { isSatisfied } from '@/features/completions/logic';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';
import type { WeekStart } from '@/lib/dates';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function key(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** A tappable month grid: tap any past/today cell to mark it tended or clear it. */
export function GardenMonth({
  habit,
  completions,
  color,
  weekStartsOn,
  onToggle,
}: {
  habit: Habit;
  completions: Completion[];
  color: string;
  weekStartsOn: WeekStart;
  onToggle: (date: string, kept: boolean) => void;
}) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const todayKeyStr = key(now.getFullYear(), now.getMonth(), now.getDate());

  const kept = new Set<string>();
  for (const c of completions) {
    if (c.deletedAt) continue;
    if (c.state === 'skipped' || isSatisfied(habit.target, c.value)) kept.add(c.date);
  }

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const header = [...Array(7)].map((_, i) => DOW[(i + weekStartsOn) % 7]);

  const step = (delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const monthLabel = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button type="button" aria-label="Previous month" onClick={() => step(-1)} style={{ background: 'none', border: 'none', color: 'var(--gd-cream-faint)', cursor: 'pointer', fontSize: 18, padding: '2px 8px' }}>
          ‹
        </button>
        <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 16 }}>{monthLabel}</div>
        <button type="button" aria-label="Next month" onClick={() => step(1)} style={{ background: 'none', border: 'none', color: 'var(--gd-cream-faint)', cursor: 'pointer', fontSize: 18, padding: '2px 8px' }}>
          ›
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {header.map((h, i) => (
          <div key={`h${i}`} className="gd-eyebrow" style={{ textAlign: 'center', fontSize: 8 }}>
            {h}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const k = key(view.y, view.m, d);
          const isKept = kept.has(k);
          const future = k > todayKeyStr;
          const isToday = k === todayKeyStr;
          return (
            <button
              key={k}
              type="button"
              disabled={future}
              aria-label={`${k}${isKept ? ', tended' : ''}`}
              aria-pressed={isKept}
              onClick={() => onToggle(k, isKept)}
              style={{
                aspectRatio: '1',
                borderRadius: 8,
                border: isToday ? '1px solid var(--gd-cream-faint)' : '1px solid transparent',
                background: isKept ? color : 'var(--gd-bg-soft-2)',
                color: isKept ? 'var(--gd-bg)' : future ? 'var(--gd-hair-strong)' : 'var(--gd-cream-soft)',
                fontFamily: 'var(--gd-font-mono)',
                fontSize: 11,
                cursor: future ? 'default' : 'pointer',
                opacity: future ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
