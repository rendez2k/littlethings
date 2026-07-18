import type { HabitColor } from './schemas';
import { accentVariant, type ResolvedTheme } from '@/features/settings/appearance';

/**
 * Habit accent colours (brief §7.4). Each has an accessible light and dark
 * variant. `on` is the readable foreground for text/icons placed on the accent
 * (dark accents in light mode take white; light accents in dark mode take ink).
 */
interface AccentValues {
  light: string;
  dark: string;
}

export const HABIT_COLOR_VALUES: Record<HabitColor, AccentValues> = {
  lavender: { light: '#6355c9', dark: '#b7adfb' },
  sky: { light: '#2a72c4', dark: '#7cb8f2' },
  mint: { light: '#0e8a66', dark: '#4fc5a0' },
  sage: { light: '#4c7a52', dark: '#97c79a' },
  peach: { light: '#be5f27', dark: '#f0a876' },
  coral: { light: '#c64a3f', dark: '#f09186' },
  rose: { light: '#bc3f73', dark: '#f08bb0' },
  lemon: { light: '#b08a04', dark: '#f2d34e' },
  aqua: { light: '#0e8a93', dark: '#57c6ce' },
  slate: { light: '#5b6472', dark: '#a9b2c0' },
};

export const HABIT_COLOR_LABELS: Record<HabitColor, string> = {
  lavender: 'Lavender',
  sky: 'Sky',
  mint: 'Mint',
  sage: 'Sage',
  peach: 'Peach',
  coral: 'Coral',
  rose: 'Rose',
  lemon: 'Lemon',
  aqua: 'Aqua',
  slate: 'Slate',
};

const INK = '#17151f';
const WHITE = '#ffffff';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export interface HabitAccent {
  /** The accent colour for the current theme. */
  accent: string;
  /** A soft translucent tint for backgrounds behind the accent. */
  soft: string;
  /** Readable foreground colour to place on top of the accent. */
  on: string;
}

/** Resolve a habit colour to concrete values for the active theme. */
export function getHabitAccent(color: HabitColor, theme: ResolvedTheme): HabitAccent {
  const variant = accentVariant(theme); // pastel shares the light accents
  const accent = HABIT_COLOR_VALUES[color][variant];
  const [r, g, b] = hexToRgb(accent);
  return {
    accent,
    soft: `rgba(${r}, ${g}, ${b}, ${variant === 'dark' ? 0.22 : 0.14})`,
    // Light/pastel accents are dark → white text; dark accents are light → ink.
    on: variant === 'light' ? WHITE : INK,
  };
}
