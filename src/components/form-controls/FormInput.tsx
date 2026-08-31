import type { ComponentPropsWithRef } from 'react';
import styles from './FormControls.module.css';
import {
  createFormControlStyle,
  type FormControlVisualProps,
} from './formControlVisualProps';

export type FormInputProps = ComponentPropsWithRef<'input'> & FormControlVisualProps;

export function FormInput({
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
}: FormInputProps) {
  return (
    <input
      {...props}
      className={[styles.control, className].filter(Boolean).join(' ')}
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
