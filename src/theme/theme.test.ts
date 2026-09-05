import { afterEach, expect, it, vi } from 'vitest';
import {
  THEME_ORDER,
  applyThemeToDocument,
  isThemePreference,
  nextThemePreference,
  resolveTheme,
  themeBootScript,
} from './theme';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
  document.documentElement.style.colorScheme = '';
  document.querySelector('meta[name="theme-color"]')?.remove();
  localStorage.clear();
  vi.unstubAllGlobals();
});

it('accepts only the three public preference values', () => {
  expect(THEME_ORDER).toEqual(['system', 'light', 'dark']);
  expect(['system', 'light', 'dark'].every(isThemePreference)).toBe(true);
  expect(isThemePreference('sepia')).toBe(false);
});

it('resolves System from the OS and cycles back to System', () => {
  expect(resolveTheme('system', false)).toBe('light');
  expect(resolveTheme('system', true)).toBe('dark');
  expect(resolveTheme('light', true)).toBe('light');
  expect(nextThemePreference('system')).toBe('light');
  expect(nextThemePreference('light')).toBe('dark');
  expect(nextThemePreference('dark')).toBe('system');
});

it('applies a resolved theme to the root and existing browser theme-color metadata', () => {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  document.head.append(meta);

  applyThemeToDocument('dark', 'dark');

  expect(document.documentElement).toHaveAttribute('data-theme-preference', 'dark');
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(document.documentElement.style.colorScheme).toBe('dark');
  expect(meta).toHaveAttribute('content', '#0a0c0b');
});

it('runs the boot script with a valid persisted preference before paint', () => {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  document.head.append(meta);
  localStorage.setItem('kipory-theme', 'light');
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));

  new Function(themeBootScript)();

  expect(document.documentElement).toHaveAttribute('data-theme-preference', 'light');
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(document.documentElement.style.colorScheme).toBe('light');
  expect(meta).toHaveAttribute('content', '#f3f5ef');
});

it('runs the boot script with System on the current light OS when storage is invalid', () => {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  document.head.append(meta);
  localStorage.setItem('kipory-theme', 'sepia');
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));

  new Function(themeBootScript)();

  expect(document.documentElement).toHaveAttribute('data-theme-preference', 'system');
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(document.documentElement.style.colorScheme).toBe('light');
  expect(meta).toHaveAttribute('content', '#f3f5ef');
});
