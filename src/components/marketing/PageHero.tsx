import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { siteContainerHomepageProps } from './presets';
import { SiteContainer } from './SiteContainer';
import styles from './MarketingBlocks.module.css';

export type PageHeroVisualProps = {
  paddingTop?: number;
  paddingBottom?: number;
  headingGap?: number;
  titleMaxWidth?: number;
};

export type PageHeroProps = PageHeroVisualProps & HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  subtitle: ReactNode;
  titleId?: string;
};

export function PageHero({
  title,
  subtitle,
  titleId,
  className,
  paddingTop = 164,
  paddingBottom = 96,
  headingGap = 28,
  titleMaxWidth = 9,
  style,
  ...props
}: PageHeroProps) {
  const visualStyle = {
    '--page-hero-padding-top': `${paddingTop}px`,
    '--page-hero-padding-bottom': `${paddingBottom}px`,
    '--page-hero-heading-gap': `${headingGap}px`,
    '--page-hero-title-max-width': `${titleMaxWidth}ch`,
    ...style,
  } as CSSProperties;

  return (
    <section
      className={[styles.pageHero, className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      style={visualStyle}
      {...props}
    >
      <SiteContainer {...siteContainerHomepageProps}>
        <div className={styles.pageHeroHeading}>
          <h1 id={titleId} className={styles.pageHeroTitle}>{title}</h1>
          <p className={styles.pageHeroSubtitle}>{subtitle}</p>
        </div>
      </SiteContainer>
    </section>
  );
}
