'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useLook } from '@/components/theme/appearance-provider';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional trailing action, e.g. an add button. */
  action?: ReactNode;
  /** Garden look only: shows a back link above the title. */
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/** Page title. Serif with an optional back eyebrow in garden; bold in classic. */
export function PageHeader({ title, subtitle, action, backHref, backLabel, className }: PageHeaderProps) {
  const look = useLook();

  if (look === 'classic') {
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
