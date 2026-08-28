import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

it('replaces retired Product and About navigation with the waitlist', () => {
  render(
    <>
      <SiteHeader />
      <SiteFooter />
    </>,
  );

  expect(screen.queryAllByRole('link', { name: 'Product' })).toHaveLength(0);
  expect(screen.queryAllByRole('link', { name: 'About' })).toHaveLength(0);
  expect(screen.getAllByRole('link', { name: 'Join waiting list' })).toHaveLength(2);

  const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' });
  expect(within(primaryNavigation).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
});
