import Link from 'next/link';
import { SignalFlowIllustration } from '@/features/signal-flow';
import styles from './marketing.module.css';

const capabilities = [
  {
    number: '01',
    title: 'Trace every handoff',
    body: 'Follow work from its first signal to its final outcome. Every transition stays visible, connected, and ready to inspect.',
  },
  {
    number: '02',
    title: 'Find friction early',
    body: 'See where flow slows, loops, or disappears before a local issue becomes a system-wide problem.',
  },
  {
    number: '03',
    title: 'Move with context',
    body: 'Give every team the same live picture so decisions start with shared evidence instead of reconstructed history.',
  },
] as const;

const useCases = ['Product operations', 'Service delivery', 'Customer journeys', 'Data workflows'] as const;

export default function HomePage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroVisual} aria-hidden="true">
          <SignalFlowIllustration
            mode="dark"
            showInterface={false}
            gridOpacity={1}
            connectorOpacity={0.62}
            connectorStroke="dashed"
            connectorWidth={1.25}
            pathCurve={86}
            outlineOpacity={0.25}
            outlineWidth={1}
            nodeDepth={18}
            nodeCornerRadius={14}
            perspectiveEffect={82}
            cameraPitch={45}
            cameraYaw={15}
            cameraZoom={0.8}
            scrollTilt={45}
            scrollZoom={1.2}
            scrollRange={700}
            minDelay={500}
            maxDelay={1800}
            progressBarHeight={8}
            concurrentBeams={10}
            minEmitDelay={500}
            maxEmitDelay={1400}
          />
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

      <section className={`${styles.section} ${styles.lightSection} ${styles.movementSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeader}>
            <p className="eyebrow">From movement to meaning</p>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCompact}`}>Your system already tells a story. Kipory makes it readable.</h2>
          </div>
          <div className={styles.capabilityLayout}>
            <div className={styles.capabilityList}>
              {capabilities.map((capability) => (
                <article key={capability.number} className={styles.capabilityCard}>
                  <span>{capability.number}</span>
                  <div className={styles.capabilityCardCopy}>
                    <h3>{capability.title}</h3>
                    <p>{capability.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.capabilityVisualPlaceholder} role="img" aria-label="Illustration placeholder">
              <span aria-hidden="true">Illustration placeholder</span>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.systemSection}`}>
        <div className={`site-container ${styles.systemGrid}`}>
          <div className={styles.systemCopy}>
            <p className="eyebrow">A model that stays alive</p>
            <h2 className={styles.sectionTitle}>Not another dashboard. A view of how the whole system moves.</h2>
            <p>Kipory keeps signals attached to their path, owners, and outcomes. The result is a view that explains both what happened and where to look next.</p>
            <Link className="button button--outline" href="/product">See how it works</Link>
          </div>
          <div className={styles.systemPanel} aria-label="Example live trace">
            <div className={styles.panelHeader}><span>LIVE TRACE</span><span>#024</span></div>
            <div className={styles.traceRoute}>CONTROL <i /> LIBRARY <i /> SECURE <i /> PROFILE</div>
            <div className={styles.traceLine}><b /></div>
            <div className={styles.panelMeta}>
              <div><span>4</span><small>systems crossed</small></div>
              <div><span>1.8s</span><small>flow duration</small></div>
              <div><span>Live</span><small>trace status</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.useCaseSection}`}>
        <div className="site-container">
          <p className="eyebrow">Designed around real flow</p>
          <div className={styles.useCaseHeader}>
            <h2 className={styles.sectionTitle}>One language for work that crosses every boundary.</h2>
            <p>Use Kipory wherever outcomes depend on more than one team, tool, or moment.</p>
          </div>
          <div className={styles.useCaseList}>
            {useCases.map((item, index) => (
              <Link href="/product" key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
                <i>↗</i>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="site-container">
          <p className="eyebrow">Make the invisible actionable</p>
          <h2>Follow the pulse.<br /><em>Improve the system.</em></h2>
          <Link className="button button--accent" href="/contact">Start a conversation <span>↗</span></Link>
        </div>
      </section>
    </main>
  );
}
