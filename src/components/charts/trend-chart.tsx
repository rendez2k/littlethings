'use client';

import type { TrendPoint } from '@/features/insights/insights';

interface Props {
  points: TrendPoint[];
  summary: string;
}

const W = 320;
const H = 128;
const PAD_X = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

/**
 * Single-series completion trend. Theme-aware via tokens (no hard-coded colours),
 * with a plain-language summary for screen readers and a recessive baseline.
 */
export function TrendChart({ points, summary }: Props) {
  const plotW = W - PAD_X * 2;
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const n = points.length;
  const step = n > 1 ? plotW / (n - 1) : 0;

  const xy = points.map((p, i) => ({
    x: PAD_X + i * step,
    y: p.ratio === null ? null : PAD_TOP + plotH * (1 - p.ratio),
    ratio: p.ratio,
    label: p.label,
  }));

  const present = xy.filter((p): p is typeof p & { y: number } => p.y !== null);
  const linePath = present.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = present.length
    ? `${linePath} L ${present[present.length - 1]!.x} ${PAD_TOP + plotH} L ${present[0]!.x} ${PAD_TOP + plotH} Z`
    : '';

  const hasData = present.length > 0;
  // Show every label for short ranges; thin out for long ones.
  const labelEvery = n <= 7 ? 1 : n <= 12 ? 1 : Math.ceil(n / 6);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-32 w-full"
        role="img"
        aria-label={summary}
        preserveAspectRatio="none"
      >
        {/* Baseline + midline (recessive). */}
        <line
          x1={PAD_X}
          y1={PAD_TOP + plotH}
          x2={W - PAD_X}
          y2={PAD_TOP + plotH}
          className="stroke-border"
          strokeWidth={1}
        />
        <line
          x1={PAD_X}
          y1={PAD_TOP + plotH / 2}
          x2={W - PAD_X}
          y2={PAD_TOP + plotH / 2}
          className="stroke-border"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        {hasData ? (
          <>
            <path d={areaPath} className="fill-primary" fillOpacity={0.14} />
            <path
              d={linePath}
              fill="none"
              className="stroke-primary"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {present.map((p) => (
              <circle key={p.label + p.x} cx={p.x} cy={p.y} r={2.5} className="fill-primary" />
            ))}
          </>
        ) : null}
        {xy.map((p, i) =>
          i % labelEvery === 0 ? (
            <text
              key={`l${i}`}
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              className="fill-muted"
              fontSize={9}
            >
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
