'use client';

import { cn } from '@/lib/cn';
import { GOAL_ICONS, getGoalIcon } from '@/features/goals/icons';

/** Grid of goal icons. Neutral (goals have no per-item colour) with a primary
 * highlight for the selected key. */
export function GoalIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Icon" className="grid grid-cols-6 gap-2">
      {Object.keys(GOAL_ICONS).map((key) => {
        const Icon = getGoalIcon(key);
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={key.replace(/-/g, ' ')}
            onClick={() => onChange(key)}
            className={cn(
              'flex aspect-square items-center justify-center rounded-xl border transition',
              selected
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border bg-surface text-muted hover:text-text',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
