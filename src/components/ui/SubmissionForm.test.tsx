import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SubmissionForm } from './SubmissionForm';

function renderRequiredForm() {
  render(
    <SubmissionForm
      ariaLabel="Test form"
      className="test-form"
      successBody="Finished"
      successStatus="SENT"
      successTitle="DONE"
    >
      <label htmlFor="required-field">Required field</label>
      <input id="required-field" required />
      <button type="submit">Submit</button>
    </SubmissionForm>,
  );
}

afterEach(() => {
  fireEvent.keyUp(window, { key: 'Shift', code: 'ShiftLeft' });
  fireEvent.keyUp(window, { key: 'Shift', code: 'ShiftRight' });
});

describe('SubmissionForm validation testing shortcut', () => {
  it('keeps native required-field validation for a normal submit-button click', () => {
    renderRequiredForm();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByRole('form', { name: 'Test form' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps native required-field validation while Right Shift is held', () => {
    renderRequiredForm();
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftRight' });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByRole('form', { name: 'Test form' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('bypasses required-field validation when the submit button is clicked with Left Shift held', () => {
    renderRequiredForm();
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftLeft' });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.queryByRole('form', { name: 'Test form' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('DONE');
  });
});
