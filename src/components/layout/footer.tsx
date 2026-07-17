import Link from 'next/link';
import { APP_VERSION } from '@/lib/constants';

/** Small app footer with the version and a personal dedication. */
export function Footer() {
  return (
    <footer className="mt-8 flex flex-col items-center gap-1 pb-2 text-center text-xs text-muted">
      <Link href="/whats-new" className="font-medium text-primary hover:underline">
        Version {APP_VERSION} · What&rsquo;s new
      </Link>
      <p>
        Made for Amelia with <span aria-hidden="true">❤️</span>
        <span className="sr-only">love</span>
      </p>
    </footer>
  );
}
