import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import controlStyles from '@/components/form-controls/FormControls.module.css';
import { ThemeProvider } from '@/theme/ThemeProvider';
import styles from '../marketing.module.css';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('uses the waitlist core PNG set instead of mounting WebGL on mobile', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList));
  const { default: WaitlistPage } = await import('./page');

  const darkView = render(<ThemeProvider preference="dark"><WaitlistPage /></ThemeProvider>);
  const darkImage = darkView.container.querySelector<HTMLImageElement>(
    '[data-mobile-workflow-fallback="waitlist-core"] img',
  );

  expect(darkImage?.style.getPropertyValue('--mobile-workflow-dark-image')).toBe(
    'image-set(url("/images/workflows/mobile/waitlist-core-flow.png") 1x, url("/images/workflows/mobile/waitlist-core-flow@2x.png") 2x, url("/images/workflows/mobile/waitlist-core-flow@3x.png") 3x)',
  );
  expect(darkImage).not.toHaveAttribute('src', '/images/workflows/mobile/waitlist-core-flow.png');
  expect(darkImage).not.toHaveAttribute('srcset');
  expect(darkImage).toHaveAttribute('width', '176');
  expect(darkImage).toHaveAttribute('height', '176');
  expect(darkImage?.parentElement).toHaveStyle({
    aspectRatio: '176 / 176',
    width: 'min(100%, 176px)',
  });
  expect(darkView.container.querySelector('[data-flow-state]')).not.toBeInTheDocument();
  expect(darkView.container.querySelector('canvas')).not.toBeInTheDocument();

  darkView.unmount();

  const lightView = render(<ThemeProvider preference="light"><WaitlistPage /></ThemeProvider>);
  const lightImage = lightView.container.querySelector<HTMLImageElement>(
    '[data-mobile-workflow-fallback="waitlist-core"] img',
  );

  expect(lightImage?.style.getPropertyValue('--mobile-workflow-light-image')).toBe(
    'image-set(url("/images/workflows/mobile/waitlist-core-flow-light.png") 1x, url("/images/workflows/mobile/waitlist-core-flow-light@2x.png") 2x, url("/images/workflows/mobile/waitlist-core-flow-light@3x.png") 3x)',
  );
  expect(lightImage).not.toHaveAttribute('src', '/images/workflows/mobile/waitlist-core-flow-light.png');
  expect(lightImage).not.toHaveAttribute('srcset');
});

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

  const notesHeading = screen.getByText('Want early access?');
  const notesBody = screen.getByText(
    'Tell us who you are and where you work. We’ll follow up by email as Kipory access expands.',
  );
  expect(notesHeading).toHaveClass(styles.pageTextReveal, styles.pageTextRevealLead);
  expect(notesBody).toHaveClass(styles.pageTextReveal, styles.pageTextRevealBody);
  const coreFlow = screen.getByRole('img', {
    name: /Business core node flow with .* outward auxiliary connections/,
  });
  expect(coreFlow.parentElement).toBe(notesBody.parentElement);
  expect(notesBody.compareDocumentPosition(coreFlow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.queryByText('What happens next')).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      'We’ll review your request and keep you informed by email as access expands.',
    ),
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Leave your details and we will keep you informed/)).not.toBeInTheDocument();
  expect(screen.queryByText(/This form opens your email application/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Submitting opens a message addressed/)).not.toBeInTheDocument();

  const form = screen.getByRole('form', { name: 'Join the Kipory waiting list' });
  expect(form).not.toHaveAttribute('action');
  expect(form).toHaveAttribute('autocomplete', 'off');
  expect(form).not.toHaveClass(styles.pageTextReveal);
  const name = screen.getByRole('textbox', { name: 'Name' });
  const email = screen.getByRole('textbox', { name: 'Work email' });
  const company = screen.getByRole('textbox', { name: 'Company (optional)' });
  const submitButton = screen.getByRole('button', { name: 'Join waitlist' });
  [name, email, company].forEach((control) => {
    expect(control).toHaveClass(controlStyles.control);
    expect(control).toHaveStyle({ fontSize: '24px' });
    expect(control.style.getPropertyValue('--form-control-padding')).toBe('9px');
    expect(control.style.getPropertyValue('--form-control-margin')).toBe('0px');
    expect(control.style.getPropertyValue('--form-control-horizontal-padding')).toBe('10px');
    expect(control.style.getPropertyValue('--form-control-background')).toBe('#006838');
    expect(control.style.getPropertyValue('--form-control-background-opacity')).toBe('5%');
    expect(control.style.getPropertyValue('--form-control-focused-background')).toBe('#006838');
    expect(control.style.getPropertyValue('--form-control-focused-background-opacity')).toBe('25%');
  });
  expect(submitButton).toHaveClass(controlStyles.button);
  expect(name.parentElement).toHaveStyle({
    '--form-field-control-padding': '8px',
    '--form-field-control-margin': '8px',
  });
  expect(name).toBeRequired();
  expect(name).toHaveAttribute('autocomplete', 'off');
  expect(email).toBeRequired();
  expect(email).toHaveAttribute('autocomplete', 'off');
  expect(company).not.toBeRequired();
  expect(company).toHaveAttribute('autocomplete', 'off');
  expect(submitButton).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Prepare waitlist email' })).not.toBeInTheDocument();
  expect(screen.queryByText('Early access')).not.toBeInTheDocument();
  expect(screen.queryByText('Stay in the loop')).not.toBeInTheDocument();
  expect(screen.queryByText('↗')).not.toBeInTheDocument();

  fireEvent.submit(form);

  const status = await screen.findByRole('status');
  expect(screen.queryByRole('form', { name: 'Join the Kipory waiting list' })).not.toBeInTheDocument();
  const submittedNotesHeading = screen.getByText('What happens next');
  const submittedNotesBody = screen.getByText(
    'We’ll review your request and keep you informed by email as access expands.',
  );
  expect(submittedNotesHeading).toHaveClass(styles.submissionTextRevealHeading);
  expect(submittedNotesBody).toHaveClass(styles.submissionTextRevealBody);
  expect(screen.queryByText('Want early access?')).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      'Tell us who you are and where you work. We’ll follow up by email as Kipory access expands.',
    ),
  ).not.toBeInTheDocument();
  expect(status).toHaveAttribute('data-reveal-duration', '1000ms');
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
    name: 'Let’s talk about what’s next.',
  });
  const contactSubtitle = screen.getByText('QUESTIONS AND IDEAS - START HERE.');
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
