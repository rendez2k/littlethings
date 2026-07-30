'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Plant } from '@/components/garden/plant';
import { FireflyField } from '@/components/garden/motion';
import { isScreenshotMode, applyScreenshotMode } from '@/lib/screenshot-mode';

const ONBOARDED_KEY = 'little-things.onboarded.v1';

interface Slide {
  eyebrow: string;
  plant: number;
  title: ReactNode;
  body: string;
  cta: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'Little Things · a garden',
    plant: 4,
    title: (
      <>
        Plant a habit.
        <br />
        <em style={{ color: 'var(--gd-bloom)' }}>Watch it grow.</em>
      </>
    ),
    body: 'Each habit is a plant. Show up, it grows. Miss a day, it wilts a little — but it forgives.',
    cta: 'Continue',
  },
  {
    eyebrow: 'How it works',
    plant: 2,
    title: (
      <>
        A <em>quiet</em> ritual.
      </>
    ),
    body: 'Open the app once a day. Tap a plant when you tend it. That’s the whole ritual.',
    cta: 'Continue',
  },
  {
    eyebrow: 'Ready',
    plant: 0,
    title: (
      <>
        Plant your <em style={{ color: 'var(--gd-gold)' }}>first seed</em>.
      </>
    ),
    body: 'Start with something small enough that "tomorrow" isn’t a good excuse.',
    cta: 'Plant your first  ›',
  },
];

/** First-run garden intro. Full-screen overlay gated on a localStorage flag. */
export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    try {
      if (isScreenshotMode()) {
        void applyScreenshotMode();
        return;
      }
      if (!localStorage.getItem(ONBOARDED_KEY)) setOpen(true);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  if (!open) return null;

  const s = SLIDES[slide]!;
  const finish = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* no-op */
    }
    setOpen(false);
  };
  const next = () => {
    if (slide === SLIDES.length - 1) finish();
    else setSlide((n) => n + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Little Things"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        padding: 'calc(60px + env(safe-area-inset-top)) 32px calc(32px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, oklch(0.22 0.03 160), var(--gd-bg))',
      }}
    >
      <FireflyField count={7} />

      <div className="gd-eyebrow" style={{ position: 'relative', zIndex: 1 }}>
        {s.eyebrow}
      </div>

      <div
        key={slide}
        className="gd-anim-grow"
        style={{ display: 'flex', justifyContent: 'center', marginTop: 40, marginBottom: 24, position: 'relative', zIndex: 1 }}
      >
        <Plant stage={s.plant} color="var(--gd-moss)" size={140} />
      </div>

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 className="gd-h1" style={{ fontSize: 40, lineHeight: 1.05 }}>
          {s.title}
        </h1>
        <p className="gd-body" style={{ marginTop: 20, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', color: 'var(--gd-cream-soft)' }}>
          {s.body}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slide ? 24 : 6,
                height: 3,
                borderRadius: 3,
                background: i === slide ? 'var(--gd-moss)' : 'var(--gd-hair)',
                transition: 'width 300ms cubic-bezier(0.16,1,0.3,1), background 300ms',
              }}
            />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <button type="button" className="gd-btn gd-btn--primary" onClick={next}>
          {s.cta}
        </button>
      </div>
    </div>
  );
}
