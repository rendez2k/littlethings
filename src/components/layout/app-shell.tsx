import type { ReactNode } from 'react';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { OfflineIndicator } from '@/components/layout/offline-indicator';
import { Onboarding } from '@/components/onboarding/onboarding';
import { InstallPrompt } from '@/components/pwa/install-prompt';

/**
 * The mobile application shell. Content is centred within a comfortable
 * max-width on larger screens rather than stretched, and the scroll region is
 * padded so the fixed bottom navigation never obscures content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-app flex-col">
      <OfflineIndicator />
      <main
        id="main-content"
        className="flex-1 px-4 pt-safe-top"
        // Leave room for the fixed bottom navigation + safe area.
        style={{
          paddingBottom: 'calc(var(--nav-clearance, 5.5rem) + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
      <Onboarding />
    </div>
  );
}
