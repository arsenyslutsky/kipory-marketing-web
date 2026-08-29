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
  const talkLink = within(primaryNavigation).getByRole('link', { name: "Let's Talk" });
  const waitlistLink = screen.getAllByRole('link', { name: 'Join waiting list' })[0];
  const headerActions = talkLink.closest('.site-header__actions');
  expect(within(primaryNavigation).queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  expect(talkLink).toHaveAttribute('href', '/contact');
  expect(headerActions).not.toBeNull();
  expect(waitlistLink.closest('.site-header__actions')).toBe(headerActions);
  expect(talkLink.compareDocumentPosition(waitlistLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
