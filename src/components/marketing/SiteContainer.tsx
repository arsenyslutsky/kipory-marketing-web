import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import styles from './MarketingBlocks.module.css';

export type SiteContainerVisualProps = {
  maxWidth?: number;
  gutter?: number;
  compactGutter?: number;
};

export type SiteContainerProps = PropsWithChildren<
  SiteContainerVisualProps & HTMLAttributes<HTMLDivElement>
>;

export function SiteContainer({
  children,
  className,
  maxWidth = 1180,
  gutter = 24,
  compactGutter = 14,
  style,
  ...props
}: SiteContainerProps) {
  const visualStyle = {
    '--site-container-max-width': `${maxWidth}px`,
    '--site-container-gutter': `${gutter}px`,
    '--site-container-compact-gutter': `${compactGutter}px`,
    ...style,
  } as CSSProperties;

  return <div className={[styles.container, className].filter(Boolean).join(' ')} style={visualStyle} {...props}>{children}</div>;
}
