'use client';

import { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';

/**
 * Non-blocking notice shown when connectivity is lost. The app remains fully
 * usable offline — this simply reassures the user that tracking still works.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-primary-soft px-4 py-2 pt-safe-top text-sm font-medium text-text"
    >
      <CloudOff aria-hidden="true" className="h-4 w-4" />
      <span>You&rsquo;re offline, but you can keep tracking.</span>
    </div>
  );
}
