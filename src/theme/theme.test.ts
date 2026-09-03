import { expect, it } from 'vitest';
import {
  THEME_ORDER,
  isThemePreference,
  nextThemePreference,
  resolveTheme,
} from './theme';

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
