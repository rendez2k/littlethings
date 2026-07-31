'use client';

import type { ReactNode } from 'react';
import { useAppearance } from '@/components/theme/appearance-provider';
import { GardenChrome } from '@/components/layout/garden-chrome';
import { ClassicChrome } from '@/components/layout/classic-chrome';

/**
 * Chooses the garden or classic shell (and, via each page, the matching
 * screens) from the persisted `look` setting. Until the appearance has been
 * read from storage we render a neutral dusk field — the same brief blank the
 * screens already show while they hydrate — so the wrong shell never flashes.
 * The pre-paint theme script has already stamped `data-look` on <html>, so the
 * CSS is correct from the first frame regardless.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const { appearance, hydrated } = useAppearance();
  if (!hydrated) {
    return <div className="fixed inset-0" style={{ background: 'rgb(var(--color-background))' }} />;
  }
  return appearance.look === 'classic' ? (
    <ClassicChrome>{children}</ClassicChrome>
  ) : (
    <GardenChrome>{children}</GardenChrome>
  );
}
