'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { getCompletionService } from '@/features/habits/hooks';
import { useGardenToday, type GardenEntry } from '@/features/garden/use-garden';
import { PlantAnimated, FireflyField, AnimatedNumber, ScreenEnter } from '@/components/garden/motion';
import { todayKey } from '@/lib/dates';

function dateLabel(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function HabitTile({ entry, onCheck }: { entry: GardenEntry; onCheck: (id: string) => void }) {
  const [animating, setAnimating] = useState(false);
  const [ff, setFf] = useState(false);
  const check = () => {
    if (entry.done) return;
    setAnimating(true);
    setFf(true);
    setTimeout(() => onCheck(entry.habit.id), 260);
    setTimeout(() => {
      setAnimating(false);
      setFf(false);
    }, 900);
  };
  return (
    <button
      type="button"
      onClick={check}
      aria-label={entry.done ? `${entry.habit.name}, tended` : `Tend ${entry.habit.name}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 4px 6px',
        borderRadius: 12,
        background: entry.done ? 'var(--gd-moss-35)' : 'transparent',
        border: `1px solid ${entry.done ? 'var(--gd-moss)' : 'transparent'}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 220ms, border-color 220ms',
        color: 'var(--gd-cream)',
      }}
    >
      {entry.done ? (
        <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 11, color: 'var(--gd-moss)', fontWeight: 700 }}>✓</span>
      ) : null}
      <PlantAnimated stage={entry.stage} color={entry.colorVar} size={62} animate={animating ? 'grow' : null} fireflies={ff} />
      <div style={{ marginTop: 4, fontSize: 12, fontWeight: 500 }}>{entry.habit.name}</div>
      <div className="gd-numeric" style={{ fontSize: 9, color: 'var(--gd-cream-faint)' }}>
        {entry.current}d
      </div>
    </button>
  );
}

function HabitRow({ entry, onCheck }: { entry: GardenEntry; onCheck: (id: string) => void }) {
  const [animating, setAnimating] = useState(false);
  const check = () => {
    if (entry.done) return;
    setAnimating(true);
    setTimeout(() => onCheck(entry.habit.id), 200);
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        marginBottom: 6,
        borderRadius: 12,
        background: 'var(--gd-bg-soft)',
        border: '1px solid var(--gd-hair)',
      }}
    >
      <span className="gd-dot gd-dot--glow" style={{ color: entry.colorVar, background: entry.colorVar }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13 }}>{entry.habit.name}</div>
        {entry.progress ? (
          <div className="gd-numeric" style={{ fontSize: 10, color: 'var(--gd-cream-faint)', marginTop: 2 }}>
            {entry.progress}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={check}
        aria-label={`Tend ${entry.habit.name}`}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1.5px solid var(--gd-cream-faint)',
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
          transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
          transform: animating ? 'scale(1.15)' : 'scale(1)',
        }}
      />
    </div>
  );
}

export default function TodayPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const data = useGardenToday();

  const onCheck = (id: string) => {
    void getCompletionService().complete(id, todayKey(new Date()));
  };

  if (!mounted || !data) {
    return <div style={{ padding: '54px 22px' }} />;
  }

  const { entries, doneCount, total } = data;
  const remaining = entries.filter((e) => !e.done);

  return (
    <div style={{ padding: '54px 22px 16px' }}>
      <ScreenEnter stagger={40}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="gd-eyebrow">{dateLabel()}</div>
            <h1 className="gd-h1" style={{ fontSize: 'var(--gd-size-display-md)', marginTop: 2 }}>
              Your <em>garden</em>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/settings" aria-label="Settings" style={{ color: 'var(--gd-cream-faint)', display: 'flex' }}>
              <Settings2 size={18} aria-hidden="true" />
            </Link>
            <div style={{ fontFamily: 'var(--gd-font-display)', fontSize: 22, color: 'var(--gd-bloom)' }}>
              <AnimatedNumber value={doneCount} />/{total}
            </div>
          </div>
        </div>

        {total > 0 ? (
          <div className="gd-plot" style={{ marginTop: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {entries.map((e) => (
                <HabitTile key={e.habit.id} entry={e} onCheck={onCheck} />
              ))}
            </div>
            <div className="gd-soil" style={{ marginTop: 6 }} />
          </div>
        ) : (
          <div className="gd-card" style={{ marginTop: 22, textAlign: 'center', padding: 24 }}>
            <div className="gd-eyebrow gd-eyebrow--accent">Nothing planted yet</div>
            <div className="gd-quote" style={{ marginTop: 8 }}>
              &ldquo;Every garden starts with one seed.&rdquo;
            </div>
            <Link href="/plant" className="gd-btn gd-btn--accent" style={{ display: 'inline-block', marginTop: 16, textDecoration: 'none' }}>
              Plant your first
            </Link>
          </div>
        )}

        {remaining.length > 0 ? (
          <div style={{ marginTop: 20 }}>
            <div className="gd-eyebrow">Still to tend</div>
            <div style={{ marginTop: 8 }}>
              {remaining.map((e) => (
                <HabitRow key={e.habit.id} entry={e} onCheck={onCheck} />
              ))}
            </div>
          </div>
        ) : total > 0 ? (
          <div
            style={{
              marginTop: 24,
              padding: 20,
              borderRadius: 16,
              background: 'var(--gd-moss-35)',
              border: '1px solid var(--gd-moss)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <FireflyField count={8} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="gd-eyebrow gd-eyebrow--accent">Tended, all {total}.</div>
              <div className="gd-quote" style={{ marginTop: 8, fontSize: 20 }}>
                &ldquo;The evening is yours.&rdquo;
              </div>
            </div>
          </div>
        ) : null}
      </ScreenEnter>
    </div>
  );
}
