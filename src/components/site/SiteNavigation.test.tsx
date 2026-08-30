import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

it('keeps retired routes out and exposes contact, waitlist, and app access', () => {
  render(
    <>
      <SiteHeader />
      <SiteFooter />
    </>,
  );

  expect(screen.queryAllByRole('link', { name: 'Product' })).toHaveLength(0);
  expect(screen.queryAllByRole('link', { name: 'About' })).toHaveLength(0);
  expect(screen.getAllByRole('link', { name: 'Join waiting list' })).toHaveLength(1);

  const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' });
  const talkLink = within(primaryNavigation).getByRole('link', { name: "Let's Talk" });
  const signInLink = screen.getByRole('link', { name: 'Sign in' });
  const waitlistLink = screen.getAllByRole('link', { name: 'Join waiting list' })[0];
  const headerActions = talkLink.closest('.site-header__actions');
  expect(within(primaryNavigation).queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  expect(talkLink).toHaveAttribute('href', '/contact');
  expect(headerActions).not.toBeNull();
  expect(signInLink.closest('.site-header__actions')).toBe(headerActions);
  expect(waitlistLink.closest('.site-header__actions')).toBeNull();
  expect(talkLink.compareDocumentPosition(signInLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
