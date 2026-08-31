'use client';

import type { CSSProperties, FormEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import styles from './SubmissionForm.module.css';

const successRevealStyle = {
  '--submission-reveal-delay': '100ms',
  '--submission-reveal-duration': '900ms',
} as CSSProperties;

type SubmissionFormProps = {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  onSubmitted?: () => void;
  panelSize?: 'default' | 'tall';
  successBody: string;
  successStatus: string;
  successTitle: string;
};

export function SubmissionForm({
  ariaLabel,
  children,
  className,
  onSubmitted,
  panelSize = 'default',
  successBody,
  successStatus,
  successTitle,
}: SubmissionFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);
  const leftShiftPressedRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === 'ShiftLeft') leftShiftPressedRef.current = true;
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === 'ShiftLeft') leftShiftPressedRef.current = false;
    }

    function handleWindowBlur() {
      leftShiftPressedRef.current = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  useEffect(() => {
    if (submitted) panelRef.current?.focus();
  }, [submitted]);

  function completeSubmission() {
    if (submittedRef.current) return;

    submittedRef.current = true;
    setSubmitted(true);
    onSubmitted?.();
  }

  function handleClickCapture(event: ReactMouseEvent<HTMLFormElement>) {
    if (!leftShiftPressedRef.current) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const submitControl = target.closest('button[type="submit"], input[type="submit"]');
    if (!submitControl || !event.currentTarget.contains(submitControl)) return;

    event.preventDefault();
    completeSubmission();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    completeSubmission();
  }

  if (submitted) {
    return (
      <section
        ref={panelRef}
        className={`${styles.panel} ${panelSize === 'tall' ? styles.panelTall : ''}`}
        data-reveal-duration="1000ms"
        role="status"
        aria-atomic="true"
        aria-labelledby={titleId}
        style={successRevealStyle}
        tabIndex={-1}
      >
        <svg
          className={styles.mark}
          data-reveal="mark"
          viewBox="0 0 72 72"
          aria-hidden="true"
          focusable="false"
        >
          <path className={styles.markCheck} d="M17 37 29 49 55 23" />
          <path className={styles.markFrame} d="M8 8h16M8 8v16M64 48v16H48" />
        </svg>
        <p className={styles.status} data-reveal="status">{successStatus}</p>
        <h2 id={titleId} className={styles.title} data-reveal="title">{successTitle}</h2>
        <p className={styles.body} data-reveal="body">{successBody}</p>
      </section>
    );
  }

  return (
    <form
      className={className}
      aria-label={ariaLabel}
      autoComplete="off"
      onClickCapture={handleClickCapture}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}
