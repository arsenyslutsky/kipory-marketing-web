import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { THEME_STORAGE_KEY, themeBootScript } from '@/theme/theme';
import { MobileWorkflowFallback } from './MobileWorkflowFallback';

type ChangeListener = (event: MediaQueryListEvent) => void;

function createMediaQuery(media: string, initialMatches: boolean) {
  const listeners = new Set<ChangeListener>();
  const query = {
    matches: initialMatches,
    media,
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
      const event = { matches, media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };

  return query as unknown as MediaQueryList & { emit: (matches: boolean) => void };
}

function installMatchMedia({ desktop = false, systemDark = false } = {}) {
  const desktopQuery = createMediaQuery('(min-width: 621px)', desktop);
  const colorSchemeQuery = createMediaQuery('(prefers-color-scheme: dark)', systemDark);

  vi.stubGlobal('matchMedia', vi.fn((query: string) => (
    query === '(min-width: 621px)' ? desktopQuery : colorSchemeQuery
  )));

  return { colorSchemeQuery };
}

const fallback = (
  <MobileWorkflowFallback
    alt="Workflow"
    darkSrc="/dark.png"
    lightSrc="/light.png"
    height={100}
    name="test"
    width={200}
  >
    <span>webgl</span>
  </MobileWorkflowFallback>
);

function expectThemeNeutralImageSources() {
  const image = screen.getByRole('img');
  expect(image).not.toHaveAttribute('src', '/light.png');
  expect(image).not.toHaveAttribute('src', '/dark.png');
  expect(image).not.toHaveAttribute('srcset');
  expect(image).toHaveStyle({
    '--mobile-workflow-dark-image': 'image-set(url("/dark.png") 1x, url("/dark@2x.png") 2x, url("/dark@3x.png") 3x)',
    '--mobile-workflow-light-image': 'image-set(url("/light.png") 1x, url("/light@2x.png") 2x, url("/light@3x.png") 3x)',
  });
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

it('selects the light density family for an explicit light preference on mobile', () => {
  installMatchMedia();

  render(<ThemeProvider preference="light">{fallback}</ThemeProvider>);

  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expectThemeNeutralImageSources();
});

it.each([
  ['System on a light OS', undefined],
  ['a persisted Light preference', 'light'],
] as const)('keeps the server image source theme-neutral through hydration for %s', async (_case, savedPreference) => {
  installMatchMedia({ systemDark: false });
  if (savedPreference) localStorage.setItem(THEME_STORAGE_KEY, savedPreference);

  const serverHtml = renderToString(<ThemeProvider>{fallback}</ThemeProvider>);
  expect(serverHtml).not.toContain('src="/dark.png"');
  expect(serverHtml).not.toContain('srcset="/dark.png');

  const container = document.createElement('div');
  container.innerHTML = serverHtml;
  document.body.append(container);
  const serverImage = container.querySelector('img');
  new Function(themeBootScript)();
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');

  const hydrationErrors: unknown[] = [];
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <ThemeProvider>{fallback}</ThemeProvider>, {
      onRecoverableError: (error) => hydrationErrors.push(error),
    });
  });

  expect(container.querySelector('img')).toBe(serverImage);
  expect(container.querySelector('img')).not.toHaveAttribute('src', '/dark.png');
  expect(hydrationErrors).toEqual([]);

  await act(async () => root.unmount());
  container.remove();
});

it('selects the dark density family for an explicit dark preference on mobile', () => {
  installMatchMedia();

  render(<ThemeProvider preference="dark">{fallback}</ThemeProvider>);

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expectThemeNeutralImageSources();
});

it('selects the light density family when System resolves to light', () => {
  installMatchMedia({ systemDark: false });

  render(<ThemeProvider preference="system">{fallback}</ThemeProvider>);

  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expectThemeNeutralImageSources();
});

it('lets an explicit mode override the provider preference', () => {
  installMatchMedia();

  render(
    <ThemeProvider preference="light">
      <MobileWorkflowFallback
        alt="Workflow"
        darkSrc="/dark.png"
        lightSrc="/light.png"
        height={100}
        mode="dark"
        name="test"
        width={200}
      >
        <span>webgl</span>
      </MobileWorkflowFallback>
    </ThemeProvider>,
  );

  expect(screen.getByRole('img').parentElement).toHaveAttribute('data-mode', 'dark');
  expectThemeNeutralImageSources();
});

it('keeps rendering the child instead of a picture on desktop', () => {
  installMatchMedia({ desktop: true });

  const { container } = render(<ThemeProvider preference="light">{fallback}</ThemeProvider>);

  expect(screen.getByText('webgl')).toBeInTheDocument();
  expect(container.querySelector('picture')).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

it('preserves the mobile image intrinsic dimensions and aspect ratio', () => {
  installMatchMedia();

  render(<ThemeProvider preference="light">{fallback}</ThemeProvider>);

  const image = screen.getByRole('img');
  expect(image).toHaveAttribute('alt', 'Workflow');
  expect(image).toHaveAttribute('decoding', 'async');
  expect(image).toHaveAttribute('draggable', 'false');
  expect(image).toHaveAttribute('height', '100');
  expect(image).toHaveAttribute('width', '200');
  expect(image.parentElement).toHaveAttribute('data-mobile-workflow-fallback', 'test');
  expect(image.parentElement).toHaveStyle({
    aspectRatio: '200 / 100',
    width: 'min(100%, 200px)',
  });
});

it('switches density families live without remounting the picture', () => {
  const { colorSchemeQuery } = installMatchMedia({ systemDark: false });
  const { container } = render(<ThemeProvider preference="system">{fallback}</ThemeProvider>);
  const picture = container.querySelector('picture');

  expect(document.documentElement).toHaveAttribute('data-theme', 'light');

  act(() => colorSchemeQuery.emit(true));

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expectThemeNeutralImageSources();
  expect(container.querySelector('picture')).toBe(picture);
});
