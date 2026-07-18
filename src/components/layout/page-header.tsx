import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional trailing action, e.g. an add button. */
  action?: ReactNode;
  className?: string;
}

/** Large iOS-style page title with an optional subtitle and trailing action. */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-end justify-between gap-3 pb-4 pt-3', className)}>
      <div className="min-w-0">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-text">{title}</h1>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0 pb-1">{action}</div> : null}
    </header>
  );
}
