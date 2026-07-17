import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** Rounded, softly elevated surface card. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-border bg-surface p-4 shadow-card',
        className,
      )}
      {...props}
    />
  );
}
