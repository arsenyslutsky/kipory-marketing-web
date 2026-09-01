import type { Metadata } from 'next';
import Link from 'next/link';
import { MobileWorkflowFallback } from '@/components/media/MobileWorkflowFallback';
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
import { RouteTransition } from '@/components/site/RouteTransition';
import {
  BusinessFlowVertical,
  businessFlowVerticalHomepageProps,
} from '@/features/business-flow-vertical';
import {
  BusinessFlowHorizontal,
  businessFlowHorizontalHomepageProps,
} from '@/features/business-flow-horizontal';
import { createPageMetadata, siteConfig } from '@/lib/siteMetadata';
import { HomepageHero } from './_components/HomepageHero';
import { LearnMoreLink } from './_components/LearnMoreLink';
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
    body: 'Connect datasets, documents and media from your domain. Schema-validated records and relationships keep your knowledge structurally consistent as it grows.',
  },
  {
    number: '02',
    titlePrimary: 'DETERMINISTIC AND AGENTIC AI',
    titleSecondary: 'Flows work in concert',
    body: 'Run deterministic and agentic AI flows in one hybrid engine. Combine reliable processing with intelligent enrichment — fully governed, metered and auditable by design.',
  },
  {
    number: '03',
    titlePrimary: 'KNOWLEDGE DELIVERED',
    titleSecondary: 'Where your business runs',
    body: 'Access and stream knowledge through APIs, MCP or event hooks. Keep it current with scheduled or event-triggered jobs. Built for reliable production use at scale, so your systems consume knowledge — not raw data.',
  },
] as const;

const useCases = [
  {
    title: 'Velocity with flexibility',
    subtitle: 'From idea to production',
    body: 'Take business applications and modules from idea to production in days, using platform capabilities instead of custom code.',
  },
  {
    title: 'Evolves continuously',
    subtitle: 'Change without redeployment',
    body: 'Validate changes before they go live. Evolve flows, data models and endpoints safely — without redeploying.',
  },
  {
    title: 'Integrity by default',
    subtitle: 'Governed at every layer',
    body: 'Keep data, flows and executions validated and accountable with quality controls, governance and auditability built into every layer.',
  },
  {
    title: 'Bold delivery with lean team',
    subtitle: 'Built for lean teams',
    body: 'A small, platform-trained team can deliver and evolve complex business processes end to end — without a full development department.',
  },
] as const;

export default function HomePage() {
  return (
    <RouteTransition>
      <HeroScrollEffects
        id="main-content"
        className={styles.main}
        data-content-reveal-ready="false"
        data-workflows-ready="false"
        scrollRange={700}
      >
      <HomepageHero />

      <MarketingSection
        {...marketingSectionHomepageProps}
        id="pillars"
        className={styles.movementSection}
        aria-labelledby="pillars-title"
        data-section-reveal
        tone="alternate-to-base"
        gridFade="none"
        paddingTop={32}
        paddingBottom={12}
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
                  eyebrow="With future in mind"
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
                <MobileWorkflowFallback
                  alt="Vertical business flow"
                  height={360}
                  name="pillars"
                  src="/images/workflows/mobile/pillars-flow.png"
                  width={360}
                >
                  <BusinessFlowVertical
                    {...businessFlowVerticalHomepageProps}
                    className={styles.pillarsIllustration}
                  />
                </MobileWorkflowFallback>
              </div>
            )}
          />
          <div className={styles.sectionRevealLink} data-section-reveal-item="4">
            <LearnMoreLink
              className={styles.sectionLearnMore}
              href="#delivery"
              label="See how teams move faster"
            />
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
            hideVisualOnMobile
            content={(
              <div className={styles.capabilityContent}>
              <SectionHeader
                {...sectionHeaderHomepageProps}
                className={styles.sectionRevealHeader}
                data-section-reveal-item="header"
                eyebrow="Designed to fit and accelerate"
                title="Everything your team needs to move faster - without compromise."
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
                <MobileWorkflowFallback
                  alt="Horizontal business flow"
                  height={608}
                  name="delivery"
                  src="/images/workflows/mobile/delivery-flow.png"
                  width={360}
                >
                  <BusinessFlowHorizontal {...businessFlowHorizontalHomepageProps} />
                </MobileWorkflowFallback>
              </div>
            )}
          />
        </SiteContainer>
      </MarketingSection>

      <section className={styles.finalActions} aria-label="End-of-page actions">
        <SiteContainer {...siteContainerHomepageProps} className={styles.finalActionsInner}>
          <Link className="button button--compact button--accent" href="/waitlist">
            Join waiting list
            <svg className={styles.buttonIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 12 12 4M6 4h6v6" />
            </svg>
          </Link>
          <Link className="button button--compact button--outline" href="/contact">Let’s talk</Link>
        </SiteContainer>
      </section>

      <BackToTop />
      </HeroScrollEffects>
    </RouteTransition>
  );
}
