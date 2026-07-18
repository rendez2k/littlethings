import { describe, expect, it } from 'vitest';
import {
  accentVariant,
  DEFAULT_APPEARANCE,
  parseAppearance,
  resolveTheme,
  type AppearanceSettings,
} from './appearance';

describe('parseAppearance', () => {
  it('returns defaults for null/empty input', () => {
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance('')).toEqual(DEFAULT_APPEARANCE);
  });

  it('returns defaults for malformed JSON', () => {
    expect(parseAppearance('{not json')).toEqual(DEFAULT_APPEARANCE);
  });

  it('round-trips a valid settings object', () => {
    const settings: AppearanceSettings = {
      theme: 'dark',
      palette: 'mint',
      density: 'compact',
      reducedMotion: true,
    };
    expect(parseAppearance(JSON.stringify(settings))).toEqual(settings);
  });

  it('falls back per-field for invalid values', () => {
    const parsed = parseAppearance(
      JSON.stringify({ theme: 'ultra', palette: 'neon', density: 5, reducedMotion: 'yes' }),
    );
    expect(parsed).toEqual(DEFAULT_APPEARANCE);
  });

  it('keeps valid fields while replacing invalid ones', () => {
    const parsed = parseAppearance(JSON.stringify({ theme: 'light', palette: 'oops' }));
    expect(parsed.theme).toBe('light');
    expect(parsed.palette).toBe(DEFAULT_APPEARANCE.palette);
  });
});

describe('resolveTheme', () => {
  it('resolves system to the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('honours explicit choices regardless of OS preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('pastel', true)).toBe('pastel');
  });
});

describe('accentVariant', () => {
  it('maps pastel and light to the light accents, dark to dark', () => {
    expect(accentVariant('light')).toBe('light');
    expect(accentVariant('pastel')).toBe('light');
    expect(accentVariant('dark')).toBe('dark');
  });
});
