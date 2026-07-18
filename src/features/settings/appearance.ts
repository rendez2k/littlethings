/**
 * Appearance settings model + persistence.
 *
 * In Phase 1 these live in `localStorage` so the choice survives restarts and
 * can be applied before first paint (avoiding a flash of the wrong theme).
 * Later phases move the canonical store to the SettingsRepository; the shape
 * here is intentionally small and serialisable so that migration is trivial.
 */

export const THEME_MODES = ['system', 'light', 'dark', 'pastel'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const PALETTES = ['lavender', 'sky', 'mint', 'peach', 'rose', 'lemon'] as const;
export type Palette = (typeof PALETTES)[number];

export const DENSITIES = ['comfortable', 'compact'] as const;
export type Density = (typeof DENSITIES)[number];

/** Concrete theme applied to `<html>`. Pastel is a soft light-family theme. */
export type ResolvedTheme = 'light' | 'dark' | 'pastel';

/** Which accent variant a resolved theme uses (pastel shares the light one). */
export function accentVariant(theme: ResolvedTheme): 'light' | 'dark' {
  return theme === 'dark' ? 'dark' : 'light';
}

export interface AppearanceSettings {
  theme: ThemeMode;
  palette: Palette;
  density: Density;
  reducedMotion: boolean;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'system',
  palette: 'lavender',
  density: 'comfortable',
  reducedMotion: false,
};

export const APPEARANCE_STORAGE_KEY = 'little-things.appearance.v1';

export const PALETTE_LABELS: Record<Palette, string> = {
  lavender: 'Lavender',
  sky: 'Sky',
  mint: 'Mint',
  peach: 'Peach',
  rose: 'Rose',
  lemon: 'Lemon',
};

/** Swatch colours for the settings UI (kept in sync with globals.css). */
export const PALETTE_SWATCHES: Record<Palette, { light: string; dark: string }> = {
  lavender: { light: '#6355C9', dark: '#B7ADFB' },
  sky: { light: '#2A72C4', dark: '#7CB8F2' },
  mint: { light: '#0E8A66', dark: '#4FC5A0' },
  peach: { light: '#BE5F27', dark: '#F0A876' },
  rose: { light: '#BC3F73', dark: '#F08BB0' },
  lemon: { light: '#B08A04', dark: '#F2D34E' },
};

function isTheme(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}
function isPalette(value: unknown): value is Palette {
  return typeof value === 'string' && (PALETTES as readonly string[]).includes(value);
}
function isDensity(value: unknown): value is Density {
  return typeof value === 'string' && (DENSITIES as readonly string[]).includes(value);
}

/** Parse persisted appearance defensively, falling back to defaults per field. */
export function parseAppearance(raw: string | null | undefined): AppearanceSettings {
  if (!raw) return { ...DEFAULT_APPEARANCE };
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    return {
      theme: isTheme(data.theme) ? data.theme : DEFAULT_APPEARANCE.theme,
      palette: isPalette(data.palette) ? data.palette : DEFAULT_APPEARANCE.palette,
      density: isDensity(data.density) ? data.density : DEFAULT_APPEARANCE.density,
      reducedMotion:
        typeof data.reducedMotion === 'boolean'
          ? data.reducedMotion
          : DEFAULT_APPEARANCE.reducedMotion,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function loadAppearance(): AppearanceSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_APPEARANCE };
  return parseAppearance(window.localStorage.getItem(APPEARANCE_STORAGE_KEY));
}

export function saveAppearance(settings: AppearanceSettings): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings));
}

/** Resolve `system` against the OS preference to a concrete theme. */
export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'system') return prefersDark ? 'dark' : 'light';
  return mode;
}

/**
 * Apply appearance to the document element. Kept framework-agnostic so it can
 * run both from the pre-paint inline script and from React effects.
 */
export function applyAppearanceToDocument(
  settings: AppearanceSettings,
  prefersDark: boolean,
): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const resolved = resolveTheme(settings.theme, prefersDark);
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-palette', settings.palette);
  root.setAttribute('data-density', settings.density);
  root.setAttribute('data-reduced-motion', String(settings.reducedMotion));
}
