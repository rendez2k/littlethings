'use client';

import { useEffect, useState } from 'react';
import { getCompletionService } from '@/features/habits/hooks';
import { PlantAnimated } from '@/components/garden/motion';
import type { GardenEntry } from '@/features/garden/use-garden';
import { todayKey } from '@/lib/dates';

/**
 * A calm bottom sheet for tending one plant today. Handles every target type
 * (a single "tend it" for boolean, a −/+ stepper for count/duration) plus the
 * two escape hatches the plot tiles can't offer on their own: skip and undo.
 */
export function TendSheet({ entry, onClose }: { entry: GardenEntry; onClose: () => void }) {
  const service = getCompletionService();
  const habit = entry.habit;
  const date = todayKey(new Date());
  const [grow, setGrow] = useState(false);

  // Close on Escape, and lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const celebrate = () => {
    setGrow(true);
    window.setTimeout(() => setGrow(false), 900);
  };

  const tend = () => {
    if (!entry.done) celebrate();
    void service.complete(habit.id, date);
    window.setTimeout(onClose, 260);
  };
  const undo = () => {
    void service.clear(habit.id, date);
    onClose();
  };
  const skip = () => {
    void service.skip(habit.id, date);
    onClose();
  };
  const dec = () => {
    void service.increment(habit.id, date, -entry.step);
  };
  const inc = () => {
    if (entry.value < entry.goal && entry.value + entry.step >= entry.goal) celebrate();
    void service.increment(habit.id, date, entry.step);
  };

  const isCounted = entry.targetType !== 'boolean';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tend ${habit.name}`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'oklch(0.12 0.02 160 / 0.6)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-end',
        animation: 'gd-fade-in 200ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          background: 'linear-gradient(180deg, var(--gd-bg-soft), var(--gd-bg))',
          borderTop: '1px solid var(--gd-hair)',
          padding: '14px 22px calc(24px + env(safe-area-inset-bottom))',
          animation: 'gd-sheet-up 320ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--gd-hair-strong)', margin: '0 auto 14px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <PlantAnimated stage={entry.stage} color={entry.colorVar} size={84} animate={grow ? 'grow' : null} fireflies={grow} />
          <h2 className="gd-h2" style={{ fontSize: 22, marginTop: 8 }}>
            {habit.name}
          </h2>
          <div className="gd-eyebrow" style={{ marginTop: 4 }}>
            {entry.current} day{entry.current === 1 ? '' : 's'} · stage {entry.stage} of 4
          </div>
        </div>

        {entry.skipped ? (
          <div className="gd-card" style={{ marginTop: 18, padding: '12px 16px', textAlign: 'center' }}>
            <div className="gd-body-sm">Skipped today — the streak holds.</div>
          </div>
        ) : isCounted ? (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              <button type="button" aria-label={`Less ${habit.name}`} disabled={entry.value <= 0} onClick={dec} className="gd-step-btn">
                −
              </button>
              <div style={{ minWidth: 96, textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--gd-font-display)', fontSize: 34, color: entry.done ? entry.colorVar : 'var(--gd-cream)' }}>
                  {entry.value}
                </span>
                <span style={{ fontSize: 15, color: 'var(--gd-cream-faint)' }}> / {entry.goal}</span>
                {entry.unit ? <span style={{ fontSize: 13, color: 'var(--gd-cream-faint)', marginLeft: 4 }}>{entry.unit}</span> : null}
              </div>
              <button type="button" aria-label={`More ${habit.name}`} onClick={inc} className="gd-step-btn gd-step-btn--accent">
                +
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 18 }}>
            {entry.done ? (
              <button type="button" onClick={undo} className="gd-btn gd-btn--ghost" style={{ width: '100%' }}>
                Un-tend
              </button>
            ) : (
              <button type="button" onClick={tend} className="gd-btn gd-btn--primary" style={{ width: '100%' }}>
                Tend it
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          {entry.skipped ? (
            <button type="button" onClick={undo} className="gd-btn gd-btn--ghost" style={{ flex: 1 }}>
              Un-skip
            </button>
          ) : (
            <>
              {(isCounted && entry.done) || entry.done ? (
                <button type="button" onClick={undo} className="gd-btn gd-btn--ghost" style={{ flex: 1 }}>
                  Clear
                </button>
              ) : (
                <button type="button" onClick={skip} className="gd-btn gd-btn--ghost" style={{ flex: 1 }}>
                  Skip today
                </button>
              )}
              <button type="button" onClick={onClose} className="gd-btn gd-btn--ghost" style={{ flex: 1 }}>
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
