import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../marketing.module.css';

export const metadata: Metadata = {
  title: 'Product',
  description: 'Explore how Kipory maps operational flow, traces every handoff, and gives teams shared context for improving complex systems.',
};

const features = [
  ['01', 'Living system map', 'Model teams, tools, decisions, and outcomes as one connected operational landscape that evolves with the work.'],
  ['02', 'End-to-end traces', 'Follow an individual signal across every handoff without losing its history, ownership, or surrounding context.'],
  ['03', 'Flow health', 'Spot stalls, repeats, and unexpected paths as patterns in the system—not isolated points on a dashboard.'],
  ['04', 'Shared investigation', 'Bring product, operations, and service teams into the same view with a common language for what happened.'],
] as const;

export default function ProductPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.pageHero}>
        <div className={`site-container ${styles.pageHeroGrid}`}>
          <div>
            <p className="eyebrow">Product</p>
            <h1 className={styles.pageTitle}>The system view<br /><em>behind every outcome.</em></h1>
          </div>
          <p className={styles.pageLead}>Kipory connects what happened, where it moved, and who shaped it—giving teams a durable way to understand operational flow.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`}>
        <div className="site-container">
          <p className="eyebrow">Core capabilities</p>
          <div className={styles.featureGrid}>
            {features.map(([number, title, body]) => (
              <article className={styles.feature} key={number}>
                <span>{number}</span>
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.systemSection}`}>
        <div className="site-container">
          <div className={styles.sectionHeader}>
            <p className="eyebrow">How it works</p>
            <h2 className={styles.sectionTitle}>From scattered activity to a shared operational model.</h2>
            <p className={styles.sectionIntro}>Start with the signals you already have. Kipory connects their paths and keeps the model useful as the system changes.</p>
          </div>
          <div className={styles.steps}>
            <article className={styles.step}>
              <h3>Connect the flow</h3>
              <p>Bring together events, tools, and ownership around the journey they collectively create.</p>
            </article>
            <article className={styles.step}>
              <h3>Follow each signal</h3>
              <p>Trace movement across the system while preserving sequence, timing, and context.</p>
            </article>
            <article className={styles.step}>
              <h3>Improve with evidence</h3>
              <p>Use visible patterns to focus investigation and make changes with a clearer understanding of impact.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="site-container">
          <p className="eyebrow">See your system differently</p>
          <h2>Make every handoff<br /><em>part of the picture.</em></h2>
          <Link className="button button--accent" href="/contact">Request access <span>↗</span></Link>
        </div>
      </section>
    </main>
  );
}
