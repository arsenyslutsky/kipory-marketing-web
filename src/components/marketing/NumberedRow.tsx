import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import styles from './MarketingBlocks.module.css';

export type NumberedRowVisualProps = {
  rowPadding?: number;
  minHeight?: number;
  numberColumnWidth?: number;
  gap?: number;
};

export type NumberedRowProps = NumberedRowVisualProps & HTMLAttributes<HTMLElement> & {
  number: string;
  title: ReactNode;
  accent: ReactNode;
  body?: ReactNode;
  href?: string;
};

export function NumberedRow({
  number,
  title,
  accent,
  body,
  href,
  className,
  rowPadding = 28,
  minHeight = 132,
  numberColumnWidth = 52,
  gap = 22,
  style,
  ...props
}: NumberedRowProps) {
  const visualStyle = {
    '--numbered-row-padding': `${rowPadding}px`,
    '--numbered-row-min-height': `${minHeight}px`,
    '--numbered-row-number-column': `${numberColumnWidth}px`,
    '--numbered-row-gap': `${gap}px`,
    ...style,
  } as CSSProperties;
  const row = (
    <article
      className={[styles.numberedRow, className].filter(Boolean).join(' ')}
      data-linked={href ? 'true' : 'false'}
      style={visualStyle}
      {...props}
    >
      <span className={styles.countBox}>{number}</span>
      <div className={styles.numberedCopy}>
        <h3 className={styles.numberedTitle}>
          {title}
          <span className={styles.numberedAccent}>{accent}</span>
        </h3>
        {body ? <p className={styles.numberedBody}>{body}</p> : null}
      </div>
    </article>
  );

  return href ? <Link className={styles.numberedRowLink} href={href}>{row}</Link> : row;
}
