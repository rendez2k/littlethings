'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CloudOff, HeartHandshake, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSettingsRepository } from '@/features/settings/hooks';

const ONBOARDED_KEY = 'little-things.onboarded.v1';

const POINTS = [
  {
    icon: CloudOff,
    title: 'Private & offline',
    text: 'Everything stays on your device. No account, no tracking.',
  },
  {
    icon: Wand2,
    title: 'Simple to start',
    text: 'Add your first habit in seconds, from a template or your own.',
  },
  {
    icon: HeartHandshake,
    title: 'Gentle by design',
    text: 'Streaks encourage you — a missed day is never a failure.',
  },
];

/**
 * A single, skippable welcome shown once on first launch (brief §7.1 — not a
 * multi-page carousel). Reads/writes a localStorage flag so it never repeats.
 */
export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    try {
      if (!localStorage.getItem(ONBOARDED_KEY)) setOpen(true);
    } catch {
      // Ignore storage errors; simply don't show onboarding.
    }
  }, []);

  const dismiss = () => {
    const trimmed = name.trim().slice(0, 40);
    if (trimmed) {
      // Save the name for gentle personalisation (best-effort).
      getSettingsRepository()
        .update({ displayName: trimmed })
        .catch(() => {});
    }
    try {
      localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      // no-op
    }
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => (!o ? dismiss() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          // Don't auto-focus the name field on open — on mobile that forces the
          // keyboard open over the welcome screen. The field stays optional.
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-app rounded-t-sheet border border-border bg-elevated p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-sheet data-[state=open]:animate-sheet-in"
        >
          <div className="mb-5 flex flex-col items-center text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-card">
              <Sparkles className="h-8 w-8" aria-hidden="true" />
            </span>
            <Dialog.Title className="text-xl font-bold tracking-tight text-text">
              Welcome to Little Things
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted">
              A calm way to build better days.
            </Dialog.Description>
          </div>

          <ul className="mb-6 space-y-4">
            {POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <point.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-text">{point.title}</p>
                  <p className="text-sm text-muted">{point.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              dismiss();
            }}
          >
            <label htmlFor="onboarding-name" className="mb-1.5 block text-sm font-medium text-text">
              What should we call you? <span className="font-normal text-muted">(optional)</span>
            </label>
            <Input
              id="onboarding-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="given-name"
              enterKeyHint="done"
              className="mb-4"
            />
            <Button type="submit" size="lg" className="w-full">
              Get started
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
