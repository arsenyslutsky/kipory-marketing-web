import Link from 'next/link';
import { HeroScrollEffects } from '@/components/site/HeroScrollEffects';
import { foundationPillarsProps, PillarsIllustration } from '@/features/pillars-illustration';
import { heroSignalFlowProps, SignalFlowIllustration } from '@/features/signal-flow';
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

export default function HomePage() {
  return (
    <HeroScrollEffects id="main-content" className={styles.main} scrollRange={700}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroVisual} aria-hidden="true">
          <SignalFlowIllustration {...heroSignalFlowProps} />
        </div>
        <div className={styles.heroShade} />
        <div className={`site-container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <h1 id="hero-title" className={styles.heroTitle}>
              Complex Business Processes.<br />
              <em>In Days. Not Quarters.</em>
            </h1>
            <p className={styles.heroLead}>
              Kipory turns complex business processes into production-grade software in days, not quarters. An agentic AI engine, composable data operators and flexible workflows do the work, with identity and security integrated at every layer — so what ships fast also holds up at scale.
            </p>
            <div className={styles.heroActions}>
              <Link className="button button--accent" href="/contact">Request access <span>↗</span></Link>
              <Link className="button button--outline" href="/product">Explore the product</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection} ${styles.gridSurfaceSection} ${styles.movementSection}`}>
        <div className="site-container">
          <div className={styles.capabilityLayout}>
            <div className={styles.capabilityContent}>
              <div className={styles.sectionHeader}>
                <p className="eyebrow">From movement to meaning</p>
                <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCompact}`}>Our Pillars</h2>
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
              <PillarsIllustration
                {...foundationPillarsProps}
                className={styles.pillarsIllustration}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.useCaseSection} ${styles.gridSurfaceSection}`}>
        <div className="site-container">
          <div className={`${styles.capabilityLayout} ${styles.useCaseLayout}`}>
            <div className={styles.capabilityContent}>
              <div className={styles.sectionHeader}>
                <p className="eyebrow">Designed around real flow</p>
                <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCompact}`}>
                  Everything your team needs to run ahead without compromises.
                </h2>
              </div>
              <p className={styles.useCaseIntro}>
                Use Kipory wherever outcomes depend on more than one team, tool, or moment.
              </p>
              <div className={styles.useCaseList}>
                {useCases.map((item, index) => (
                  <Link href="/product" key={item}>
                    <CountBox value={String(index + 1).padStart(2, '0')} />
                    <span className={styles.useCaseCopy}>
                      <strong>{item}</strong>
                      <span className={styles.capabilityTitleSecondary}>where your business runs</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.capabilityVisualPlaceholder} role="img" aria-label="Illustration placeholder">
              <span aria-hidden="true">Illustration placeholder</span>
            </div>
          </div>
        </div>
      </section>

    </HeroScrollEffects>
  );
}
