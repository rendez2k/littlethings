'use client';

import Link from 'next/link';
import { APP_VERSION } from '@/lib/constants';
import { useIsNativeApp } from '@/lib/platform';

/** Small app footer with the version and a personal dedication. */
export function Footer() {
  const isNative = useIsNativeApp();
  return (
    <footer className="mt-8 flex flex-col items-center gap-2 pb-2 text-center" style={{ color: 'var(--gd-cream-faint)' }}>
      {isNative ? (
        <p className="gd-eyebrow">Version {APP_VERSION}</p>
      ) : (
        <Link href="/whats-new" className="gd-eyebrow gd-eyebrow--accent" style={{ textDecoration: 'none' }}>
          Version {APP_VERSION} · What&rsquo;s new
        </Link>
      )}
      <p className="gd-quote" style={{ fontSize: 15 }}>
        Made for Amelia with <span aria-hidden="true">🌱</span>
        <span className="sr-only">love</span>
      </p>
    </footer>
  );
}
