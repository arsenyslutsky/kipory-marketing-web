import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import styles from '../marketing.module.css';

it('replaces a submitted waiting-list form with an accessible success panel', async () => {
  const pageModulePath = './page';
  const pageModule = await import(/* @vite-ignore */ pageModulePath).catch(() => undefined);
  expect(pageModule, 'the /waitlist page module should exist').toBeDefined();
  if (!pageModule) return;

  const { default: WaitlistPage } = pageModule;

  render(<WaitlistPage />);

  expect(screen.getByRole('main')).toHaveAttribute('data-route-transition', 'quiet-signal');

  const title = screen.getByRole('heading', { level: 1, name: 'Join the waiting list.' });
  const subtitle = screen.getByText('SEE THE FLOW SOONER.');
  const hero = title.closest('section');
  const beams = hero?.querySelector('[data-background-beams]');
  expect(beams).toBeTruthy();
  if (!beams) throw new Error('Waitlist hero beams were not rendered');
  expect(beams).toHaveAttribute('aria-hidden', 'true');
  expect(beams.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(subtitle.closest('h1')).toBeNull();
  expect(subtitle.parentElement).toBe(title.parentElement);
  expect(title.compareDocumentPosition(subtitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(title).toHaveClass(styles.pageTextReveal, styles.pageTextRevealFirst);
  expect(subtitle).toHaveClass(styles.pageTextReveal, styles.pageTextRevealSecond);

  const notesHeading = screen.getByText('What happens next');
  const notesBody = screen.getByText(
    'Tell us who you are and where you work. We will use your email to follow up about Kipory access.',
  );
  expect(notesHeading).toHaveClass(styles.pageTextReveal, styles.pageTextRevealLead);
  expect(notesBody).toHaveClass(styles.pageTextReveal, styles.pageTextRevealBody);
  expect(screen.queryByText(/Leave your details and we will keep you informed/)).not.toBeInTheDocument();
  expect(screen.queryByText(/This form opens your email application/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Submitting opens a message addressed/)).not.toBeInTheDocument();

  const form = screen.getByRole('form', { name: 'Join the Kipory waiting list' });
  expect(form).not.toHaveAttribute('action');
  expect(form).not.toHaveClass(styles.pageTextReveal);
  expect(screen.getByRole('textbox', { name: 'Name' })).toBeRequired();
  expect(screen.getByRole('textbox', { name: 'Work email' })).toBeRequired();
  expect(screen.getByRole('textbox', { name: 'Company (optional)' })).not.toBeRequired();
  expect(screen.getByRole('button', { name: 'Join waitlist' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Prepare waitlist email' })).not.toBeInTheDocument();
  expect(screen.queryByText('Early access')).not.toBeInTheDocument();
  expect(screen.queryByText('Stay in the loop')).not.toBeInTheDocument();
  expect(screen.queryByText('↗')).not.toBeInTheDocument();

  fireEvent.submit(form);

  const status = await screen.findByRole('status');
  expect(screen.queryByRole('form', { name: 'Join the Kipory waiting list' })).not.toBeInTheDocument();
  expect(within(status).getByText('ACCESS REQUESTED')).toBeInTheDocument();
  expect(within(status).getByRole('heading', { name: "YOU'RE ON THE LIST." })).toBeInTheDocument();
  expect(
    within(status).getByText("Thanks for joining. We'll keep you informed as Kipory access expands."),
  ).toBeInTheDocument();
  await waitFor(() => expect(status).toHaveFocus());
});

it('reuses the waitlist hero treatment for the contact hero', async () => {
  const [{ default: WaitlistPage }, { default: ContactPage }] = await Promise.all([
    import('./page'),
    import('../contact/page'),
  ]);
  const waitlist = render(<WaitlistPage />);
  const waitlistTitle = screen.getByRole('heading', {
    level: 1,
    name: 'Join the waiting list.',
  });
  const waitlistHero = waitlistTitle.closest('section');
  const waitlistHeading = waitlistTitle.parentElement;
  const waitlistGrid = waitlistHeading?.parentElement;
  waitlist.unmount();

  render(<ContactPage />);
  const contactTitle = screen.getByRole('heading', {
    level: 1,
    name: 'Show us how your system moves.',
  });
  const contactSubtitle = screen.getByText('SHOW US WHERE WORK STOPS.');
  const contactHero = contactTitle.closest('section');
  const contactHeading = contactTitle.parentElement;
  const contactGrid = contactHeading?.parentElement;

  expect(waitlistHero).toBeTruthy();
  expect(contactHero).toBeTruthy();
  expect(contactHero?.className).toBe(waitlistHero?.className);
  expect(contactGrid?.className).toBe(waitlistGrid?.className);
  expect(contactHeading?.className).toBe(waitlistHeading?.className);
  expect(contactSubtitle.parentElement).toBe(contactHeading);
  expect(screen.queryByText('Contact')).not.toBeInTheDocument();
  expect(screen.queryByText(/Tell us where work crosses boundaries/)).not.toBeInTheDocument();
});

it('reuses the waitlist form-section treatment for the contact form', async () => {
  const [{ default: WaitlistPage }, { default: ContactPage }] = await Promise.all([
    import('./page'),
    import('../contact/page'),
  ]);
  const waitlist = render(<WaitlistPage />);
  const waitlistSectionClass = screen
    .getByRole('form', { name: 'Join the Kipory waiting list' })
    .closest('section')?.className;
  waitlist.unmount();

  render(<ContactPage />);
  const contactSectionClass = screen
    .getByRole('form', { name: 'Contact Kipory' })
    .closest('section')?.className;

  expect(waitlistSectionClass).toBeTruthy();
  expect(contactSectionClass).toBe(waitlistSectionClass);
});
