import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SiteHeader } from './SiteHeader';

it('opens the Kipory app from the Sign in action', () => {
  render(<SiteHeader />);

  const signIn = screen.getByRole('link', { name: 'Sign in' });
  expect(signIn).toHaveAttribute('href', 'https://app.kipory.com/');
  expect(signIn).not.toHaveAttribute('target');
});
