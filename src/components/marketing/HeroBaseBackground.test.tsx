import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { HeroBaseBackground } from './HeroBaseBackground';

vi.mock('@/theme/ThemeProvider', () => ({ useResolvedTheme: () => 'light' }));

it.each([
  ['solid', 'rgb(17, 34, 51)'],
  ['linear', 'linear-gradient(45deg, #112233, #445566)'],
  ['circle', 'radial-gradient(circle at center, #112233, #445566)'],
] as const)('renders the %s base independently of the mask', (style, expected) => {
  const { container } = render(<HeroBaseBackground colorFrom="#112233" colorTo="#445566" style={style} angle={45} />);
  const base = container.querySelector<HTMLElement>('[data-hero-base-background]')!;
  expect(base.style.background).toBe(expected);
  expect(base).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelector('[data-masked-background]')).toBeNull();
});

it('defaults to the saved light base', () => {
  const { container } = render(<HeroBaseBackground />);
  expect(container.querySelector<HTMLElement>('[data-hero-base-background]')!.style.background).toBe('rgb(243, 245, 239)');
});
