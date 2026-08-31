import type { ComponentPropsWithRef } from 'react';
import styles from './FormControls.module.css';

export type FormButtonVariant = 'primary' | 'secondary' | 'outline';
export type FormButtonSize = 'default' | 'compact' | 'small';
export type FormButtonIcon = 'arrow' | 'none';
export type FormButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: FormButtonVariant;
  size?: FormButtonSize;
  icon?: FormButtonIcon;
};

const variantClassNames: Record<FormButtonVariant, string> = {
  primary: 'button--accent',
  secondary: 'button--light',
  outline: 'button--outline',
};

const sizeClassNames: Record<FormButtonSize, string | undefined> = {
  default: undefined,
  compact: 'button--compact',
  small: 'button--small',
};

export function FormButton({
  children,
  className,
  variant = 'primary',
  size = 'default',
  icon = 'arrow',
  ...props
}: FormButtonProps) {
  return (
    <button
      {...props}
      className={[
        'button',
        variantClassNames[variant],
        sizeClassNames[size],
        styles.button,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {icon === 'arrow' && (
        <svg className={styles.buttonIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M4 12 12 4M6 4h6v6" />
        </svg>
      )}
    </button>
  );
}
