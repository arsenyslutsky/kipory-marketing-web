import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
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

  it('notifies companion content when Left Shift completes the form', () => {
    function FormWithCompanionContent() {
      const [companionSubmitted, setCompanionSubmitted] = useState(false);

      return (
        <>
          <p>{companionSubmitted ? 'Companion submitted' : 'Companion pending'}</p>
          <SubmissionForm
            ariaLabel="Test form"
            className="test-form"
            onSubmitted={() => setCompanionSubmitted(true)}
            successBody="Finished"
            successStatus="SENT"
            successTitle="DONE"
          >
            <label htmlFor="required-field">Required field</label>
            <input id="required-field" required />
            <button type="submit">Submit</button>
          </SubmissionForm>
        </>
      );
    }

    render(<FormWithCompanionContent />);
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftLeft' });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Companion submitted')).toBeInTheDocument();
    expect(screen.queryByText('Companion pending')).not.toBeInTheDocument();
  });
});

describe('SubmissionForm success feedback', () => {
  it('assigns ordered entrance stages to the success mark and message', () => {
    renderRequiredForm();
    fireEvent.keyDown(window, { key: 'Shift', code: 'ShiftLeft' });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    const panel = screen.getByRole('status');
    expect(panel).toHaveAttribute('data-reveal-duration', '1000ms');
    expect(panel).toHaveStyle({
      '--submission-reveal-delay': '100ms',
      '--submission-reveal-duration': '900ms',
    });
    expect(panel.querySelector('[data-reveal="mark"]')).toBeInTheDocument();
    expect(within(panel).getByText('SENT')).toHaveAttribute('data-reveal', 'status');
    expect(within(panel).getByRole('heading', { name: 'DONE' }))
      .toHaveAttribute('data-reveal', 'title');
    expect(within(panel).getByText('Finished')).toHaveAttribute('data-reveal', 'body');
  });
});
