'use client';

import { useState, type MouseEvent } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppearance } from '@/components/theme/appearance-provider';
import { getHabitAccent } from '@/features/habits/colors';
import { goalValue } from '@/features/completions/logic';
import type { DayStatus } from '@/features/completions/logic';
import type { Completion } from '@/features/completions/schemas';
import type { Habit } from '@/features/habits/schemas';
import { getCompletionService } from '@/features/habits/hooks';
import { celebrateCompletion } from '@/lib/celebrate';
import type { DateKey } from '@/lib/dates';

interface Props {
  habit: Habit;
  completion: Completion | undefined;
  status: DayStatus;
  date: DateKey;
  disabled?: boolean;
}

export function CompletionControl({ habit, completion, status, date, disabled }: Props) {
  const { resolvedTheme, appearance } = useAppearance();
  const accent = getHabitAccent(habit.color, resolvedTheme);
  const service = getCompletionService();

  if (habit.target.type === 'boolean') {
    const complete = status === 'complete';
    return (
      <BooleanCheck
        complete={complete}
        disabled={disabled}
        accentColor={accent.accent}
        onColor={accent.on}
        reducedMotion={appearance.reducedMotion}
        label={complete ? `Mark ${habit.name} not done` : `Mark ${habit.name} done`}
        onClick={(e) => {
          if (!complete) celebrateCompletion(e.currentTarget, appearance.reducedMotion);
          service.toggle(habit.id, date);
        }}
      />
    );
  }

  // Count / duration.
  const goal = goalValue(habit.target);
  const value = completion && !completion.deletedAt ? completion.value : 0;
  const complete = value >= goal;
  const step = habit.target.type === 'duration' ? 5 : 1;
  const unit = habit.target.type === 'duration' ? 'min' : '';

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-border bg-surface p-1"
      style={complete ? { backgroundColor: accent.soft, borderColor: 'transparent' } : undefined}
    >
      <button
        type="button"
        aria-label={`Decrease ${habit.name}`}
        disabled={disabled || value <= 0}
        onClick={() => service.increment(habit.id, date, -step)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted disabled:opacity-30"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        className="min-w-[3.25rem] text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
        style={complete ? { color: accent.accent } : undefined}
      >
        {value}/{goal}
        {unit ? <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span> : null}
      </span>
      <button
        type="button"
        aria-label={`Increase ${habit.name}`}
        disabled={disabled}
        onClick={(e) => {
          // Celebrate only when this tap reaches the goal, not every increment.
          if (value < goal && value + step >= goal) {
            celebrateCompletion(e.currentTarget, appearance.reducedMotion);
          }
          service.increment(habit.id, date, step);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
        style={{ color: accent.accent }}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function BooleanCheck({
  complete,
  disabled,
  accentColor,
  onColor,
  reducedMotion,
  label,
  onClick,
}: {
  complete: boolean;
  disabled?: boolean;
  accentColor: string;
  onColor: string;
  reducedMotion: boolean;
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [pulse, setPulse] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={complete}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        if (!complete && !reducedMotion) {
          setPulse(true);
          window.setTimeout(() => setPulse(false), 260);
        }
        onClick(e);
      }}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform active:scale-90 disabled:opacity-40',
        pulse && 'animate-pop',
      )}
      style={
        complete
          ? { backgroundColor: accentColor, borderColor: accentColor, color: onColor }
          : { borderColor: 'rgb(var(--color-border))', color: 'transparent' }
      }
    >
      <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
    </button>
  );
}
