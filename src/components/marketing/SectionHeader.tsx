import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import styles from './MarketingBlocks.module.css';

export type SectionHeaderVisualProps = {
  headerGap?: number;
  titleWidth?: number;
};

export type SectionHeaderProps = SectionHeaderVisualProps & HTMLAttributes<HTMLElement> & {
  eyebrow: ReactNode;
  title: ReactNode;
  titleId?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  titleId,
  className,
  headerGap = 22,
  titleWidth = 700,
  style,
  ...props
}: SectionHeaderProps) {
  const visualStyle = {
    '--section-header-gap': `${headerGap}px`,
    '--section-header-title-width': `${titleWidth}px`,
    ...style,
  } as CSSProperties;

  return (
    <header className={[styles.sectionHeader, className].filter(Boolean).join(' ')} style={visualStyle} {...props}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id={titleId} className={styles.sectionTitle}>{title}</h2>
    </header>
  );
}
