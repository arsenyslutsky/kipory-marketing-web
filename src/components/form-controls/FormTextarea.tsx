import type { ComponentPropsWithRef } from 'react';
import styles from './FormControls.module.css';
import {
  createFormControlStyle,
  type FormControlVisualProps,
} from './formControlVisualProps';

export type FormTextareaProps = ComponentPropsWithRef<'textarea'> & FormControlVisualProps;

export function FormTextarea({
  className,
  padding,
  margin,
  horizontalPadding,
  horizontalMargin,
  fontSize,
  backgroundColor,
  backgroundOpacity,
  focusedBackgroundColor,
  focusedBackgroundOpacity,
  style,
  ...props
}: FormTextareaProps) {
  return (
    <textarea
      {...props}
      className={[styles.control, styles.textarea, className].filter(Boolean).join(' ')}
      style={createFormControlStyle(
        {
          padding,
          margin,
          horizontalPadding,
          horizontalMargin,
          fontSize,
          backgroundColor,
          backgroundOpacity,
          focusedBackgroundColor,
          focusedBackgroundOpacity,
        },
        style,
      )}
    />
  );
}
