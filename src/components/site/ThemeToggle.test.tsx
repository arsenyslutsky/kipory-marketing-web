import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { THEME_STORAGE_KEY } from '@/theme/theme';
import { ThemeToggle } from './ThemeToggle';
import styles from './ThemeToggle.module.css';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
  document.documentElement.style.colorScheme = '';
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderToggle() {
  return render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
}

it('exposes the current preference in the labelled desktop group and mobile cycle control', () => {
  renderToggle();

  const group = screen.getByRole('group', { name: 'Theme preference' });
  expect(within(group).getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
  expect(within(group).getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');

  const cycle = screen.getByRole('button', { name: 'Theme: System. Switch to Light.' });
  expect(cycle).toHaveClass(styles.mobile);
});

it('uses a persistent underline to distinguish the selected desktop setting without relying on color alone', () => {
  renderToggle();

  const group = screen.getByRole('group', { name: 'Theme preference' });
  const selected = within(group).getByRole('button', { name: 'System' });
  const unselected = within(group).getByRole('button', { name: 'Light' });

  expect(selected.querySelector(`.${styles.selectedIndicator}`)).toBeInTheDocument();
  expect(unselected.querySelector(`.${styles.selectedIndicator}`)).not.toBeInTheDocument();
});

it.each([
  ['System', 'system', 'light'],
  ['Light', 'light', 'light'],
  ['Dark', 'dark', 'dark'],
] as const)('persists %s when its desktop segment is selected', (label, preference, resolvedTheme) => {
  renderToggle();

  fireEvent.click(within(screen.getByRole('group', { name: 'Theme preference' })).getByRole('button', { name: label }));

  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(preference);
  expect(document.documentElement).toHaveAttribute('data-theme-preference', preference);
  expect(document.documentElement).toHaveAttribute('data-theme', resolvedTheme);
});

it('cycles through every preference and wraps from Dark back to System', () => {
  renderToggle();

  fireEvent.click(screen.getByRole('button', { name: 'Theme: System. Switch to Light.' }));
  expect(screen.getByRole('button', { name: 'Theme: Light. Switch to Dark.' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Theme: Light. Switch to Dark.' }));
  expect(screen.getByRole('button', { name: 'Theme: Dark. Switch to System.' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Theme: Dark. Switch to System.' }));
  expect(screen.getByRole('button', { name: 'Theme: System. Switch to Light.' })).toBeInTheDocument();
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
});

it('hides every theme icon from assistive technology and keyboard focus', () => {
  const { container } = renderToggle();

  for (const icon of container.querySelectorAll('svg')) {
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('focusable', 'false');
  }
});
