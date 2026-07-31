'use client';

import Link from 'next/link';
import { APP_VERSION } from '@/lib/constants';
import { useIsNativeApp } from '@/lib/platform';
import { useLook } from '@/components/theme/appearance-provider';

/** Small app footer with the version and a personal dedication. */
export function Footer() {
  const isNative = useIsNativeApp();
  const look = useLook();

  if (look === 'classic') {
    return (
      <footer className="mt-8 flex flex-col items-center gap-1 pb-2 text-center text-xs text-muted">
        {isNative ? (
          <p className="font-medium">Version {APP_VERSION}</p>
        ) : (
          <Link href="/whats-new" className="font-medium text-primary hover:underline">
            Version {APP_VERSION} · What&rsquo;s new
          </Link>
        )}
        <p>
          Made for Amelia with <span aria-hidden="true">❤️</span>
          <span className="sr-only">love</span>
        </p>
      </footer>
    );
  }

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
