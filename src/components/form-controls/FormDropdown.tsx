import type { ComponentPropsWithRef } from 'react';
import styles from './FormControls.module.css';
import {
  createFormControlStyle,
  type FormControlVisualProps,
} from './formControlVisualProps';

const dropdownChevronImage =
  'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMiA4Jz48cGF0aCBkPSdtMSAxIDUgNSA1LTUnIGZpbGw9J25vbmUnIHN0cm9rZT0nIzlmYjk5Nicgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdzcXVhcmUnIHN0cm9rZS1saW5lam9pbj0nbWl0ZXInLz48L3N2Zz4=")';

export type FormDropdownProps = ComponentPropsWithRef<'select'> & FormControlVisualProps;

export function FormDropdown({
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
}: FormDropdownProps) {
  return (
    <select
      {...props}
      className={[styles.control, styles.dropdown, className].filter(Boolean).join(' ')}
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
        {
          backgroundImage: dropdownChevronImage,
          backgroundPosition: `calc(100% - ${horizontalPadding ?? 0}px) center`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '12px 8px',
          ...style,
        },
      )}
    />
  );
}
