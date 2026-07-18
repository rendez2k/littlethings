import { cn } from '@/lib/cn';

interface ProgressRingProps {
  /** Completion ratio in [0,1]. */
  ratio: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  className?: string;
  /** Optional content centred inside the ring (e.g. "3/5"). */
  children?: React.ReactNode;
}

/** A small, accessible progress ring driven by the primary token. */
export function ProgressRing({
  ratio,
  size = 44,
  strokeWidth = 4,
  label,
  className,
  children,
}: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, ratio));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <span
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-[stroke-dashoffset] duration-500 ease-ios"
        />
      </svg>
      {children ? (
        <span className="absolute inset-0 flex items-center justify-center">{children}</span>
      ) : null}
    </span>
  );
}
