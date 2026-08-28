import Link from 'next/link';
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
import styles from './marketing.module.css';

const capabilities = [
  {
    number: '01',
    titlePrimary: 'ONE HYBRID DATA PLATFORM',
    titleSecondary: 'for your domain',
    body: 'Push or connect your datasets, documents and media containing domain data. Data records and relations are schema-validated, with built-in structural features that keep your knowledge consistent as it grows.',
  },
  {
    number: '02',
    titlePrimary: 'DETERMINISTIC AND AI AGENTIC',
    titleSecondary: 'flows work in concert',
    body: 'One hybrid flow engine for deterministic and AI agentic flows allows next-gen processing. This combines both reliability and deep intelligence enrichment. Fully governed, metered and auditable by design.',
  },
  {
    number: '03',
    titlePrimary: 'KNOWLEDGE DELIVERED',
    titleSecondary: 'where your business runs',
    body: 'Access and stream data with flexible APIs, MCPs or event hooks. Keep knowledge fresh with scheduled or event-triggered jobs. Production-ready and built with reliability and scale in mind. Your systems consume knowledge, not raw data.',
  },
] as const;

const useCases = [
  'Velocity with flexibility',
  'Evolves continuously',
  'Integrity by default',
  'Bold delivery with lean team',
] as const;

function CountBox({ value }: { value: string }) {
  return <span className={styles.countBox}>{value}</span>;
}

function LearnMoreLink({ className, href, scrollShiftRem = 0 }: { className: string; href: string; scrollShiftRem?: number }) {
  return (
    <Link className={`${styles.learnMoreLink} ${className}`} href={href} data-scroll-shift-rem={scrollShiftRem}>
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
    <HeroScrollEffects id="main-content" className={styles.main} scrollRange={700}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroVisual} aria-hidden="true">
          <BusinessFlow3D {...businessFlow3DHomepageProps} />
        </div>
        <div className={styles.heroShade} />
        <div className={`site-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <h1 id="hero-title" className={styles.heroTitle}>
              Complex Business Processes.<br />
              <em>In Days. Not Quarters.</em>
            </h1>
            <p className={styles.heroLead}>
              Kipory is a data and analysis platform that turns your datasets, documents and media into governed production workflows. Deterministic processing and agentic AI work together, then deliver usable knowledge wherever your business runs.
            </p>
            <div className={styles.heroActions}>
              <GlowLink {...glowLinkHomepageProps} href="/waitlist">Join waiting list <span>↗</span></GlowLink>
              <Link className="button button--outline" href="#pillars">Let’s talk</Link>
            </div>
            <LearnMoreLink className={styles.heroLearnMore} href="#pillars" scrollShiftRem={10} />
          </div>
        </div>
      </section>

      <section
        id="pillars"
        className={`${styles.section} ${styles.lightSection} ${styles.gridSurfaceSection} ${styles.movementSection}`}
        aria-labelledby="pillars-title"
      >
        <div className="site-container">
          <div className={styles.capabilityLayout}>
            <div className={styles.capabilityContent}>
              <div className={styles.sectionHeader}>
                <p className="eyebrow">From movement to meaning</p>
                <h2 id="pillars-title" className={`${styles.sectionTitle} ${styles.sectionTitleCompact}`}>Our Pillars</h2>
              </div>
              <div className={styles.capabilityList}>
                {capabilities.map((capability) => (
                  <article key={capability.number} className={styles.capabilityCard}>
                    <CountBox value={capability.number} />
                    <div className={styles.capabilityCardCopy}>
                      <h3>
                        <span className={styles.capabilityTitlePrimary}>{capability.titlePrimary}</span>{' '}
                        <span className={styles.capabilityTitleSecondary}>{capability.titleSecondary}</span>
                      </h3>
                      <p>{capability.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className={styles.capabilityVisual}>
              <BusinessFlowVertical
                {...businessFlowVerticalHomepageProps}
                className={styles.pillarsIllustration}
              />
            </div>
          </div>
          <LearnMoreLink className={styles.sectionLearnMore} href="#delivery" />
        </div>
      </section>

      <section
        id="delivery"
        className={`${styles.section} ${styles.useCaseSection} ${styles.gridSurfaceSection}`}
        aria-labelledby="delivery-title"
      >
        <div className="site-container">
          <div className={`${styles.capabilityLayout} ${styles.useCaseLayout}`}>
            <div className={styles.capabilityContent}>
              <div className={styles.sectionHeader}>
                <p className="eyebrow">Designed to fit and accelerate</p>
                <h2 id="delivery-title" className={`${styles.sectionTitle} ${styles.sectionTitleCompact}`}>
                  Everything your team needs to run ahead without compromises.
                </h2>
              </div>
              <div className={styles.useCaseList}>
                {useCases.map((item, index) => (
                  <Link href="/waitlist" key={item}>
                    <CountBox value={String(index + 1).padStart(2, '0')} />
                    <span className={styles.useCaseCopy}>
                      <strong>{item}</strong>
                      <span className={styles.capabilityTitleSecondary}>where your business runs</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.deliveryIllustration}>
              <BusinessFlowHorizontal {...businessFlowHorizontalHomepageProps} />
            </div>
          </div>
        </div>
      </section>

      <BackToTop />
    </HeroScrollEffects>
  );
}
