'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SeedEditor } from '@/components/garden/seed-editor';
import { useGoals, getGoalService } from '@/features/goals/hooks';
import type { Goal } from '@/features/goals/schemas';
import { Plant, Seed } from '@/components/garden/plant';
import { ScreenEnter } from '@/components/garden/motion';
import { seedTagColorVar, seedTagFor } from '@/components/garden/mapping';
import { fromDateKey } from '@/lib/dates';

function byLabel(goal: Goal): string {
  if (goal.done) return 'Sprouted';
  if (goal.targetDate) return fromDateKey(goal.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  return 'Someday';
}

export function GardenSeeds() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const goals = useGoals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const plant = (id: string) => {
    void getGoalService().toggleDone(id);
  };
  const move = (index: number, delta: number) => {
    if (!goals) return;
    const next = [...goals];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to]!, next[index]!];
    void getGoalService().reorder(next.map((g) => g.id));
  };

  if (!mounted || goals === undefined) return <div style={{ padding: '54px 22px' }} />;

  return (
    <div style={{ padding: '54px 22px 16px' }}>
      <ScreenEnter stagger={40}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1 className="gd-h1" style={{ fontSize: 'var(--gd-size-display-md)' }}>
              Seed{' '}
              <em style={{ color: 'var(--gd-gold)' }}>packet</em>
            </h1>
            <div className="gd-body-sm" style={{ marginTop: 6, maxWidth: 260 }}>
              Things you want to grow into being. Plant one when you&rsquo;re ready.
            </div>
          </div>
          <button
            type="button"
            onClick={openNew}
            aria-label="Add seed"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--gd-cream)',
              color: 'var(--gd-bg)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          {goals.length === 0 ? (
            <div className="gd-card" style={{ textAlign: 'center', padding: 24 }}>
              <div className="gd-body-sm">No seeds yet. What do you want to grow into being?</div>
            </div>
          ) : (
            goals.map((g, i) => {
              const tag = seedTagFor(i);
              const color = seedTagColorVar(tag);
              return (
                <div key={g.id} className="gd-card" style={{ marginBottom: 8, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(g);
                      setOpen(true);
                    }}
                    aria-label={`Edit ${g.title}`}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0, textAlign: 'left' }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        flexShrink: 0,
                        background: 'var(--gd-bg-soft-2)',
                        border: '1px solid var(--gd-hair)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {g.done ? <Plant stage={1} color={color} size={32} /> : <Seed color={color} size={26} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 17, color: 'var(--gd-cream)', lineHeight: 1.2 }}>{g.title}</div>
                      <div className="gd-eyebrow" style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                        <span style={{ color }}>{tag}</span>
                        <span>·</span>
                        <span>{byLabel(g)}</span>
                      </div>
                    </div>
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${g.title} up`}
                      style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: 'var(--gd-cream-faint)', opacity: i === 0 ? 0.25 : 1, padding: 2, display: 'flex' }}
                    >
                      <ChevronUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === goals.length - 1}
                      aria-label={`Move ${g.title} down`}
                      style={{ background: 'none', border: 'none', cursor: i === goals.length - 1 ? 'default' : 'pointer', color: 'var(--gd-cream-faint)', opacity: i === goals.length - 1 ? 0.25 : 1, padding: 2, display: 'flex' }}
                    >
                      <ChevronDown size={16} aria-hidden="true" />
                    </button>
                  </div>
                  {!g.done ? (
                    <button type="button" onClick={() => plant(g.id)} className="gd-btn gd-btn--ghost" style={{ padding: '6px 12px', fontSize: 11 }}>
                      Plant
                    </button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </ScreenEnter>

      {open ? <SeedEditor goal={editing} onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
