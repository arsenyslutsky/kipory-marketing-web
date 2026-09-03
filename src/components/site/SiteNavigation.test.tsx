import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

it('keeps retired routes out and exposes contact, waitlist, and app access', () => {
  render(
    <ThemeProvider>
      <SiteHeader />
      <SiteFooter />
    </ThemeProvider>,
  );

  expect(screen.queryAllByRole('link', { name: 'Product' })).toHaveLength(0);
  expect(screen.queryAllByRole('link', { name: 'About' })).toHaveLength(0);
  expect(screen.getAllByRole('link', { name: 'Join waiting list' })).toHaveLength(1);

  const primaryNavigation = screen.getByRole('navigation', { name: 'Primary navigation' });
  const talkLink = within(primaryNavigation).getByRole('link', { name: "Let's Talk" });
  const signInLink = screen.getByRole('link', { name: 'Sign in' });
  const headerWaitlistLink = screen.getByRole('link', { name: 'Join wait list' });
  const waitlistLink = screen.getAllByRole('link', { name: 'Join waiting list' })[0];
  const createSection = screen.getByText('Create').parentElement;
  const headerActions = talkLink.closest('.site-header__actions');
  expect(within(primaryNavigation).queryByRole('link', { name: 'Contact' })).not.toBeInTheDocument();
  expect(talkLink).toHaveAttribute('href', '/contact');
  expect(headerActions).not.toBeNull();
  expect(headerWaitlistLink).toHaveAttribute('href', '/waitlist');
  expect(headerWaitlistLink.closest('.site-header__actions')).toBe(headerActions);
  expect(signInLink).toHaveAttribute('href', 'https://backoffice.staging.kipory.com');
  expect(signInLink).not.toHaveAttribute('target');
  expect(signInLink.closest('.site-header__actions')).toBeNull();
  expect(createSection).not.toBeNull();
  if (!createSection) throw new Error('Create footer section was not rendered');
  expect(within(createSection).getByRole('link', { name: 'Sign in' })).toBe(signInLink);
  expect(waitlistLink.closest('.site-header__actions')).toBeNull();
  expect(talkLink.compareDocumentPosition(headerWaitlistLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it('uses the supplied logo asset in the header and footer brands', () => {
  render(
    <ThemeProvider>
      <SiteHeader />
      <SiteFooter />
    </ThemeProvider>,
  );

  screen.getAllByRole('link', { name: 'Kipory home' }).forEach((brand) => {
    const logo = brand.querySelector('img.brand__mark');

    expect(logo).not.toBeNull();
    expect(logo).toHaveAttribute('src', '/brand/kipory-symbol-vector.svg');
    expect(logo).toHaveAttribute('alt', '');
    expect(logo).toHaveAttribute('width', '34');
    expect(logo).toHaveAttribute('height', '32');
  });
});

it('orders footer destinations as explore, create, then connect', () => {
  const { container } = render(<SiteFooter />);

  const sectionHeadings = Array.from(
    container.querySelectorAll('.site-footer__link-heading'),
    (heading) => heading.textContent,
  );

  expect(sectionHeadings).toEqual(['Explore', 'Create', 'Connect']);
});
