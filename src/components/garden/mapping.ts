/**
 * Bridges the app's existing data model to the Garden visual language, so the
 * redesign is a pure reskin over the real Dexie data — no schema change.
 */
import type { HabitColor } from '@/features/habits/schemas';

/** The five garden accents, as CSS custom-property references. */
export type GardenColor = 'moss' | 'bloom' | 'sky' | 'gold' | 'plum';
export const gardenVar = (c: GardenColor): string => `var(--gd-${c})`;

/** Map the app's ten habit colours onto the five botanical accents. */
const HABIT_TO_GARDEN: Record<HabitColor, GardenColor> = {
  lavender: 'plum',
  sky: 'sky',
  mint: 'moss',
  sage: 'moss',
  peach: 'bloom',
  coral: 'bloom',
  rose: 'plum',
  lemon: 'gold',
  aqua: 'sky',
  slate: 'moss',
};

export function gardenColor(color: string): GardenColor {
  return HABIT_TO_GARDEN[color as HabitColor] ?? 'moss';
}
export function gardenColorVar(color: string): string {
  return gardenVar(gardenColor(color));
}

/** Streak length → plant growth stage. The single source of this threshold. */
export function stageFromStreak(days: number): number {
  return days >= 30 ? 4 : days >= 14 ? 3 : days >= 4 ? 2 : days >= 1 ? 1 : 0;
}

/** A short frequency label for a habit schedule, garden-flavoured. */
export function frequencyLabel(scheduleType: string): string {
  switch (scheduleType) {
    case 'daily':
      return 'Daily';
    case 'weekdays':
      return 'Weekdays';
    case 'times_per_week':
      return 'Weekly';
    case 'times_per_month':
      return 'Monthly';
    case 'every_n_days':
      return 'Every few days';
    case 'once':
      return 'One-off';
    default:
      return 'Daily';
  }
}

/** Seed (goal) tags and their accent, cycled deterministically by position. */
export const SEED_TAGS = ['Craft', 'Travel', 'Mind', 'Body', 'Heart'] as const;
export type SeedTag = (typeof SEED_TAGS)[number];

const SEED_TAG_TO_GARDEN: Record<SeedTag, GardenColor> = {
  Craft: 'gold',
  Travel: 'sky',
  Mind: 'moss',
  Body: 'bloom',
  Heart: 'plum',
};

export function seedTagFor(index: number): SeedTag {
  return SEED_TAGS[index % SEED_TAGS.length]!;
}
export function seedTagColorVar(tag: SeedTag): string {
  return gardenVar(SEED_TAG_TO_GARDEN[tag]);
}
