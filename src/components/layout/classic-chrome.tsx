import type { ReactNode } from 'react';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { OfflineIndicator } from '@/components/layout/offline-indicator';
import { ClassicOnboarding } from '@/components/onboarding/classic-onboarding';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { ScrollReset } from '@/components/layout/scroll-reset';

/**
 * The classic (pre-garden) shell: the original bottom tab bar and a padded
 * content column on the app's theme background. Restored so users can switch
 * back to the classic look. See app-shell.tsx for the fixed-inset notes.
 */
export function ClassicChrome({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <div className="mx-auto flex h-full w-full max-w-app flex-col pt-safe-top">
        <OfflineIndicator />
        <main id="main-content" className="flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          {children}
        </main>
        <BottomNav />
        <ScrollReset />
      </div>
      <InstallPrompt />
      <ClassicOnboarding />
    </div>
  );
}
