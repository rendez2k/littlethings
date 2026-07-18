'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'little-things.install-dismissed.v1';
const ONBOARDED_KEY = 'little-things.onboarded.v1';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Gentle, dismissible nudge to add the app to the home screen. On Android/desktop
 * it uses the native install prompt; on iOS (which has no such event) it shows
 * the Share → Add to Home Screen hint. Hidden once installed or dismissed.
 */
export function InstallPrompt() {
  const [mode, setMode] = useState<'native' | 'ios' | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return; // already installed
    let dismissed = false;
    let onboarded = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
      onboarded = localStorage.getItem(ONBOARDED_KEY) === '1';
    } catch {
      // ignore
    }
    if (dismissed || !onboarded) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode('native');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    // iOS never fires the event — show the manual hint after a short delay.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) iosTimer = setTimeout(() => setMode((m) => m ?? 'ios'), 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
    setMode(null);
  };

  if (!mode) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 px-4">
      <div className="pointer-events-auto mx-auto flex max-w-app items-center gap-3 rounded-2xl border border-border bg-elevated p-3 shadow-sheet">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Download className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">Install Little Things</p>
          {mode === 'ios' ? (
            <p className="flex items-center gap-1 text-xs text-muted">
              Tap <Share className="inline h-3.5 w-3.5" aria-hidden="true" /> then “Add to Home
              Screen”.{' '}
              <Link href="/settings/install" className="font-medium text-primary" onClick={dismiss}>
                Help
              </Link>
            </p>
          ) : (
            <p className="text-xs text-muted">Add it to your home screen for the full app.</p>
          )}
        </div>
        {mode === 'native' ? (
          <Button
            size="sm"
            onClick={async () => {
              if (!deferred) return;
              await deferred.prompt();
              await deferred.userChoice;
              dismiss();
            }}
          >
            Install
          </Button>
        ) : null}
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-text"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
