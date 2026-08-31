import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import styles from './MarketingBlocks.module.css';

export type FormFieldVisualProps = {
  fieldGap?: number;
  controlPadding?: number;
  controlMargin?: number;
  textareaHeight?: number;
};

export type FormFieldProps = PropsWithChildren<
  FormFieldVisualProps & HTMLAttributes<HTMLDivElement> & {
    label: string;
    htmlFor: string;
    wide?: boolean;
  }
>;

export function FormField({
  children,
  label,
  htmlFor,
  wide = false,
  className,
  fieldGap = 10,
  controlPadding = 16,
  controlMargin = 0,
  textareaHeight = 130,
  style,
  ...props
}: FormFieldProps) {
  const visualStyle = {
    '--form-field-gap': `${fieldGap}px`,
    '--form-field-control-padding': `${controlPadding}px`,
    '--form-field-control-margin': `${controlMargin}px`,
    '--form-field-textarea-height': `${textareaHeight}px`,
    ...style,
  } as CSSProperties;

  return (
    <div className={[styles.field, wide && styles.fieldWide, className].filter(Boolean).join(' ')} style={visualStyle} {...props}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
