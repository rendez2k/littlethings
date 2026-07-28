'use client';

import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  PALETTE_SWATCHES,
  parseAppearance,
} from '@/features/settings/appearance';
import type { WidgetColor } from './contract';

/**
 * The app's current accent (the selected palette) as light/dark hex, so the
 * widget's progress ring matches whatever accent the user picked. Reads the
 * appearance straight from storage — safe to call outside React.
 */
export function currentWidgetAccent(): WidgetColor {
  let palette = DEFAULT_APPEARANCE.palette;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(APPEARANCE_STORAGE_KEY) : null;
    palette = parseAppearance(raw).palette;
  } catch {
    // Storage unavailable — fall back to the default palette.
  }
  const swatch = PALETTE_SWATCHES[palette] ?? PALETTE_SWATCHES.lavender;
  return { light: swatch.light.toLowerCase(), dark: swatch.dark.toLowerCase() };
}
