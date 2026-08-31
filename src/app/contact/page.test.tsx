import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import controlStyles from '@/components/form-controls/FormControls.module.css';
import styles from '../marketing.module.css';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('uses the contact core PNG set instead of mounting WebGL on mobile', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList));
  const { default: ContactPage } = await import('./page');

  const { container } = render(<ContactPage />);
  const image = container.querySelector<HTMLImageElement>(
    '[data-mobile-workflow-fallback="contact-core"] img',
  );

  expect(image).toHaveAttribute('src', '/images/workflows/mobile/contact-core-flow.png');
  expect(image).toHaveAttribute(
    'srcset',
    '/images/workflows/mobile/contact-core-flow.png 1x, /images/workflows/mobile/contact-core-flow@2x.png 2x, /images/workflows/mobile/contact-core-flow@3x.png 3x',
  );
  expect(image?.parentElement).toHaveStyle({
    aspectRatio: '176 / 176',
    width: 'min(100%, 176px)',
  });
  expect(container.querySelector('[data-flow-state]')).not.toBeInTheDocument();
  expect(container.querySelector('canvas')).not.toBeInTheDocument();
});

it('replaces a submitted contact inquiry form with an accessible success panel', async () => {
  const { default: ContactPage } = await import('./page');

  render(<ContactPage />);

  expect(screen.getByRole('main')).toHaveAttribute('data-route-transition', 'quiet-signal');

  const title = screen.getByRole('heading', { level: 1, name: 'Let’s talk about what’s next.' });
  const subtitle = screen.getByText('QUESTIONS AND IDEAS - START HERE.');
  const hero = title.closest('section');
  const beams = hero?.querySelector('[data-background-beams]');
  expect(beams).toBeTruthy();
  if (!beams) throw new Error('Contact hero beams were not rendered');
  expect(beams).toHaveAttribute('aria-hidden', 'true');
  expect(beams.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(title).toHaveClass(styles.pageTextReveal, styles.pageTextRevealFirst);
  expect(subtitle).toHaveClass(styles.pageTextReveal, styles.pageTextRevealSecond);

  const notesHeading = screen.getByText('We’d love to hear from you.');
  const notesBody = screen.getByText(
    'Reach out with questions, product inquiries, or anything else you’d like to discuss. Share a few details and we’ll take it from there.',
  );
  expect(screen.getByText('Start a conversation')).toHaveClass(
    styles.pageTextReveal,
    styles.pageTextRevealLead,
  );
  expect(notesHeading).toHaveClass(styles.pageTextReveal, styles.pageTextRevealLead);
  expect(notesBody).toHaveClass(styles.pageTextReveal, styles.pageTextRevealBody);
  const coreFlow = screen.getByRole('img', {
    name: /Business core node flow with .* outward auxiliary connections/,
  });
  expect(coreFlow.parentElement).toBe(notesBody.parentElement);
  expect(
    notesBody.compareDocumentPosition(coreFlow) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(screen.queryByText('What happens next')).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      'Thanks for reaching out. We’ll review your message and get back to you as soon as possible.',
    ),
  ).not.toBeInTheDocument();

  const form = screen.getByRole('form', { name: 'Contact Kipory' });
  expect(form).not.toHaveAttribute('action');
  expect(form).toHaveAttribute('autocomplete', 'off');
  expect(form).not.toHaveClass(styles.pageTextReveal);

  const firstName = screen.getByRole('textbox', { name: 'First name' });
  const lastName = screen.getByRole('textbox', { name: 'Last name' });
  const company = screen.getByRole('textbox', { name: 'Company' });
  const companyEmail = screen.getByRole('textbox', { name: 'Company email' });
  const comments = screen.getByRole('textbox', { name: 'Comments' });
  const role = screen.getByRole('combobox', { name: 'Role' });
  const inquiryReason = screen.getByRole('combobox', { name: 'Reason for inquiry' });
  const submitButton = screen.getByRole('button', { name: 'Send message' });

  [firstName, lastName, company, companyEmail, comments, role, inquiryReason].forEach((control) => {
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
  expect(comments).toHaveClass(controlStyles.textarea);
  expect(role).toHaveClass(controlStyles.dropdown);
  expect(inquiryReason).toHaveClass(controlStyles.dropdown);
  expect(submitButton).toHaveClass(controlStyles.button);

  expect(firstName.parentElement).toHaveStyle({
    '--form-field-control-padding': '8px',
    '--form-field-control-margin': '8px',
  });

  expect(firstName).toBeRequired();
  expect(firstName).toHaveAttribute('autocomplete', 'off');
  expect(lastName).toBeRequired();
  expect(lastName).toHaveAttribute('autocomplete', 'off');
  expect(company).toBeRequired();
  expect(company).toHaveAttribute('autocomplete', 'off');
  expect(companyEmail).toBeRequired();
  expect(companyEmail).toHaveAttribute('type', 'email');
  expect(companyEmail).toHaveAttribute('autocomplete', 'off');
  expect(role).toBeRequired();
  expect(inquiryReason).toBeRequired();
  expect(comments).not.toBeRequired();
  expect(comments).toHaveAttribute('autocomplete', 'off');

  expect(within(role).getAllByRole('option').map((option) => option.textContent)).toEqual([
    'Select your role',
    'Development / Engineering',
    'Management / Leadership',
    'Product',
    'Data / Analytics',
    'Operations',
    'Other',
  ]);
  expect(within(inquiryReason).getAllByRole('option').map((option) => option.textContent)).toEqual([
    'Select a reason',
    'Product demo',
    'Technical questions',
    'Pricing and access',
    'Partnership',
    'Press and media',
    'Other',
  ]);
  expect(within(inquiryReason).queryByRole('option', { name: 'Careers' })).not.toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Prepare message' })).not.toBeInTheDocument();
  expect(screen.queryByText('↗')).not.toBeInTheDocument();
  expect(screen.queryByText(/email application/)).not.toBeInTheDocument();

  fireEvent.submit(form);

  const status = await screen.findByRole('status');
  expect(screen.queryByRole('form', { name: 'Contact Kipory' })).not.toBeInTheDocument();
  expect(screen.getByText('What happens next')).toBeInTheDocument();
  const submittedNotesHeading = screen.getByText('What happens next');
  const submittedNotesBody = screen.getByText(
    'Thanks for reaching out. We’ll review your message and get back to you as soon as possible.',
  );
  expect(submittedNotesHeading).toHaveClass(styles.submissionTextRevealHeading);
  expect(submittedNotesBody).toHaveClass(styles.submissionTextRevealBody);
  expect(screen.queryByText('We’d love to hear from you.')).not.toBeInTheDocument();
  expect(
    screen.queryByText(
      'Reach out with questions, product inquiries, or anything else you’d like to discuss. Share a few details and we’ll take it from there.',
    ),
  ).not.toBeInTheDocument();
  expect(within(status).getByText('MESSAGE SENT')).toBeInTheDocument();
  expect(status).toHaveAttribute('data-reveal-duration', '1000ms');
  expect(within(status).getByRole('heading', { name: "WE'LL TAKE IT FROM HERE." })).toBeInTheDocument();
  expect(
    within(status).getByText('Thanks for the context. Our team will review your note and follow up by email.'),
  ).toBeInTheDocument();
  await waitFor(() => expect(status).toHaveFocus());
});
