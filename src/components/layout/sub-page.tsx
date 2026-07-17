import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/** Simple content sub-page with a back link to Settings. */
export function SubPage({ title, children }: { title: string; children: ReactNode }) {
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
