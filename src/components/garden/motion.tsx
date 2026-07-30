'use client';

/**
 * Garden's signature motion: grow / bloom / wilt on a plant, ambient fireflies,
 * a number that ticks up, a breathing CTA, and a staggered screen entrance.
 * Ported from the design handoff (PlantAnimated.jsx). All effects respect
 * `prefers-reduced-motion` and are hydration-safe (randomness runs after mount).
 */

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Plant } from './plant';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

type Anim = 'grow' | 'bloom' | 'wilt' | null;

interface Spark {
  id: number;
  dx: number;
  dy: number;
  delay: number;
}

export function PlantAnimated({
  stage = 3,
  color = 'var(--gd-moss)',
  size = 56,
  animate = null,
  fireflies = false,
}: {
  stage?: number;
  color?: string;
  size?: number;
  animate?: Anim;
  fireflies?: boolean;
}) {
  const [key, setKey] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    if (!animate) return;
    setKey((k) => k + 1);
    if (animate === 'grow' && fireflies) {
      const arr: Spark[] = Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * 2 * Math.PI + Math.random() * 0.6;
        const distance = 22 + Math.random() * 14;
        return { id: i, dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance, delay: 100 + i * 60 };
      });
      setSparks(arr);
      const t = setTimeout(() => setSparks([]), 1200);
      return () => clearTimeout(t);
    }
  }, [animate, fireflies]);

  const cls = animate === 'grow' ? 'gd-anim-grow' : animate === 'bloom' ? 'gd-anim-bloom' : animate === 'wilt' ? 'gd-anim-wilt' : '';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <div key={key} className={cls} style={{ transformOrigin: '50% 90%' }}>
        <Plant stage={stage} color={color} size={size} />
      </div>
      {sparks.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 4,
            height: 4,
            borderRadius: 4,
            background: 'var(--gd-gold)',
            boxShadow: '0 0 8px var(--gd-gold)',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--dx' as any]: `${s.dx}px`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ['--dy' as any]: `${s.dy}px`,
            animation: `gd-spark 700ms ${s.delay}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes gd-spark {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

interface Fly {
  id: number;
  left: number;
  top: number;
  delay: number;
  dur: number;
  size: number;
}

/** A scatter of drifting gold dots. Positions are set after mount (SSR-safe). */
export function FireflyField({ count = 6, color = 'var(--gd-gold)' }: { count?: number; color?: string }) {
  const reduced = usePrefersReducedMotion();
  const [flies, setFlies] = useState<Fly[]>([]);
  useEffect(() => {
    setFlies(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 70,
        delay: Math.random() * 4,
        dur: 8 + Math.random() * 4,
        size: 2 + Math.random() * 2,
      })),
    );
  }, [count]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
      {flies.map((f) => (
        <div
          key={f.id}
          style={{
            position: 'absolute',
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            borderRadius: 999,
            background: color,
            boxShadow: `0 0 ${f.size * 3}px ${color}`,
            opacity: reduced ? 0.5 : 0.6,
            animation: reduced ? undefined : `gd-firefly-drift ${f.dur}s ${f.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Ticks from the previous value up to `value` over `duration` (increments only). */
export function AnimatedNumber({ value, duration = 500, style }: { value: number; duration?: number; style?: CSSProperties }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const start = prev.current;
    const delta = value - start;
    if (delta === 0) return;
    if (reduced || delta < 0) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);
  return <span style={style}>{display}</span>;
}

/** A subtle pulsing scale to draw attention (Sunday review CTA). */
export function Breathing({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return (
    <div style={{ display: 'block', animation: reduced ? undefined : 'gd-breath 3000ms ease-in-out infinite' }}>{children}</div>
  );
}

/** Stagger children up 12px on mount via WAAPI (content is visible by default). */
export function ScreenEnter({ children, stagger = 40 }: { children: ReactNode; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced || !ref.current) return;
    Array.from(ref.current.children).forEach((el, i) => {
      const node = el as HTMLElement & { animate?: HTMLElement['animate'] };
      if (typeof node.animate !== 'function') return;
      try {
        node.animate(
          [
            { opacity: 0, transform: 'translateY(12px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 380, delay: i * stagger, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
        );
      } catch {
        /* animation optional */
      }
    });
  }, [stagger, reduced]);
  const arr = Children.toArray(children);
  return (
    <div ref={ref}>
      {arr.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </div>
  );
}
