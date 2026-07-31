import type { ReactNode } from 'react';
import { GardenTabBar } from '@/components/garden/tab-bar';
import { ShellFireflies } from '@/components/layout/shell-fireflies';
import { OfflineIndicator } from '@/components/layout/offline-indicator';
import { Onboarding } from '@/components/onboarding/onboarding';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { ScrollReset } from '@/components/layout/scroll-reset';

/**
 * The garden shell: a full-bleed dusk column on phones, and a centred framed
 * "device" panel with ambient fireflies on wide screens. See app-shell.tsx for
 * the notes on the fixed-inset layout.
 */
export function GardenChrome({ children }: { children: ReactNode }) {
  return (
    <div className="gd-atmos gd-shell fixed inset-0 overflow-hidden">
      <ShellFireflies />
      <div className="gd-shell-mark gd-eyebrow" aria-hidden="true">
        Little Things · a garden
      </div>
      <div className="gd-shell-frame relative mx-auto flex h-full w-full max-w-app flex-col pt-safe-top">
        <OfflineIndicator />
        <main id="main-content" className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
        <GardenTabBar />
        <ScrollReset />
      </div>
      <InstallPrompt />
      <Onboarding />
    </div>
  );
}
