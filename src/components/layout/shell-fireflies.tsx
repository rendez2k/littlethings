'use client';

import { useEffect, useState } from 'react';

interface Fly {
  id: number;
  left: number;
  top: number;
  delay: number;
  dur: number;
  size: number;
}

/**
 * Ambient fireflies drifting in the dusk margins around the framed app on
 * desktop. Renders nothing on phones (where the app is full-bleed) and nothing
 * for reduced-motion users. Positions are set after mount, so it's SSR-safe.
 */
export function ShellFireflies() {
  const [flies, setFlies] = useState<Fly[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 820px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const build = () => {
      if (!wide.matches) {
        setFlies([]);
        return;
      }
      setReduced(rm.matches);
      setFlies(
        Array.from({ length: 18 }).map((_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: 6 + Math.random() * 88,
          delay: Math.random() * 7,
          dur: 9 + Math.random() * 7,
          size: 2 + Math.random() * 2.5,
        })),
      );
    };
    build();
    wide.addEventListener('change', build);
    rm.addEventListener('change', build);
    return () => {
      wide.removeEventListener('change', build);
      rm.removeEventListener('change', build);
    };
  }, []);

  if (flies.length === 0) return null;

  return (
    <div className="gd-shell-flies" aria-hidden="true">
      {flies.map((f) => (
        <span
          key={f.id}
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            animation: reduced ? undefined : `gd-firefly-drift ${f.dur}s ${f.delay}s ease-in-out infinite`,
            opacity: reduced ? 0.4 : undefined,
          }}
        />
      ))}
    </div>
  );
}
