import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeProvider, useResolvedTheme, useTheme } from './ThemeProvider';
import { THEME_STORAGE_KEY } from './theme';

type ChangeListener = (event: MediaQueryListEvent) => void;

function createColorSchemeQuery(initialMatches = false) {
  const listeners = new Set<ChangeListener>();
  const query = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === 'change' && typeof listener === 'function') listeners.add(listener as ChangeListener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (type === 'change' && typeof listener === 'function') listeners.delete(listener as ChangeListener);
    }),
    addListener: vi.fn((listener: ChangeListener) => listeners.add(listener)),
    removeListener: vi.fn((listener: ChangeListener) => listeners.delete(listener)),
    dispatchEvent: vi.fn(() => true),
    emit(matches: boolean) {
      query.matches = matches;
      const event = { matches, media: query.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
    listenerCount: () => listeners.size,
  };

  return query as unknown as MediaQueryList & { emit: (matches: boolean) => void; listenerCount: () => number };
}

function Probe() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  return <button onClick={() => setPreference('dark')}>{preference}:{resolvedTheme}</button>;
}

function ResolvedProbe({ explicitMode }: { explicitMode?: 'light' | 'dark' }) {
  return <output>{useResolvedTheme(explicitMode)}</output>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
  document.documentElement.removeAttribute('data-theme-ready');
  document.documentElement.style.colorScheme = '';
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('persists a user-selected preference and synchronizes the document', () => {
  const colorScheme = createColorSchemeQuery(false);
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);

  expect(screen.getByRole('button')).toHaveTextContent('system:light');
  fireEvent.click(screen.getByRole('button'));
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});

it('updates the System preference when the operating system color scheme changes', () => {
  const colorScheme = createColorSchemeQuery(false);
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);
  act(() => colorScheme.emit(true));

  expect(screen.getByRole('button')).toHaveTextContent('system:dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});

it('does not subscribe to operating system changes for an explicit preference', () => {
  const colorScheme = createColorSchemeQuery(false);
  localStorage.setItem(THEME_STORAGE_KEY, 'light');
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);
  act(() => colorScheme.emit(true));

  expect(screen.getByRole('button')).toHaveTextContent('light:light');
  expect(colorScheme.listenerCount()).toBe(0);
});

it.each([
  ['light', 'light:light'],
  ['dark', 'dark:dark'],
  ['system', 'system:light'],
] as const)('restores the saved %s preference after a layout-shaped Strict Mode remount', (savedPreference, expectedTheme) => {
  const colorScheme = createColorSchemeQuery(false);
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.setAttribute('data-theme-preference', 'system');
  localStorage.setItem(THEME_STORAGE_KEY, savedPreference);
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<StrictMode><ThemeProvider><Probe /></ThemeProvider></StrictMode>);

  expect(screen.getByRole('button')).toHaveTextContent(expectedTheme);
  expect(document.documentElement).toHaveAttribute('data-theme-preference', savedPreference);
});

it('accepts valid cross-tab storage changes without writing them back', () => {
  const colorScheme = createColorSchemeQuery(false);
  const setItem = vi.spyOn(Storage.prototype, 'setItem');
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);
  fireEvent(window, new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'dark' }));

  expect(screen.getByRole('button')).toHaveTextContent('dark:dark');
  expect(setItem).not.toHaveBeenCalled();
});

it.each([
  ['removeItem', THEME_STORAGE_KEY],
  ['clear', null],
] as const)('returns to System when another tab calls localStorage.%s', (_operation, key) => {
  const colorScheme = createColorSchemeQuery(false);
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(screen.getByRole('button')).toHaveTextContent('dark:dark');

  fireEvent(window, new StorageEvent('storage', { key, newValue: null }));

  expect(screen.getByRole('button')).toHaveTextContent('system:light');
  expect(document.documentElement).toHaveAttribute('data-theme-preference', 'system');
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
});

it('ignores invalid cross-tab storage changes', () => {
  const colorScheme = createColorSchemeQuery(false);
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);
  fireEvent(window, new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'sepia' }));

  expect(screen.getByRole('button')).toHaveTextContent('system:light');
});

it('continues to apply user preferences when local storage is unavailable', () => {
  const colorScheme = createColorSchemeQuery(false);
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><Probe /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button'));

  expect(screen.getByRole('button')).toHaveTextContent('dark:dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
});

it('delegates changes to a controlled preference', () => {
  const colorScheme = createColorSchemeQuery(false);
  const onPreferenceChange = vi.fn();
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider preference="light" onPreferenceChange={onPreferenceChange}><Probe /></ThemeProvider>);
  fireEvent.click(screen.getByRole('button'));

  expect(onPreferenceChange).toHaveBeenCalledWith('dark');
  expect(screen.getByRole('button')).toHaveTextContent('light:light');
});

it('removes its System media listener on unmount', () => {
  const colorScheme = createColorSchemeQuery(false);
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  const view = render(<ThemeProvider><Probe /></ThemeProvider>);
  expect(colorScheme.listenerCount()).toBe(1);
  view.unmount();

  expect(colorScheme.listenerCount()).toBe(0);
});

it('enables theme transitions after the first paint and removes readiness on unmount', () => {
  const colorScheme = createColorSchemeQuery(false);
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    nextFrame += 1;
    frames.set(nextFrame, callback);
    return nextFrame;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn((frame: number) => frames.delete(frame)));

  const view = render(<StrictMode><ThemeProvider><Probe /></ThemeProvider></StrictMode>);

  expect(document.documentElement).not.toHaveAttribute('data-theme-ready');
  expect(frames.size).toBe(1);

  act(() => {
    const pendingFrames = [...frames.values()];
    frames.clear();
    pendingFrames.forEach((callback) => callback(performance.now()));
  });

  expect(document.documentElement).toHaveAttribute('data-theme-ready', 'true');

  view.unmount();

  expect(document.documentElement).not.toHaveAttribute('data-theme-ready');
  expect(frames.size).toBe(0);
});

it('lets an explicit resolved theme override its context value', () => {
  const colorScheme = createColorSchemeQuery(true);
  vi.stubGlobal('matchMedia', vi.fn(() => colorScheme));

  render(<ThemeProvider><ResolvedProbe explicitMode="light" /></ThemeProvider>);

  expect(screen.getByRole('status')).toHaveTextContent('light');
});

it('uses dark as the resolved theme outside a provider', () => {
  render(<ResolvedProbe />);

  expect(screen.getByRole('status')).toHaveTextContent('dark');
});
