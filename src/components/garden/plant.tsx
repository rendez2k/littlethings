/**
 * The signature visual of Garden. A habit is a plant that grows through 5
 * stages as its streak builds. Each of the five garden accents is its own
 * botanical species, so a plant's colour already tells you what it is:
 *
 *   moss → fern · bloom → poppy · sky → bluebell · gold → daisy · plum → lavender
 *
 * Stages 0–1 (a seed, then a two-leaf sprout) are shared — young plants all
 * look alike. Species diverge from stage 2 as the form fills in. Pure SVG on a
 * 56×56 canvas with the base at y=46; the stage→streak mapping lives in
 * `mapping.ts`, not here.
 */
import type { CSSProperties, ReactNode } from 'react';
import type { GardenColor } from './mapping';

export type PlantStage = 0 | 1 | 2 | 3 | 4;

const SPECIES: GardenColor[] = ['moss', 'bloom', 'sky', 'gold', 'plum'];

/** Pull a species out of a `var(--gd-xxx)` colour, defaulting to fern (moss). */
function speciesFor(color: string, explicit?: GardenColor): GardenColor {
  if (explicit) return explicit;
  const m = /--gd-(moss|bloom|sky|gold|plum)\b/.exec(color);
  return (m?.[1] as GardenColor | undefined) && SPECIES.includes(m![1] as GardenColor)
    ? (m![1] as GardenColor)
    : 'moss';
}

interface PlantProps {
  stage?: number;
  color?: string;
  /** Force a species; otherwise it's read from `color`. */
  species?: GardenColor;
  goldColor?: string;
  bg?: string;
  hair?: string;
  size?: number;
}

export function Plant({
  stage = 3,
  color = 'var(--gd-moss)',
  species,
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

  // Shared young stages.
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

  const sp = speciesFor(color, species);
  const s = stage === 2 ? 2 : stage === 3 ? 3 : 4;
  return (
    <svg {...common}>
      {shadow}
      {renderSpecies(sp, s, { color, goldColor, bg })}
    </svg>
  );
}

interface Paint {
  color: string;
  goldColor: string;
  bg: string;
}

function stem(topY: number, color: string, width = 2): ReactNode {
  return <path d={`M28 46 L28 ${topY}`} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}
function leaf(cx: number, cy: number, rx: number, ry: number, rot: number, color: string, opacity = 1): ReactNode {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={color} opacity={opacity} transform={`rotate(${rot} ${cx} ${cy})`} />;
}

function renderSpecies(sp: GardenColor, stage: 2 | 3 | 4, p: Paint): ReactNode {
  switch (sp) {
    case 'moss':
      return fern(stage, p);
    case 'bloom':
      return poppy(stage, p);
    case 'sky':
      return bluebell(stage, p);
    case 'gold':
      return daisy(stage, p);
    case 'plum':
      return lavender(stage, p);
  }
}

/* ---- moss · fern (feathery arching fronds, no flower) ---- */
function frond(cx: number, baseY: number, topX: number, topY: number, color: string): ReactNode {
  const midX = (cx + topX) / 2 + (topX - cx) * 0.2;
  const midY = (baseY + topY) / 2 - 3;
  return (
    <path
      d={`M${cx} ${baseY} Q${midX} ${midY} ${topX} ${topY}`}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  );
}
function fern(stage: 2 | 3 | 4, { color, goldColor }: Paint): ReactNode {
  if (stage === 2) {
    return (
      <>
        {stem(30, color, 1.8)}
        {frond(28, 40, 17, 33, color)}
        {frond(28, 40, 39, 33, color)}
        {frond(28, 34, 20, 27, color)}
        {frond(28, 34, 36, 27, color)}
      </>
    );
  }
  const fronds = (
    <>
      {frond(28, 42, 13, 34, color)}
      {frond(28, 42, 43, 34, color)}
      {frond(28, 34, 15, 24, color)}
      {frond(28, 34, 41, 24, color)}
      {frond(28, 26, 19, 16, color)}
      {frond(28, 26, 37, 16, color)}
    </>
  );
  if (stage === 3) {
    return (
      <>
        {stem(18, color)}
        {fronds}
        {leaf(28, 15, 3, 2, 0, color)}
      </>
    );
  }
  // stage 4: fuller, with a curled fiddlehead crown and a couple of gold sori.
  return (
    <>
      {stem(14, color)}
      {fronds}
      {frond(28, 20, 24, 11, color)}
      {frond(28, 20, 32, 11, color)}
      <path d="M28 13 q4 -1 4 3 q0 3 -3 3 q-2 0 -2 -2" stroke={goldColor} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.3" fill={goldColor} />
      <circle cx="37" cy="18" r="1.3" fill={goldColor} />
    </>
  );
}

/* ---- bloom · poppy (a single round flower) ---- */
function poppy(stage: 2 | 3 | 4, { color, goldColor, bg }: Paint): ReactNode {
  if (stage === 2) {
    return (
      <>
        {stem(26, color, 1.8)}
        {leaf(20, 36, 6, 3, -30, color)}
        {leaf(36, 32, 6, 3, 30, color)}
        {leaf(24, 26, 4.5, 2.4, -18, color)}
      </>
    );
  }
  if (stage === 3) {
    return (
      <>
        {stem(20, color)}
        {leaf(18, 36, 7, 3.2, -25, color)}
        {leaf(38, 32, 7, 3.2, 25, color)}
        {/* a closed bud */}
        <path d="M28 20 q-5 -3 -3 -9 q3 -4 6 0 q2 6 -3 9" fill={color} />
        <path d="M28 20 L28 11" stroke={color} strokeWidth="1.4" opacity="0.5" />
      </>
    );
  }
  // stage 4: open bloom — five rounded petals + dark centre with gold.
  const petals = [0, 72, 144, 216, 288].map((a, i) => (
    <ellipse key={i} cx="28" cy="7.5" rx="4.6" ry="6.2" fill={color} opacity={i % 2 ? 0.9 : 1} transform={`rotate(${a} 28 14)`} />
  ));
  return (
    <>
      {stem(16, color)}
      {leaf(17, 36, 8, 3.5, -25, color)}
      {leaf(39, 32, 8, 3.5, 25, color)}
      {leaf(20, 24, 6.5, 3, -20, color)}
      {petals}
      <circle cx="28" cy="14" r="3.2" fill={bg} />
      <circle cx="28" cy="14" r="1.6" fill={goldColor} />
    </>
  );
}

/* ---- sky · bluebell (drooping bell flowers on an arching stem) ---- */
function bell(cx: number, cy: number, color: string): ReactNode {
  return (
    <>
      <path d={`M${cx - 2.4} ${cy} q0 5 2.4 6 q2.4 -1 2.4 -6 q-2.4 -1.6 -4.8 0`} fill={color} />
      <path d={`M${cx} ${cy - 2} L${cx} ${cy}`} stroke={color} strokeWidth="1" opacity="0.6" />
    </>
  );
}
function bluebell(stage: 2 | 3 | 4, { color, goldColor }: Paint): ReactNode {
  if (stage === 2) {
    return (
      <>
        {stem(28, color, 1.8)}
        {leaf(22, 40, 3, 7, -10, color)}
        {leaf(34, 40, 3, 7, 10, color)}
        {bell(28, 26, color)}
      </>
    );
  }
  if (stage === 3) {
    return (
      <>
        <path d="M28 46 Q26 30 30 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
        {leaf(21, 40, 3.4, 8, -12, color)}
        {leaf(35, 41, 3.4, 8, 12, color)}
        {bell(24, 26, color)}
        {bell(31, 22, color)}
        {bell(29, 18, color)}
      </>
    );
  }
  // stage 4: a fuller arching raceme of bells, a couple gold-tipped.
  return (
    <>
      <path d="M28 46 Q24 28 32 14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      {leaf(20, 40, 3.6, 9, -12, color)}
      {leaf(36, 41, 3.6, 9, 12, color)}
      {bell(23, 30, color)}
      {bell(30, 27, color)}
      {bell(26, 24, color)}
      {bell(32, 21, color)}
      {bell(30, 16, color)}
      <circle cx="32" cy="13" r="1.4" fill={goldColor} />
    </>
  );
}

/* ---- gold · daisy (radiating petals around a disc) ---- */
function daisy(stage: 2 | 3 | 4, { color, goldColor, bg }: Paint): ReactNode {
  if (stage === 2) {
    return (
      <>
        {stem(26, color, 1.8)}
        {leaf(20, 36, 6, 3, -30, color)}
        {leaf(36, 34, 6, 3, 30, color)}
        <circle cx="28" cy="24" r="3.4" fill={goldColor} />
      </>
    );
  }
  if (stage === 3) {
    const petals = [0, 60, 120, 180, 240, 300].map((a, i) => (
      <ellipse key={i} cx="28" cy="15" rx="2.4" ry="4.4" fill={color} transform={`rotate(${a} 28 21)`} />
    ));
    return (
      <>
        {stem(21, color)}
        {leaf(18, 36, 7, 3.2, -28, color)}
        {leaf(38, 34, 7, 3.2, 28, color)}
        {petals}
        <circle cx="28" cy="21" r="3.4" fill={goldColor} />
      </>
    );
  }
  // stage 4: a full sunflower-ish head — many petals, a big gold disc.
  const petals = [0, 40, 80, 120, 160, 200, 240, 280, 320].map((a, i) => (
    <ellipse key={i} cx="28" cy="6.5" rx="2.8" ry="5.4" fill={color} transform={`rotate(${a} 28 15)`} />
  ));
  return (
    <>
      {stem(17, color)}
      {leaf(16, 36, 8, 3.5, -28, color)}
      {leaf(40, 34, 8, 3.5, 28, color)}
      {petals}
      <circle cx="28" cy="15" r="4.4" fill={goldColor} />
      <circle cx="28" cy="15" r="2" fill={bg} opacity="0.35" />
    </>
  );
}

/* ---- plum · lavender (a spike of small buds) ---- */
function spike(cx: number, topY: number, rows: number, color: string): ReactNode {
  const buds: ReactNode[] = [];
  for (let i = 0; i < rows; i++) {
    const y = topY + i * 3.4;
    const off = i % 2 === 0 ? 2 : -2;
    buds.push(<circle key={`l${i}`} cx={cx + off} cy={y} r="1.8" fill={color} />);
    buds.push(<circle key={`r${i}`} cx={cx - off} cy={y + 1.4} r="1.8" fill={color} opacity="0.85" />);
  }
  buds.push(<circle key="tip" cx={cx} cy={topY - 2.4} r="1.5" fill={color} />);
  return <>{buds}</>;
}
function lavender(stage: 2 | 3 | 4, { color, goldColor }: Paint): ReactNode {
  if (stage === 2) {
    return (
      <>
        {stem(24, color, 1.8)}
        {leaf(22, 40, 3, 6, -8, color)}
        {leaf(34, 40, 3, 6, 8, color)}
        {spike(28, 18, 2, color)}
      </>
    );
  }
  if (stage === 3) {
    return (
      <>
        {stem(28, color)}
        {leaf(21, 41, 3.2, 7, -8, color)}
        {leaf(35, 41, 3.2, 7, 8, color)}
        {spike(28, 15, 4, color)}
      </>
    );
  }
  // stage 4: three tall spikes.
  return (
    <>
      <path d="M28 46 L22 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M28 46 L28 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M28 46 L34 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {leaf(20, 42, 3.4, 8, -8, color)}
      {leaf(36, 42, 3.4, 8, 8, color)}
      {spike(22, 15, 3, color)}
      {spike(28, 11, 4, color)}
      {spike(34, 15, 3, color)}
      <circle cx="28" cy="8" r="1.3" fill={goldColor} />
    </>
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
  species,
  size = 30,
  labels,
}: {
  stages?: number[];
  color?: string;
  dimColor?: string;
  species?: GardenColor;
  size?: number;
  labels?: string[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
      {stages.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Plant stage={s} color={s === 4 ? color : dimColor} species={species} size={size} />
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
