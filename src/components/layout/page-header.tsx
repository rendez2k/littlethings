import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional trailing action, e.g. an add button. */
  action?: ReactNode;
  /** When set, shows a back link above the title (garden eyebrow style). */
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/** Garden page title: an optional back eyebrow, a serif title, and an action. */
export function PageHeader({ title, subtitle, action, backHref, backLabel, className }: PageHeaderProps) {
  return (
    <header className={cn('pt-3 pb-4', className)}>
      {backHref ? (
        <Link href={backHref} className="gd-eyebrow" style={{ textDecoration: 'none', letterSpacing: '0.2em' }}>
          ‹ {backLabel ?? 'Back'}
        </Link>
      ) : null}
      <div className="flex items-end justify-between gap-3" style={{ marginTop: backHref ? 8 : 0 }}>
        <div className="min-w-0">
          <h1 className="gd-h1" style={{ fontSize: 'var(--gd-size-display-md)', lineHeight: 1.1 }}>
            {title}
          </h1>
          {subtitle ? (
            <p className="gd-body-sm" style={{ marginTop: 4 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 pb-1">{action}</div> : null}
      </div>
    </header>
  );
}
