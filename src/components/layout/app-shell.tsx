import type { ReactNode } from 'react';
import { AppFrame } from '@/components/layout/app-frame';

/**
 * The mobile application shell. Delegates to AppFrame, which picks the garden
 * or classic chrome from the `look` setting.
 *
 * Both chromes are pinned to the viewport with `position: fixed; inset: 0`
 * rather than sized with `100dvh`. Installed iOS apps mis-measure `dvh` on
 * first paint (the column comes up short, so the bottom bar floats up until a
 * layout event corrects it); a fixed inset box is laid out against the real
 * viewport rectangle, so it is correct from the first frame and tracks
 * rotation. The inner column fills that box with `height: 100%`; its content
 * region scrolls internally while the navigation stays in normal flow at the
 * foot of the column, within a comfortable max-width on larger screens.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
