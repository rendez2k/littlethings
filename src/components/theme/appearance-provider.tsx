'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  applyAppearanceToDocument,
  DEFAULT_APPEARANCE,
  loadAppearance,
  resolveTheme,
  saveAppearance,
  type AppearanceSettings,
  type ResolvedTheme,
} from '@/features/settings/appearance';

interface AppearanceContextValue {
  appearance: AppearanceSettings;
  resolvedTheme: ResolvedTheme;
  /** Whether settings have been read from storage yet (avoids SSR mismatch). */
  hydrated: boolean;
  setAppearance: (patch: Partial<AppearanceSettings>) => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

const DARK_QUERY = '(prefers-color-scheme: dark)';

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [prefersDark, setPrefersDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read persisted settings + current OS preference once mounted.
  useEffect(() => {
    setAppearanceState(loadAppearance());
    if (typeof window !== 'undefined' && window.matchMedia) {
      setPrefersDark(window.matchMedia(DARK_QUERY).matches);
    }
    setHydrated(true);
  }, []);

  // React to OS theme changes while `system` is selected.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Keep the document attributes in sync with state.
  useEffect(() => {
    if (!hydrated) return;
    applyAppearanceToDocument(appearance, prefersDark);
  }, [appearance, prefersDark, hydrated]);

  const setAppearance = useCallback((patch: Partial<AppearanceSettings>) => {
    setAppearanceState((prev) => {
      const next = { ...prev, ...patch };
      saveAppearance(next);
      return next;
    });
  }, []);

  const resolvedTheme = resolveTheme(appearance.theme, prefersDark);

  const value = useMemo<AppearanceContextValue>(
    () => ({ appearance, resolvedTheme, hydrated, setAppearance }),
    [appearance, resolvedTheme, hydrated, setAppearance],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return ctx;
}
