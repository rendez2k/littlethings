'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppearance } from '@/components/theme/appearance-provider';
import {
  HABIT_COLORS,
  type HabitColor,
  type Schedule,
  type ScheduleType,
  type Target,
} from '@/features/habits/schemas';
import type { Weekday } from '@/lib/dates';
import { HABIT_ICONS, getHabitIcon } from '@/features/habits/icons';
import { HABIT_COLOR_LABELS, getHabitAccent } from '@/features/habits/colors';

/* ----------------------------- Stepper ------------------------------ */

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  ariaLabel,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  ariaLabel: string;
  suffix?: string;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        onClick={() => set(value - 1)}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text disabled:opacity-40"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        aria-live="polite"
        className="min-w-[3.5rem] text-center text-base font-semibold text-text"
      >
        {value}
        {suffix ? <span className="ml-1 text-sm font-normal text-muted">{suffix}</span> : null}
      </span>
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/* ---------------------------- ColorPicker --------------------------- */

export function ColorPicker({
  value,
  onChange,
}: {
  value: HabitColor;
  onChange: (color: HabitColor) => void;
}) {
  const { resolvedTheme } = useAppearance();
  return (
    <div role="radiogroup" aria-label="Colour" className="flex flex-wrap gap-3">
      {HABIT_COLORS.map((color) => {
        const { accent, on } = getHabitAccent(color, resolvedTheme);
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={HABIT_COLOR_LABELS[color]}
            onClick={() => onChange(color)}
            className={cn(
              'h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-surface transition',
              selected ? 'ring-focus' : 'ring-transparent',
            )}
            style={{ backgroundColor: accent }}
          >
            {selected ? (
              <span className="text-lg leading-none" style={{ color: on }} aria-hidden="true">
                ✓
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- IconPicker --------------------------- */

export function IconPicker({
  value,
  onChange,
  color,
}: {
  value: string;
  onChange: (icon: string) => void;
  color: HabitColor;
}) {
  const { resolvedTheme } = useAppearance();
  const { accent, soft, on } = getHabitAccent(color, resolvedTheme);
  return (
    <div role="radiogroup" aria-label="Icon" className="grid grid-cols-6 gap-2">
      {Object.keys(HABIT_ICONS).map((key) => {
        const Icon = getHabitIcon(key);
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
                ? 'border-transparent'
                : 'border-border bg-surface text-muted hover:text-text',
            )}
            style={selected ? { backgroundColor: accent, color: on } : { backgroundColor: soft }}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------- FrequencyPicker ------------------------ */

const SCHEDULE_TYPE_OPTIONS: Array<{ type: ScheduleType; label: string }> = [
  { type: 'daily', label: 'Every day' },
  { type: 'weekdays', label: 'Certain days' },
  { type: 'times_per_week', label: 'Times / week' },
  { type: 'times_per_month', label: 'Times / month' },
  { type: 'every_n_days', label: 'Every N days' },
  { type: 'once', label: 'One-off' },
];

const DAY_LETTERS: Array<{ day: Weekday; label: string; full: string }> = [
  { day: 1, label: 'M', full: 'Monday' },
  { day: 2, label: 'T', full: 'Tuesday' },
  { day: 3, label: 'W', full: 'Wednesday' },
  { day: 4, label: 'T', full: 'Thursday' },
  { day: 5, label: 'F', full: 'Friday' },
  { day: 6, label: 'S', full: 'Saturday' },
  { day: 0, label: 'S', full: 'Sunday' },
];

function defaultForType(type: ScheduleType): Schedule {
  switch (type) {
    case 'weekdays':
      return { type: 'weekdays', weekdays: [1, 2, 3, 4, 5] };
    case 'times_per_week':
      return { type: 'times_per_week', timesPerWeek: 3 };
    case 'times_per_month':
      return { type: 'times_per_month', timesPerMonth: 10 };
    case 'every_n_days':
      return { type: 'every_n_days', intervalDays: 2 };
    case 'once':
      return { type: 'once' };
    default:
      return { type: 'daily' };
  }
}

export function FrequencyPicker({
  value,
  onChange,
}: {
  value: Schedule;
  onChange: (schedule: Schedule) => void;
}) {
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Frequency" className="flex flex-wrap gap-2">
        {SCHEDULE_TYPE_OPTIONS.map((option) => {
          const selected = value.type === option.type;
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(defaultForType(option.type))}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-muted hover:text-text',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {value.type === 'weekdays' ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Days of the week">
          {DAY_LETTERS.map(({ day, label, full }) => {
            const on = value.weekdays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                aria-label={full}
                onClick={() => {
                  const next = on
                    ? value.weekdays.filter((d) => d !== day)
                    : [...value.weekdays, day];
                  if (next.length === 0) return; // keep at least one day
                  onChange({ type: 'weekdays', weekdays: next.sort((a, b) => a - b) });
                }}
                className={cn(
                  'h-10 w-10 rounded-full border text-sm font-semibold transition',
                  on
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      {value.type === 'times_per_week' ? (
        <Stepper
          ariaLabel="times per week"
          min={1}
          max={7}
          suffix="/ week"
          value={value.timesPerWeek}
          onChange={(v) => onChange({ type: 'times_per_week', timesPerWeek: v })}
        />
      ) : null}

      {value.type === 'times_per_month' ? (
        <Stepper
          ariaLabel="times per month"
          min={1}
          max={31}
          suffix="/ month"
          value={value.timesPerMonth}
          onChange={(v) => onChange({ type: 'times_per_month', timesPerMonth: v })}
        />
      ) : null}

      {value.type === 'every_n_days' ? (
        <Stepper
          ariaLabel="day interval"
          min={1}
          max={60}
          suffix="days"
          value={value.intervalDays}
          onChange={(v) => onChange({ type: 'every_n_days', intervalDays: v })}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------- TargetPicker -------------------------- */

const TARGET_TYPE_OPTIONS = [
  { type: 'boolean', label: 'Simple' },
  { type: 'count', label: 'Count' },
  { type: 'duration', label: 'Duration' },
] as const;

function defaultTarget(type: Target['type'], prev: Target): Target {
  const amount = 'amount' in prev ? prev.amount : 1;
  if (type === 'count') return { type: 'count', amount: Math.max(1, amount), unit: 'times' };
  if (type === 'duration')
    return { type: 'duration', amount: Math.max(1, amount), unit: 'minutes' };
  return { type: 'boolean' };
}

export function TargetPicker({
  value,
  onChange,
}: {
  value: Target;
  onChange: (target: Target) => void;
}) {
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Target type" className="flex gap-2">
        {TARGET_TYPE_OPTIONS.map((option) => {
          const selected = value.type === option.type;
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(defaultTarget(option.type, value))}
              className={cn(
                'flex-1 rounded-full border px-3 py-1.5 text-sm font-medium transition',
                selected
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-muted hover:text-text',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {value.type === 'count' ? (
        <div className="flex flex-wrap items-center gap-3">
          <Stepper
            ariaLabel="target amount"
            min={1}
            max={1000}
            value={value.amount}
            onChange={(amount) => onChange({ ...value, amount })}
          />
          <input
            aria-label="Unit"
            value={value.unit}
            onChange={(e) => onChange({ ...value, unit: e.target.value.slice(0, 24) })}
            placeholder="unit (e.g. glasses)"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
          />
        </div>
      ) : null}

      {value.type === 'duration' ? (
        <Stepper
          ariaLabel="target minutes"
          min={1}
          max={1000}
          suffix="minutes"
          value={value.amount}
          onChange={(amount) => onChange({ type: 'duration', amount, unit: 'minutes' })}
        />
      ) : null}
    </div>
  );
}
