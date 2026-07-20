'use client';

import { useEffect, useState } from 'react';

/**
 * Detects whether Little Things is running as an installed / native app rather
 * than in a normal browser tab. Web-only affordances (the install prompt, the
 * "What's new" changelog, the install guide) are hidden in that case.
 *
 * "Native" is true when any of these hold:
 *   - the display mode is standalone (installed PWA, incl. iOS Home Screen)
 *   - a known native wrapper is present (Capacitor / React Native WebView)
 *   - a `?native=1` hint was seen and remembered (for other wrappers)
 */
const NATIVE_FLAG_KEY = 'little-things.native.v1';

export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;

  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;

  const wrapper = window as unknown as { Capacitor?: unknown; ReactNativeWebView?: unknown };
  const wrapped = Boolean(wrapper.Capacitor) || Boolean(wrapper.ReactNativeWebView);

  let flagged = false;
  try {
    flagged = localStorage.getItem(NATIVE_FLAG_KEY) === '1';
  } catch {
    // Ignore storage errors.
  }

  return standalone || wrapped || flagged;
}

/** Persist a `?native=1` hint so a native wrapper stays recognised across navigations. */
function rememberNativeHint(): void {
  try {
    if (new URLSearchParams(window.location.search).get('native') === '1') {
      localStorage.setItem(NATIVE_FLAG_KEY, '1');
    }
  } catch {
    // Ignore.
  }
}

/**
 * Client hook. Returns `false` during SSR and the first client render (so
 * hydration matches), then resolves to the real value after mount.
 */
export function useIsNativeApp(): boolean {
  const [native, setNative] = useState(false);
  useEffect(() => {
    rememberNativeHint();
    setNative(isNativeApp());
  }, []);
  return native;
}
