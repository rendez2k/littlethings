import { afterEach, describe, expect, it, vi } from 'vitest';
import { completionHaptic } from '@/lib/haptics';

afterEach(() => {
  delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  vi.unstubAllGlobals();
});

describe('completionHaptic', () => {
  it('uses the Capacitor Haptics plugin when available', () => {
    const impact = vi.fn().mockResolvedValue(undefined);
    (window as unknown as { Capacitor?: unknown }).Capacitor = { Plugins: { Haptics: { impact } } };
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate });

    completionHaptic();

    expect(impact).toHaveBeenCalledWith({ style: 'LIGHT' });
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('falls back to the Web Vibration API when there is no native bridge', () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate });

    completionHaptic();

    expect(vibrate).toHaveBeenCalledWith(12);
  });

  it('never throws when nothing supports haptics', () => {
    vi.stubGlobal('navigator', {});
    expect(() => completionHaptic()).not.toThrow();
  });
});
