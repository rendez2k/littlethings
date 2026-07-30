'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGardenHabits } from '@/features/garden/use-garden';
import { Plant } from '@/components/garden/plant';
import { ScreenEnter } from '@/components/garden/motion';

function AddSeedButton() {
  return (
    <Link
      href="/plant"
      aria-label="Plant a habit"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--gd-cream)',
        color: 'var(--gd-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        lineHeight: 1,
        fontWeight: 500,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      +
    </Link>
  );
}

export default function PlantsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const habits = useGardenHabits();

  if (!mounted || !habits) return <div style={{ padding: '54px 22px' }} />;

  return (
    <div style={{ padding: '54px 22px 16px' }}>
      <ScreenEnter stagger={40}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1 className="gd-h1" style={{ fontSize: 'var(--gd-size-display-md)' }}>
              All <em>plants</em>
            </h1>
            <div className="gd-body-sm" style={{ marginTop: 6 }}>
              {habits.length} growing {habits.length === 1 ? 'thing' : 'things'}.
            </div>
          </div>
          <AddSeedButton />
        </div>

        <div style={{ marginTop: 16 }}>
          {habits.length === 0 ? (
            <div className="gd-card" style={{ marginTop: 8, textAlign: 'center', padding: 24 }}>
              <div className="gd-body-sm">Nothing growing yet. Plant your first seed.</div>
            </div>
          ) : (
            habits.map((h) => (
              <Link
                key={h.habit.id}
                href={`/habits/${h.habit.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  marginBottom: 8,
                  borderRadius: 16,
                  background: 'var(--gd-bg-soft)',
                  border: '1px solid var(--gd-hair)',
                  textDecoration: 'none',
                  color: 'var(--gd-cream)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: 'var(--gd-bg-soft-2)',
                    border: '1px solid var(--gd-hair)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plant stage={h.stage} color={h.colorVar} size={44} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 17, lineHeight: 1.2 }}>{h.habit.name}</div>
                  <div className="gd-eyebrow" style={{ marginTop: 3 }}>
                    {h.frequency} · stage {h.stage} of 4
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 22, color: h.colorVar, lineHeight: 1 }}>{h.current}</div>
                  <div className="gd-eyebrow">days</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </ScreenEnter>
    </div>
  );
}
