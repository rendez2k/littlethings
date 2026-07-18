'use client';

import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHabitEditor } from '@/components/habits/habit-editor-provider';
import { useAppSettings } from '@/features/settings/hooks';

/**
 * First-launch welcome state (brief §7.1). Shown on Today until the first habit
 * exists. Intentionally minimal — no multi-page onboarding.
 */
export function Welcome() {
  const { openCreate, openTemplates } = useHabitEditor();
  const { displayName } = useAppSettings();
  const name = displayName.trim();

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-2 text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-card">
        <Sparkles className="h-10 w-10" aria-hidden="true" />
      </span>
      {name ? <p className="mb-1 text-sm font-medium text-primary">Hi {name} 👋</p> : null}
      <h1 className="text-2xl font-bold tracking-tight text-text">Build better days.</h1>
      <p className="mt-2 max-w-xs text-pretty text-muted">
        Track your habits privately — no account needed. Everything is saved right here on your
        device.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Button size="lg" onClick={() => openCreate()}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          Create my first habit
        </Button>
        <Button size="lg" variant="secondary" onClick={openTemplates}>
          Use a template
        </Button>
      </div>
    </div>
  );
}
