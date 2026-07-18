/**
 * Human-readable labels for schedules and targets (brief §7.3). We avoid
 * technical scheduling language in the UI.
 */
import type { Weekday } from '@/lib/dates';
import type { Schedule, Target } from './schemas';

const DAY_PLURAL: Record<Weekday, string> = {
  0: 'Sundays',
  1: 'Mondays',
  2: 'Tuesdays',
  3: 'Wednesdays',
  4: 'Thursdays',
  5: 'Fridays',
  6: 'Saturdays',
};

const WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
];

function numberWord(n: number): string {
  return n >= 0 && n < WORDS.length ? WORDS[n]! : String(n);
}

function timesPerWord(n: number): string {
  if (n === 1) return 'Once';
  if (n === 2) return 'Twice';
  return `${capitalize(numberWord(n))} times`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Join a list into a natural-language series ("A, B and C"). */
export function joinSeries(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** A concise, human-readable description of a schedule. */
export function scheduleLabel(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return 'Every day';
    case 'weekdays': {
      const set = [...schedule.weekdays].sort((a, b) => a - b);
      const key = set.join(',');
      if (key === '0,1,2,3,4,5,6') return 'Every day';
      if (key === '1,2,3,4,5') return 'Weekdays';
      if (key === '0,6') return 'Weekends';
      return joinSeries(set.map((d) => DAY_PLURAL[d]));
    }
    case 'every_n_days':
      if (schedule.intervalDays === 1) return 'Every day';
      if (schedule.intervalDays === 2) return 'Every other day';
      return `Every ${numberWord(schedule.intervalDays)} days`;
    case 'times_per_week':
      return `${timesPerWord(schedule.timesPerWeek)} per week`;
    case 'times_per_month':
      return `${timesPerWord(schedule.timesPerMonth)} per month`;
    case 'once':
      return 'One-off';
    default: {
      const _exhaustive: never = schedule;
      return _exhaustive;
    }
  }
}

/** A short target label, or null for a simple (boolean) target. */
export function targetLabel(target: Target): string | null {
  switch (target.type) {
    case 'boolean':
      return null;
    case 'count':
      return `${formatNumber(target.amount)} ${target.unit}`;
    case 'duration':
      return `${formatNumber(target.amount)} min`;
    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
