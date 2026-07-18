'use client';

import { Check, Flag } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getGoalService } from '@/features/goals/hooks';
import type { Goal } from '@/features/goals/schemas';
import { fromDateKey } from '@/lib/dates';

export function GoalRow({ goal, onEdit }: { goal: Goal; onEdit: (goal: Goal) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <button
        type="button"
        role="checkbox"
        aria-checked={goal.done}
        aria-label={goal.done ? `Mark ${goal.title} not done` : `Mark ${goal.title} done`}
        onClick={() => getGoalService().toggleDone(goal.id)}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-transform active:scale-90',
          goal.done
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border text-transparent',
        )}
      >
        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onEdit(goal)}
        className="flex min-w-0 flex-1 flex-col items-start text-left"
        aria-label={`Edit ${goal.title}`}
      >
        <span
          className={cn('truncate font-medium text-text', goal.done && 'text-muted line-through')}
        >
          {goal.title}
        </span>
        {goal.targetDate ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
            <Flag className="h-3 w-3" aria-hidden="true" />
            {fromDateKey(goal.targetDate).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ) : null}
      </button>
    </div>
  );
}
