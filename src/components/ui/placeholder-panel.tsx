import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PlaceholderPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/**
 * A friendly, intentional empty/placeholder state. Used across screens until
 * their real functionality lands in later phases.
 */
export function PlaceholderPanel({
  icon: Icon,
  title,
  description,
  action,
  className,
}: PlaceholderPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon aria-hidden="true" className="h-7 w-7" />
      </span>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
