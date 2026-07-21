import type { ReactNode } from 'react';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { OfflineIndicator } from '@/components/layout/offline-indicator';
import { Onboarding } from '@/components/onboarding/onboarding';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { ScrollReset } from '@/components/layout/scroll-reset';

/**
 * The mobile application shell.
 *
 * The outer element is pinned to the viewport with `position: fixed; inset: 0`
 * rather than sized with a `100dvh` height. Installed iOS apps mis-measure the
 * `dvh` unit on first paint (the column comes up short, so the bottom bar floats
 * up until a layout event — navigation or rotation — corrects it). A fixed inset
 * box is laid out against the real viewport rectangle, so it is correct from the
 * first frame and tracks rotation. The inner column fills that box with
 * `height: 100%`; its content region scrolls internally while the bottom
 * navigation stays in normal flow at the foot of the column. Content is centred
 * within a comfortable max-width on larger screens.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-app flex-col pt-safe-top">
        <OfflineIndicator />
        <main id="main-content" className="flex-1 overflow-y-auto px-4 pb-6">
          {children}
        </main>
        <BottomNav />
        <ScrollReset />
      </div>
      <InstallPrompt />
      <Onboarding />
    </div>
  );
}
