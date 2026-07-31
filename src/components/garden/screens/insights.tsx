'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useActiveHabits, useAllCompletions } from '@/features/habits/hooks';
import { useAppSettings } from '@/features/settings/hooks';
import { isSatisfied } from '@/features/completions/logic';
import { useGardenHabits } from '@/features/garden/use-garden';
import { Plant } from '@/components/garden/plant';
import { GardenHeatmap } from '@/components/garden/heatmap';
import { AnimatedNumber, Breathing, ScreenEnter } from '@/components/garden/motion';
import { todayKey } from '@/lib/dates';
import type { Habit } from '@/features/habits/schemas';
import type { Completion } from '@/features/completions/schemas';

const DAY = 86_400_000;

type HistoryRange = '3m' | '6m' | '1y';
const HISTORY_WEEKS: Record<HistoryRange, number> = { '3m': 13, '6m': 26, '1y': 52 };
const HISTORY_OPTIONS: { value: HistoryRange; label: string }[] = [
  { value: '3m', label: '3m' },
  { value: '6m', label: '6m' },
  { value: '1y', label: '1y' },
];

function densityColor(d: number): string {
  return d >= 4
    ? 'var(--gd-moss)'
    : d === 3
      ? 'oklch(0.55 0.13 145)'
      : d === 2
        ? 'oklch(0.44 0.1 145)'
        : d === 1
          ? 'oklch(0.34 0.06 145)'
          : 'var(--gd-hair)';
}

function Cell({ density, index }: { density: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current as (HTMLDivElement & { animate?: HTMLElement['animate'] }) | null;
    if (!node || typeof node.animate !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      node.animate([{ transform: 'scale(0.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], {
        duration: 400,
        delay: index * 12,
        easing: 'cubic-bezier(0.16,1,0.3,1)',
        fill: 'backwards',
      });
    } catch {
      /* optional */
    }
  }, [index]);
  return (
    <div
      ref={ref}
      style={{ aspectRatio: '1', borderRadius: 4, background: densityColor(density), boxShadow: density >= 4 ? 'var(--gd-glow-moss)' : 'none' }}
    />
  );
}

export function GardenSeason() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyRange, setHistoryRange] = useState<HistoryRange>('3m');
  const habits = useActiveHabits();
  const all = useAllCompletions();
  const garden = useGardenHabits();
  const settings = useAppSettings();

  const byHabit = useMemo(() => {
    const map = new Map<string, Completion[]>();
    for (const c of all ?? []) {
      const list = map.get(c.habitId) ?? [];
      list.push(c);
      map.set(c.habitId, list);
    }
    return map;
  }, [all]);

  const density = useMemo(() => {
    if (!habits || all === undefined) return null;
    const byId = new Map<string, Habit>(habits.map((h) => [h.id, h]));
    const perDate = new Map<string, Set<string>>();
    for (const c of all) {
      if (c.deletedAt) continue;
      const h = byId.get(c.habitId);
      if (!h) continue;
      if (c.state === 'skipped' || isSatisfied(h.target, c.value)) {
        const set = perDate.get(c.date) ?? new Set<string>();
        set.add(c.habitId);
        perDate.set(c.date, set);
      }
    }
    const now = new Date();
    const cells: number[] = [];
    for (let i = 27; i >= 0; i--) {
      const day = new Date(now.getTime() - i * DAY);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      cells.push(Math.min(4, perDate.get(key)?.size ?? 0));
    }
    return cells;
  }, [habits, all]);

  if (!mounted || !density || !garden) return <div style={{ padding: '54px 22px' }} />;

  const now = new Date();
  const monthName = now.toLocaleDateString(undefined, { month: 'long' });
  const season = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'][now.getMonth()];
  const weekOf = new Date(now.getTime() - now.getDay() * DAY).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const tallest = garden[0];
  const anyGrowth = garden.some((g) => g.current > 0);

  return (
    <div style={{ padding: '54px 22px 16px' }}>
      <ScreenEnter stagger={50}>
        <div className="gd-eyebrow">
          {season} · week of {weekOf}
        </div>
        <h1 className="gd-h1" style={{ fontSize: 'var(--gd-size-display-md)', marginTop: 2 }}>
          Your garden is <em>{anyGrowth ? 'thriving' : 'waking'}</em>.
        </h1>

        <div className="gd-card" style={{ marginTop: 18, padding: 16 }}>
          <div className="gd-eyebrow">The shape of {monthName}</div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {density.map((d, i) => (
              <Cell key={i} density={d} index={i} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10, alignItems: 'center', fontSize: 10, color: 'var(--gd-cream-faint)' }}>
            <span>Bare</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div key={l} style={{ width: 10, height: 10, borderRadius: 2, background: densityColor(l) }} />
            ))}
            <span>Lush</span>
          </div>
        </div>

        {tallest ? (
          <div className="gd-card gd-card--accent" style={{ marginTop: 14, padding: 16 }}>
            <div className="gd-eyebrow gd-eyebrow--accent">Tallest plant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
              <Plant stage={tallest.stage} color={tallest.colorVar} size={50} />
              <div>
                <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 20 }}>{tallest.habit.name}</div>
                <div className="gd-body-sm">
                  <AnimatedNumber value={tallest.current} /> {tallest.current === 1 ? 'day' : 'days'} · longest {tallest.best}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {garden.length > 0 ? (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div className="gd-eyebrow">Each plot over time</div>
              <div style={{ display: 'flex', gap: 4 }} role="group" aria-label="History range">
                {HISTORY_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setHistoryRange(o.value)}
                    aria-pressed={historyRange === o.value}
                    className="gd-chip"
                    style={{ padding: '4px 12px', fontSize: 11 }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              {garden.map((g) => (
                <div key={g.habit.id} className="gd-card" style={{ marginBottom: 8, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <Plant stage={g.stage} color={g.colorVar} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 15, lineHeight: 1.2 }}>{g.habit.name}</div>
                      <div className="gd-eyebrow" style={{ marginTop: 2 }}>
                        {g.current} current · {g.best} best
                      </div>
                    </div>
                  </div>
                  <GardenHeatmap
                    habit={g.habit}
                    completions={byHabit.get(g.habit.id) ?? []}
                    color={g.colorVar}
                    today={todayKey(new Date())}
                    weeks={HISTORY_WEEKS[historyRange]}
                    weekStartsOn={settings.weekStartsOn}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="gd-card" style={{ marginTop: 14, padding: 16 }}>
          <div className="gd-eyebrow">A gentle note</div>
          <div className="gd-body" style={{ marginTop: 6, lineHeight: 1.5 }}>
            {anyGrowth
              ? 'Your garden is quieter on weekends. Is that rest, or slipping? A short walk on Sunday would carry a plant or two.'
              : 'The soil is ready. Tend one plant today and the season starts to turn.'}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <Breathing>
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="gd-card gd-card--warm"
              style={{ width: '100%', padding: 16, cursor: 'pointer', textAlign: 'left', color: 'var(--gd-cream)' }}
            >
              <div className="gd-eyebrow gd-eyebrow--warm">Sunday review · tap to open</div>
              <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 18, marginTop: 4, lineHeight: 1.3 }}>
                {reviewOpen ? 'The weekly walk is on its way — coming soon.' : 'Walk through the garden with me →'}
              </div>
            </button>
          </Breathing>
        </div>
      </ScreenEnter>
    </div>
  );
}
