'use client';

import { cn } from '@/lib/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  id?: string;
}

/** Accessible on/off toggle. */
export function Switch({ checked, onChange, ariaLabel, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-[1.375rem]',
        )}
      />
    </button>
  );
}
