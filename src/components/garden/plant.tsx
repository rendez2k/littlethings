/**
 * The signature visual of Garden. A habit is a plant that grows through 5
 * stages as its streak builds. Ported from the design handoff (Plant.jsx).
 * Pure SVG — the stage→streak mapping lives in `mapping.ts`, not here.
 */
import type { CSSProperties } from 'react';

export type PlantStage = 0 | 1 | 2 | 3 | 4;

interface PlantProps {
  stage?: number;
  color?: string;
  bloomColor?: string;
  goldColor?: string;
  bg?: string;
  hair?: string;
  size?: number;
}

export function Plant({
  stage = 3,
  color = 'var(--gd-moss)',
  bloomColor = 'var(--gd-bloom)',
  goldColor = 'var(--gd-gold)',
  bg = 'var(--gd-bg)',
  hair = 'var(--gd-hair)',
  size = 56,
}: PlantProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 56 56',
    'aria-hidden': true as const,
    style: { display: 'block' } as CSSProperties,
  };
  const shadow = <ellipse cx="28" cy="48" rx={stage >= 3 ? 16 : 14} ry="2" fill={hair} opacity="0.6" />;

  if (stage <= 0) {
    return (
      <svg {...common}>
        {shadow}
        <circle cx="28" cy="44" r="3" fill={color} opacity="0.7" />
      </svg>
    );
  }
  if (stage === 1) {
    return (
      <svg {...common}>
        {shadow}
        <path d="M28 46 L28 36" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <ellipse cx="24" cy="36" rx="4" ry="2.5" fill={color} transform="rotate(-30 24 36)" />
        <ellipse cx="32" cy="36" rx="4" ry="2.5" fill={color} transform="rotate(30 32 36)" />
      </svg>
    );
  }
  if (stage === 2) {
    return (
      <svg {...common}>
        {shadow}
        <path d="M28 46 L28 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="20" cy="34" rx="6" ry="3" fill={color} transform="rotate(-30 20 34)" />
        <ellipse cx="36" cy="30" rx="6" ry="3" fill={color} transform="rotate(30 36 30)" />
        <ellipse cx="24" cy="24" rx="5" ry="2.5" fill={color} transform="rotate(-20 24 24)" />
      </svg>
    );
  }
  if (stage === 3) {
    return (
      <svg {...common}>
        {shadow}
        <path d="M28 46 L28 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="18" cy="36" rx="8" ry="3.5" fill={color} transform="rotate(-25 18 36)" />
        <ellipse cx="38" cy="32" rx="8" ry="3.5" fill={color} transform="rotate(25 38 32)" />
        <ellipse cx="20" cy="22" rx="7" ry="3" fill={color} transform="rotate(-20 20 22)" />
        <ellipse cx="36" cy="20" rx="7" ry="3" fill={color} transform="rotate(20 36 20)" />
        <ellipse cx="28" cy="14" rx="4" ry="2" fill={color} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      {shadow}
      <path d="M28 46 L28 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="18" cy="36" rx="8" ry="3.5" fill={color} transform="rotate(-25 18 36)" />
      <ellipse cx="38" cy="32" rx="8" ry="3.5" fill={color} transform="rotate(25 38 32)" />
      <ellipse cx="20" cy="22" rx="7" ry="3" fill={color} transform="rotate(-20 20 22)" />
      <ellipse cx="36" cy="20" rx="7" ry="3" fill={color} transform="rotate(20 36 20)" />
      <circle cx="28" cy="12" r="5" fill={bloomColor} />
      <circle cx="20" cy="16" r="3.5" fill={bloomColor} opacity="0.9" />
      <circle cx="36" cy="14" r="3" fill={goldColor} />
      <circle cx="28" cy="12" r="1.5" fill={bg} />
    </svg>
  );
}

/** An unplanted bucket-list seed (Seeds screen). */
export function Seed({ color = 'var(--gd-gold)', size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <ellipse cx="12" cy="12" rx="5" ry="7" fill={color} opacity="0.9" />
      <path d="M12 5 L12 19" stroke="var(--gd-bg)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

/** A single glowing dot. */
export function Firefly({ color = 'var(--gd-gold)', size = 3, style }: { color?: string; size?: number; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: 999, background: color, boxShadow: `0 0 ${size * 3}px ${color}`, ...style }}
    />
  );
}

/** A horizontal strip of plants-at-stages for a card (e.g. weekly growth). */
export function GrowthThread({
  stages = [0, 1, 2, 3, 3, 4, 4],
  color = 'var(--gd-moss)',
  dimColor = 'var(--gd-moss-dim)',
  size = 30,
  labels,
}: {
  stages?: number[];
  color?: string;
  dimColor?: string;
  size?: number;
  labels?: string[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
      {stages.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Plant stage={s} color={s === 4 ? color : dimColor} size={size} />
          {labels?.[i] ? (
            <div style={{ fontFamily: 'var(--gd-font-mono)', fontSize: 8, color: 'var(--gd-cream-faint)', marginTop: 2, letterSpacing: '0.05em' }}>
              {labels[i]}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
