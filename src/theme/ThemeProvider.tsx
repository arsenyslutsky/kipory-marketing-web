'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
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

type ThemeSnapshot = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
};

const serverThemeSnapshot: ThemeSnapshot = {
  preference: 'system',
  resolvedTheme: 'dark',
};

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

function getInitialThemeSnapshot(): ThemeSnapshot {
  if (typeof window === 'undefined') return serverThemeSnapshot;

  const preference = getStoredPreference() ?? getPrepaintedPreference() ?? 'system';
  return {
    preference,
    resolvedTheme: resolveTheme(preference, getSystemDark()),
  };
}

function createThemeStore() {
  let snapshot = getInitialThemeSnapshot();
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update: (preference: ThemePreference, resolvedTheme: ResolvedTheme) => {
      if (snapshot.preference === preference && snapshot.resolvedTheme === resolvedTheme) return;

      snapshot = { preference, resolvedTheme };
      listeners.forEach((listener) => listener());
    },
  };
}

export function ThemeProvider({
  children,
  preference: controlledPreference,
  onPreferenceChange,
}: React.PropsWithChildren<{
  preference?: ThemePreference;
  onPreferenceChange?: (preference: ThemePreference) => void;
}>) {
  const [themeStore] = useState(createThemeStore);
  const uncontrolledTheme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    () => serverThemeSnapshot,
  );
  const preference = controlledPreference ?? uncontrolledTheme.preference;
  const resolvedTheme = controlledPreference === undefined
    ? uncontrolledTheme.resolvedTheme
    : resolveTheme(controlledPreference, getSystemDark());

  useLayoutEffect(() => {
    const nextTheme = controlledPreference === undefined
      ? themeStore.getSnapshot()
      : {
          preference: controlledPreference,
          resolvedTheme: resolveTheme(controlledPreference, getSystemDark()),
        };

    applyThemeToDocument(nextTheme.preference, nextTheme.resolvedTheme);
  }, [controlledPreference, resolvedTheme, themeStore]);

  useEffect(() => {
    const root = document.documentElement;
    const frame = window.requestAnimationFrame(() => {
      root.setAttribute('data-theme-ready', 'true');
    });

    return () => {
      window.cancelAnimationFrame(frame);
      root.removeAttribute('data-theme-ready');
    };
  }, []);

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
      themeStore.update('system', nextResolvedTheme);
      applyThemeToDocument('system', nextResolvedTheme);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [preference, themeStore]);

  useEffect(() => {
    if (controlledPreference !== undefined) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isThemePreference(event.newValue)) return;

      const nextResolvedTheme = resolveTheme(event.newValue, getSystemDark());
      themeStore.update(event.newValue, nextResolvedTheme);
      applyThemeToDocument(event.newValue, nextResolvedTheme);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [controlledPreference, themeStore]);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    if (controlledPreference !== undefined) {
      onPreferenceChange?.(nextPreference);
      return;
    }

    const nextResolvedTheme = resolveTheme(nextPreference, getSystemDark());
    themeStore.update(nextPreference, nextResolvedTheme);
    applyThemeToDocument(nextPreference, nextResolvedTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // A blocked storage area should not prevent the visible preference from changing.
    }
  }, [controlledPreference, onPreferenceChange, themeStore]);

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
