import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

it('exposes accessible native form controls while forwarding props and refs', async () => {
  const modulePath = './index';
  const controls = await import(/* @vite-ignore */ modulePath).catch(() => undefined);

  expect(controls, 'the reusable form-controls module should exist').toBeDefined();
  if (!controls) return;

  const { FormButton, FormDropdown, FormInput, FormTextarea } = controls;
  const inputRef = createRef<HTMLInputElement>();
  const textareaRef = createRef<HTMLTextAreaElement>();
  const dropdownRef = createRef<HTMLSelectElement>();
  const buttonRef = createRef<HTMLButtonElement>();

  render(
    <form aria-label="Control preview">
      <label htmlFor="preview-email">Work email</label>
      <FormInput
        ref={inputRef}
        className="custom-input"
        id="preview-email"
        name="email"
        type="email"
        required
      />

      <label htmlFor="preview-message">Message</label>
      <FormTextarea
        ref={textareaRef}
        className="custom-textarea"
        id="preview-message"
        name="message"
        rows={4}
      />

      <label htmlFor="preview-role">Role</label>
      <FormDropdown
        ref={dropdownRef}
        className="custom-dropdown"
        id="preview-role"
        name="role"
        defaultValue=""
        required
      >
        <option value="" disabled>Select a role</option>
        <option value="engineering">Engineering</option>
      </FormDropdown>

      <FormButton ref={buttonRef} className="custom-button" type="submit" disabled>
        Send message
      </FormButton>
    </form>,
  );

  const input = screen.getByRole('textbox', { name: 'Work email' });
  const textarea = screen.getByRole('textbox', { name: 'Message' });
  const dropdown = screen.getByRole('combobox', { name: 'Role' });
  const button = screen.getByRole('button', { name: 'Send message' });

  expect(input).toBe(inputRef.current);
  expect(input).toHaveAttribute('type', 'email');
  expect(input).toBeRequired();
  expect(input).toHaveClass('custom-input');
  expect(textarea).toBe(textareaRef.current);
  expect(textarea).toHaveAttribute('rows', '4');
  expect(textarea).toHaveClass('custom-textarea');
  expect(dropdown).toBe(dropdownRef.current);
  expect(dropdown).toBeRequired();
  expect(dropdown).toHaveValue('');
  expect(dropdown).toHaveClass('custom-dropdown');
  expect(button).toBe(buttonRef.current);
  expect(button).toBeDisabled();
  expect(button).toHaveClass('custom-button');
  expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

it.each([
  ['primary', 'button--accent'],
  ['secondary', 'button--light'],
  ['outline', 'button--outline'],
] as const)('applies the %s Next.js button treatment', async (variant, expectedClassName) => {
  const { FormButton } = await import('./FormButton');

  render(<FormButton variant={variant}>Continue</FormButton>);

  expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass(
    'button',
    expectedClassName,
  );
});

it('applies the compact Next.js button dimensions', async () => {
  const { FormButton } = await import('./FormButton');

  render(<FormButton size="compact">Continue</FormButton>);

  expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass(
    'button--compact',
  );
});

it('applies the extra-small Next.js button dimensions', async () => {
  const { FormButton } = await import('./FormButton');

  render(<FormButton size="small">Continue</FormButton>);

  expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass(
    'button--small',
  );
});

it('can omit the decorative arrow icon', async () => {
  const { FormButton } = await import('./FormButton');

  render(<FormButton icon="none">Continue</FormButton>);

  expect(screen.getByRole('button', { name: 'Continue' }).querySelector('svg')).toBeNull();
});

it('positions the custom dropdown chevron using horizontal padding', async () => {
  const { FormDropdown } = await import('./FormDropdown');

  render(
    <FormDropdown aria-label="Padded dropdown" horizontalPadding={10}>
      <option>Option</option>
    </FormDropdown>,
  );

  const dropdown = screen.getByRole('combobox', { name: 'Padded dropdown' });

  expect(dropdown.style.backgroundImage).toContain('data:image/svg+xml');
  expect(dropdown.style.backgroundPosition).toBe('calc(100% - 10px) center');
});

it('applies shared spacing and surface parameters to every text-entry control', async () => {
  const { FormDropdown, FormInput, FormTextarea } = await import('./index');
  const visualProps = {
    padding: 12,
    margin: 6,
    horizontalPadding: 18,
    horizontalMargin: 10,
    fontSize: 18,
    backgroundColor: '#112233',
    backgroundOpacity: 0.35,
    focusedBackgroundColor: '#445566',
    focusedBackgroundOpacity: 0.7,
  };

  render(
    <>
      <FormInput aria-label="Styled input" {...visualProps} />
      <FormDropdown aria-label="Styled dropdown" {...visualProps}>
        <option>Option</option>
      </FormDropdown>
      <FormTextarea aria-label="Styled textarea" {...visualProps} />
    </>,
  );

  for (const control of [
    screen.getByRole('textbox', { name: 'Styled input' }),
    screen.getByRole('combobox', { name: 'Styled dropdown' }),
    screen.getByRole('textbox', { name: 'Styled textarea' }),
  ]) {
    expect(control.style.getPropertyValue('--form-control-padding')).toBe('12px');
    expect(control.style.getPropertyValue('--form-control-margin')).toBe('6px');
    expect(control.style.getPropertyValue('--form-control-horizontal-padding')).toBe('18px');
    expect(control.style.getPropertyValue('--form-control-horizontal-margin')).toBe('10px');
    expect(control.style.fontSize).toBe('18px');
    expect(control.style.getPropertyValue('--form-control-background')).toBe('#112233');
    expect(control.style.getPropertyValue('--form-control-background-opacity')).toBe('35%');
    expect(control.style.getPropertyValue('--form-control-focused-background')).toBe('#445566');
    expect(control.style.getPropertyValue('--form-control-focused-background-opacity')).toBe('70%');
    expect(control.style.opacity).toBe('');
  }
});
