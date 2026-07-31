'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLook } from '@/components/theme/appearance-provider';

/** Content sub-page with a back link to Settings. Garden or classic styling. */
export function SubPage({ title, children }: { title: string; children: ReactNode }) {
  const look = useLook();

  if (look === 'classic') {
    return (
      <div className="pb-6">
        <div className="flex items-center gap-1 py-3">
          <Link
            href="/settings"
            aria-label="Back to settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-text"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text">{title}</h1>
        </div>
        <div className="prose-sm space-y-4 text-[0.95rem] leading-relaxed text-text">{children}</div>
      </div>
    );
  }

  const words = title.split(' ');
  const lead = words.slice(0, -1).join(' ');
  const last = words[words.length - 1];
  return (
    <div style={{ padding: '54px 22px 24px' }}>
      <Link href="/settings" aria-label="Back to settings" className="gd-eyebrow" style={{ textDecoration: 'none', letterSpacing: '0.2em' }}>
        ‹ Settings
      </Link>
      <h1 className="gd-h1" style={{ fontSize: 'var(--gd-size-display-md)', marginTop: 8, marginBottom: 18 }}>
        {lead ? `${lead} ` : ''}
        <em style={{ color: 'var(--gd-moss)' }}>{last}</em>
      </h1>
      <div className="gd-body space-y-4" style={{ lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}
