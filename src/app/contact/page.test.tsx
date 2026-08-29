import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { expect, it } from 'vitest';

it('replaces a submitted contact inquiry form with an accessible success panel', async () => {
  const { default: ContactPage } = await import('./page');

  render(<ContactPage />);

  const title = screen.getByRole('heading', { level: 1, name: 'Show us how your system moves.' });
  const hero = title.closest('section');
  const beams = hero?.querySelector('[data-background-beams]');
  expect(beams).toBeTruthy();
  if (!beams) throw new Error('Contact hero beams were not rendered');
  expect(beams).toHaveAttribute('aria-hidden', 'true');
  expect(beams.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

  const form = screen.getByRole('form', { name: 'Contact Kipory' });
  expect(form).not.toHaveAttribute('action');

  const firstName = screen.getByRole('textbox', { name: 'First name' });
  const lastName = screen.getByRole('textbox', { name: 'Last name' });
  const company = screen.getByRole('textbox', { name: 'Company' });
  const companyEmail = screen.getByRole('textbox', { name: 'Company email' });
  const comments = screen.getByRole('textbox', { name: 'Comments' });
  const role = screen.getByRole('combobox', { name: 'Role' });
  const inquiryReason = screen.getByRole('combobox', { name: 'Reason for inquiry' });

  expect(firstName).toBeRequired();
  expect(firstName).toHaveAttribute('autocomplete', 'given-name');
  expect(lastName).toBeRequired();
  expect(lastName).toHaveAttribute('autocomplete', 'family-name');
  expect(company).toBeRequired();
  expect(company).toHaveAttribute('autocomplete', 'organization');
  expect(companyEmail).toBeRequired();
  expect(companyEmail).toHaveAttribute('type', 'email');
  expect(companyEmail).toHaveAttribute('autocomplete', 'email');
  expect(role).toBeRequired();
  expect(inquiryReason).toBeRequired();
  expect(comments).not.toBeRequired();

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
  expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Prepare message' })).not.toBeInTheDocument();
  expect(screen.queryByText('↗')).not.toBeInTheDocument();
  expect(screen.queryByText(/email application/)).not.toBeInTheDocument();

  fireEvent.submit(form);

  const status = await screen.findByRole('status');
  expect(screen.queryByRole('form', { name: 'Contact Kipory' })).not.toBeInTheDocument();
  expect(within(status).getByText('MESSAGE SENT')).toBeInTheDocument();
  expect(within(status).getByRole('heading', { name: "WE'LL TAKE IT FROM HERE." })).toBeInTheDocument();
  expect(
    within(status).getByText('Thanks for the context. Our team will review your note and follow up by email.'),
  ).toBeInTheDocument();
  await waitFor(() => expect(status).toHaveFocus());
});
