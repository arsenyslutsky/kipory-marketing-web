import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SiteHeader } from './SiteHeader';

it('opens the staging backoffice from the Sign in action', () => {
  render(<SiteHeader />);

  const signIn = screen.getByRole('link', { name: 'Sign in' });
  expect(signIn).toHaveAttribute('href', 'https://backoffice.staging.kipory.com');
  expect(signIn).not.toHaveAttribute('target');
});
