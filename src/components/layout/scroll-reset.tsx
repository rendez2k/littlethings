'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * With the app shell using an internal scroll region (`#main-content`) rather
 * than the document, route changes no longer reset scroll automatically — do it
 * here so each screen opens at the top.
 */
export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
