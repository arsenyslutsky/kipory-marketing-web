import Link from 'next/link';

import { ProtocolIconList } from '@/components/icons/ProtocolIconList';
import { protocolIconListHomepageProps } from '@/components/icons/ProtocolIconList/presets';
import { SiteContainer } from '@/components/marketing';
import { siteContainerHomepageProps } from '@/components/marketing/presets';
import { GlowLink } from '@/components/ui/GlowLink';
import { glowLinkHomepageProps } from '@/components/ui/GlowLink.presets';
import {
  BusinessFlow3D,
  businessFlow3DHomepageProps,
} from '@/features/business-flow-3d';
import styles from '../marketing.module.css';
import { LearnMoreLink } from './LearnMoreLink';

export function HomepageHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroVisual} data-hero-workflow aria-hidden="true">
        <BusinessFlow3D {...businessFlow3DHomepageProps} />
      </div>
      <div className={styles.heroShade} />
      <SiteContainer {...siteContainerHomepageProps} className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 id="hero-title" className={styles.heroTitle} data-scroll-parallax data-scroll-fade="false">
            <span
              className={`${styles.heroTitlePrimary} ${styles.heroReveal}`}
              data-hero-reveal="title"
            >
              Complex Business Processes.
            </span>
            <em className={styles.heroReveal} data-hero-reveal="accent">In Days. Not Quarters.</em>
          </h1>
          <p className={styles.heroLead} data-scroll-parallax>
            <span className={`${styles.heroLeadContent} ${styles.heroReveal}`} data-hero-reveal="lead">
              Kipory turns datasets, documents and media into governed production workflows. Deterministic processing and agentic AI work together to deliver usable knowledge wherever your business runs.
            </span>
          </p>
          <div className={styles.heroActions} data-scroll-parallax>
            <div className={`${styles.heroActionsReveal} ${styles.heroReveal}`} data-hero-reveal="actions">
              <GlowLink {...glowLinkHomepageProps} href="/waitlist">Join waiting list <span>↗</span></GlowLink>
              <Link className="button button--outline" href="/contact">Let’s talk</Link>
            </div>
          </div>
          <div className={styles.heroProtocols} data-scroll-parallax>
            <div
              className={`${styles.heroProtocolsReveal} ${styles.heroReveal}`}
              data-hero-reveal="protocols"
            >
              <ProtocolIconList {...protocolIconListHomepageProps} />
            </div>
          </div>
          <LearnMoreLink
            className={styles.heroLearnMore}
            href="#pillars"
            label="Explore our pillars"
            scrollShiftRem={10}
          />
        </div>
      </SiteContainer>
    </section>
  );
}
