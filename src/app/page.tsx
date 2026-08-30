import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MarketingSection,
  NumberedRow,
  SectionHeader,
  SiteContainer,
  SplitLayout,
} from '@/components/marketing';
import {
  marketingSectionHomepageProps,
  numberedRowHomepageProps,
  sectionHeaderHomepageProps,
  siteContainerHomepageProps,
  splitLayoutHomepageProps,
} from '@/components/marketing/presets';
import { BackToTop } from '@/components/site/BackToTop';
import { HeroScrollEffects } from '@/components/site/HeroScrollEffects';
import { GlowLink } from '@/components/ui/GlowLink';
import { glowLinkHomepageProps } from '@/components/ui/GlowLink.presets';
import {
  BusinessFlowVertical,
  businessFlowVerticalHomepageProps,
} from '@/features/business-flow-vertical';
import {
  BusinessFlow3D,
  businessFlow3DHomepageProps,
} from '@/features/business-flow-3d';
import {
  BusinessFlowHorizontal,
  businessFlowHorizontalHomepageProps,
} from '@/features/business-flow-horizontal';
import { createPageMetadata, siteConfig } from '@/lib/siteMetadata';
import styles from './marketing.module.css';

export const metadata: Metadata = createPageMetadata({
  title: { absolute: siteConfig.defaultTitle },
  socialTitle: siteConfig.defaultTitle,
  description: siteConfig.defaultDescription,
  path: '/',
});

const capabilities = [
  {
    number: '01',
    titlePrimary: 'ONE HYBRID DATA PLATFORM',
    titleSecondary: 'For your domain',
    body: 'Push or connect your datasets, documents and media containing domain data. Data records and relations are schema-validated, with built-in structural features that keep your knowledge consistent as it grows.',
  },
  {
    number: '02',
    titlePrimary: 'DETERMINISTIC AND AI AGENTIC',
    titleSecondary: 'Flows work in concert',
    body: 'One hybrid flow engine for deterministic and AI agentic flows allows next-gen processing. This combines both reliability and deep intelligence enrichment. Fully governed, metered and auditable by design.',
  },
  {
    number: '03',
    titlePrimary: 'KNOWLEDGE DELIVERED',
    titleSecondary: 'Where your business runs',
    body: 'Access and stream data with flexible APIs, MCPs or event hooks. Keep knowledge fresh with scheduled or event-triggered jobs. Production-ready and built with reliability and scale in mind. Your systems consume knowledge, not raw data.',
  },
] as const;

const useCases = [
  {
    title: 'Velocity with flexibility',
    subtitle: 'Placeholder text',
    body: 'Business applications and modules go from idea to production-grade in days — built on platform capabilities, not custom code.',
  },
  {
    title: 'Evolves continuously',
    subtitle: 'Placeholder text',
    body: 'The platform validates changes before they go live. Flows, data models and endpoints evolve continuously — safely, with no redeployment.',
  },
  {
    title: 'Integrity by default',
    subtitle: 'Placeholder text',
    body: 'Quality controls, governance and auditability are built into every layer — data, flows and executions stay validated and accountable by design.',
  },
  {
    title: 'Bold delivery with lean team',
    subtitle: 'Placeholder text',
    body: 'A small platform-trained team — not a development department — delivers and evolves complex business processes end to end.',
  },
] as const;

function LearnMoreLink({ className, href, scrollShiftRem = 0 }: { className: string; href: string; scrollShiftRem?: number }) {
  return (
    <Link
      className={`${styles.learnMoreLink} ${className}`}
      href={href}
      data-scroll-parallax
      data-scroll-shift-rem={scrollShiftRem}
    >
      <span>Learn More</span>
      <span className={styles.learnMoreChevron} aria-hidden="true">
        <svg viewBox="0 0 16 18" focusable="false">
          <path d="M3 3.5 8 8.5l5-5M3 9.5l5 5 5-5" />
        </svg>
      </span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <HeroScrollEffects
      id="main-content"
      className={styles.main}
      data-content-reveal-ready="false"
      data-workflows-ready="false"
      scrollRange={700}
    >
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
                Kipory is a data and analysis platform that turns your datasets, documents and media into governed production workflows. Deterministic processing and agentic AI work together, then deliver usable knowledge wherever your business runs.
              </span>
            </p>
            <div className={styles.heroActions} data-scroll-parallax>
              <div className={`${styles.heroActionsReveal} ${styles.heroReveal}`} data-hero-reveal="actions">
                <GlowLink {...glowLinkHomepageProps} href="/waitlist">Join waiting list <span>↗</span></GlowLink>
                <Link className="button button--outline" href="/contact">Let’s talk</Link>
              </div>
            </div>
            <LearnMoreLink className={styles.heroLearnMore} href="#pillars" scrollShiftRem={10} />
          </div>
        </SiteContainer>
      </section>

      <MarketingSection
        {...marketingSectionHomepageProps}
        id="pillars"
        className={styles.movementSection}
        aria-labelledby="pillars-title"
        data-section-reveal
        tone="alternate-to-base"
        gridFade="none"
        paddingTop={60}
        paddingBottom={60}
      >
        <SiteContainer {...siteContainerHomepageProps}>
          <SplitLayout
            {...splitLayoutHomepageProps}
            content={(
              <div className={styles.capabilityContent}>
              <SectionHeader
                {...sectionHeaderHomepageProps}
                className={styles.sectionRevealHeader}
                data-section-reveal-item="header"
                eyebrow="From movement to meaning"
                title="Our Pillars"
                titleId="pillars-title"
              />
              <div className={styles.capabilityList}>
                {capabilities.map((capability, index) => (
                  <NumberedRow
                    {...numberedRowHomepageProps}
                    key={capability.number}
                    className={styles.sectionRevealRow}
                    number={capability.number}
                    title={capability.titlePrimary}
                    accent={capability.titleSecondary}
                    body={capability.body}
                    data-section-reveal-item={String(index + 1)}
                    data-scroll-parallax
                  />
                ))}
              </div>
              </div>
            )}
            visual={(
              <div className={styles.capabilityVisual}>
                <BusinessFlowVertical
                  {...businessFlowVerticalHomepageProps}
                  className={styles.pillarsIllustration}
                />
              </div>
            )}
          />
          <div className={styles.sectionRevealLink} data-section-reveal-item="4">
            <LearnMoreLink className={styles.sectionLearnMore} href="#delivery" />
          </div>
        </SiteContainer>
      </MarketingSection>

      <MarketingSection
        {...marketingSectionHomepageProps}
        id="delivery"
        className={styles.useCaseSection}
        aria-labelledby="delivery-title"
        data-section-reveal
        tone="alternate-to-base"
        gridFade="none"
        paddingTop={60}
        paddingBottom={60}
      >
        <SiteContainer {...siteContainerHomepageProps}>
          <SplitLayout
            {...splitLayoutHomepageProps}
            contentRatio={2.1}
            visualRatio={2.9}
            reversed
            content={(
              <div className={styles.capabilityContent}>
              <SectionHeader
                {...sectionHeaderHomepageProps}
                className={styles.sectionRevealHeader}
                data-section-reveal-item="header"
                eyebrow="Designed to fit and accelerate"
                title="Everything your team needs to run ahead without compromises."
                titleId="delivery-title"
                titleWidth={700}
              />
              <div className={styles.useCaseList}>
                {useCases.map((item, index) => (
                  <NumberedRow
                    {...numberedRowHomepageProps}
                    key={item.title}
                    className={styles.sectionRevealRow}
                    number={String(index + 4).padStart(2, '0')}
                    title={item.title}
                    accent={item.subtitle}
                    body={item.body}
                    href="/waitlist"
                    rowPadding={12}
                    minHeight={64}
                    gap={0}
                    data-section-reveal-item={String(index + 1)}
                    data-scroll-parallax
                  />
                ))}
              </div>
              </div>
            )}
            visual={(
              <div className={styles.deliveryIllustration}>
                <BusinessFlowHorizontal {...businessFlowHorizontalHomepageProps} />
              </div>
            )}
          />
        </SiteContainer>
      </MarketingSection>

      <BackToTop />
    </HeroScrollEffects>
  );
}
