import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import styles from './MarketingBlocks.module.css';

export type SplitLayoutVisualProps = {
  contentRatio?: number;
  visualRatio?: number;
  gap?: number;
  reversed?: boolean;
  hideVisualOnMobile?: boolean;
};

export type SplitLayoutProps = SplitLayoutVisualProps & Omit<HTMLAttributes<HTMLDivElement>, 'content'> & {
  content: ReactNode;
  visual: ReactNode;
};

export function SplitLayout({
  content,
  visual,
  className,
  contentRatio = 3,
  visualRatio = 2,
  gap = 72,
  reversed = false,
  hideVisualOnMobile = false,
  style,
  ...props
}: SplitLayoutProps) {
  const visualStyle = {
    '--split-content-ratio': `${contentRatio}fr`,
    '--split-visual-ratio': `${visualRatio}fr`,
    '--split-layout-gap': `${gap}px`,
    ...style,
  } as CSSProperties;

  return (
    <div
      className={[styles.split, className].filter(Boolean).join(' ')}
      data-reversed={String(reversed)}
      data-mobile-hide-visual={hideVisualOnMobile ? 'true' : undefined}
      role={props['aria-label'] ? 'group' : undefined}
      style={visualStyle}
      {...props}
    >
      <div className={styles.splitContent}>{content}</div>
      <div className={styles.splitVisual}>{visual}</div>
    </div>
  );
}
