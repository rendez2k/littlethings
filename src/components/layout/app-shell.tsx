import type { ReactNode } from 'react';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { OfflineIndicator } from '@/components/layout/offline-indicator';
import { Onboarding } from '@/components/onboarding/onboarding';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { ScrollReset } from '@/components/layout/scroll-reset';

/**
 * The mobile application shell: a viewport-height flex column. The content
 * region scrolls internally while the bottom navigation stays in normal flow at
 * the foot of the column, so it sits at the bottom edge on every screen
 * regardless of content length. (A `fixed` bar mis-anchors on non-scrolling
 * pages in an installed iOS app, making it appear to jump.) Content is centred
 * within a comfortable max-width on larger screens.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-app flex-col overflow-hidden pt-safe-top">
      <OfflineIndicator />
      <main id="main-content" className="flex-1 overflow-y-auto px-4 pb-6">
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
      <Onboarding />
      <ScrollReset />
    </div>
  );
}
