import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { SiteHeader } from './SiteHeader';

it('uses the waiting list as the primary header action', () => {
  render(<ThemeProvider><SiteHeader /></ThemeProvider>);

  const waitlist = screen.getByRole('link', { name: 'Join wait list' });
  expect(waitlist).toHaveAttribute('href', '/waitlist');
  expect(waitlist).toHaveClass('button', 'button--compact', 'button--light', 'site-header__cta');
  expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
});

it('places the theme preference control before the primary navigation', () => {
  const { container } = render(<ThemeProvider><SiteHeader /></ThemeProvider>);

  const actions = container.querySelector('.site-header__actions');
  const themeControl = screen.getByRole('group', { name: 'Theme preference' });
  const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });

  expect(actions?.children[0]).toContainElement(themeControl);
  expect(actions?.children[1]).toBe(navigation);
});
