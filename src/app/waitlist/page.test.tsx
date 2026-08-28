import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('renders an email-backed waiting-list form', async () => {
  const pageModulePath = './page';
  const pageModule = await import(/* @vite-ignore */ pageModulePath).catch(() => undefined);
  expect(pageModule, 'the /waitlist page module should exist').toBeDefined();
  if (!pageModule) return;

  const { default: WaitlistPage } = pageModule;

  render(<WaitlistPage />);

  const title = screen.getByRole('heading', { level: 1, name: 'Join the waiting list.' });
  const subtitle = screen.getByText('See the flow sooner.');
  const body = screen.getByText(
    'Leave your details and we will keep you informed as Kipory prepares for wider access.',
  );
  expect(subtitle.closest('h1')).toBeNull();
  expect(title.compareDocumentPosition(subtitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(subtitle.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

  const form = screen.getByRole('form', { name: 'Join the Kipory waiting list' });
  expect(form).toHaveAttribute('action', 'mailto:hello@kipory.com?subject=Kipory%20waiting%20list');
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
  expect(screen.getByRole('textbox', { name: 'Work email' })).toBeRequired();
  expect(screen.getByRole('textbox', { name: 'Company (optional)' })).not.toBeRequired();
  expect(screen.getByRole('button', { name: 'Prepare waitlist email' })).toBeInTheDocument();
  expect(screen.queryByText('Early access')).not.toBeInTheDocument();
  expect(screen.queryByText('Stay in the loop')).not.toBeInTheDocument();
  expect(screen.queryByText('↗')).not.toBeInTheDocument();
});

it('isolates the waitlist hero treatment from the shared contact hero', async () => {
  const [{ default: WaitlistPage }, { default: ContactPage }] = await Promise.all([
    import('./page'),
    import('../contact/page'),
  ]);
  const waitlist = render(<WaitlistPage />);
  const waitlistHeroClass = screen.getByRole('heading', {
    level: 1,
    name: 'Join the waiting list.',
  }).closest('section')?.className;
  waitlist.unmount();

  render(<ContactPage />);
  const contactHeroClass = screen.getByRole('heading', {
    level: 1,
    name: 'Show us how your system moves.',
  }).closest('section')?.className;

  expect(waitlistHeroClass).toBeTruthy();
  expect(contactHeroClass).toBeTruthy();
  expect(waitlistHeroClass).not.toBe(contactHeroClass);
});
