import Link from 'next/link';
import type { ReactNode } from 'react';

/** Simple garden content sub-page with a back link to Settings. */
export function SubPage({ title, children }: { title: string; children: ReactNode }) {
  const words = title.split(' ');
  const lead = words.slice(0, -1).join(' ');
  const last = words[words.length - 1];
  return (
    <div className="pb-6" style={{ paddingTop: 8 }}>
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
