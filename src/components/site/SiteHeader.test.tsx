import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SiteHeader } from './SiteHeader';

it('uses the waiting list as the primary header action', () => {
  render(<SiteHeader />);

  const waitlist = screen.getByRole('link', { name: 'Join wait list' });
  expect(waitlist).toHaveAttribute('href', '/waitlist');
  expect(waitlist).toHaveClass('button', 'button--compact', 'button--light', 'site-header__cta');
  expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
});
