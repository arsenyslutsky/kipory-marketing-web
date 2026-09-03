'use client';

import { createContext, use, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  applyThemeToDocument,
  isThemePreference,
  nextThemePreference,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './theme';

export type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemDark() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return true;
  }
}

function getStoredPreference() {
  try {
    const preference = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(preference) ? preference : undefined;
  } catch {
    return undefined;
  }
}

function getPrepaintedPreference() {
  const preference = document.documentElement.getAttribute('data-theme-preference');
  return isThemePreference(preference) ? preference : undefined;
}

export function ThemeProvider({
  children,
  preference: controlledPreference,
  onPreferenceChange,
}: React.PropsWithChildren<{
  preference?: ThemePreference;
  onPreferenceChange?: (preference: ThemePreference) => void;
}>) {
  const [uncontrolledPreference, setUncontrolledPreference] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const preference = controlledPreference ?? uncontrolledPreference;

  useLayoutEffect(() => {
    const nextPreference = controlledPreference ?? getStoredPreference() ?? getPrepaintedPreference() ?? 'system';
    const nextResolvedTheme = resolveTheme(nextPreference, getSystemDark());

    if (controlledPreference === undefined) setUncontrolledPreference(nextPreference);
    setResolvedTheme(nextResolvedTheme);
    applyThemeToDocument(nextPreference, nextResolvedTheme);
  }, [controlledPreference]);

  useEffect(() => {
    if (preference !== 'system' || typeof window.matchMedia !== 'function') return;

    let mediaQuery: MediaQueryList;
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      const nextResolvedTheme: ResolvedTheme = event.matches ? 'dark' : 'light';
      setResolvedTheme(nextResolvedTheme);
      applyThemeToDocument('system', nextResolvedTheme);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [preference]);

  useEffect(() => {
    if (controlledPreference !== undefined) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isThemePreference(event.newValue)) return;

      const nextResolvedTheme = resolveTheme(event.newValue, getSystemDark());
      setUncontrolledPreference(event.newValue);
      setResolvedTheme(nextResolvedTheme);
      applyThemeToDocument(event.newValue, nextResolvedTheme);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [controlledPreference]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    if (controlledPreference !== undefined) {
      onPreferenceChange?.(nextPreference);
      return;
    }

    const nextResolvedTheme = resolveTheme(nextPreference, getSystemDark());
    setUncontrolledPreference(nextPreference);
    setResolvedTheme(nextResolvedTheme);
    applyThemeToDocument(nextPreference, nextResolvedTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // A blocked storage area should not prevent the visible preference from changing.
    }
  }, [controlledPreference, onPreferenceChange]);

  const value = useMemo<ThemeContextValue>(() => ({
    preference,
    resolvedTheme,
    setPreference,
    cyclePreference: () => setPreference(nextThemePreference(preference)),
  }), [preference, resolvedTheme, setPreference]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const theme = use(ThemeContext);
  if (!theme) throw new Error('useTheme must be used within a ThemeProvider');
  return theme;
}

export function useResolvedTheme(explicitMode?: ResolvedTheme): ResolvedTheme {
  const theme = use(ThemeContext);
  return explicitMode ?? theme?.resolvedTheme ?? 'dark';
}
