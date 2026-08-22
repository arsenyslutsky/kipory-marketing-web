import type { Metadata } from 'next';
import Link from 'next/link';
import styles from '../marketing.module.css';

export const metadata: Metadata = {
  title: 'About',
  description: 'Kipory is building a clearer way for teams to understand and improve the systems behind their work.',
};

const values = [
  ['01', 'Clarity over noise', 'More data is not the same as more understanding. We design for the moment a complex system becomes legible.'],
  ['02', 'Context stays attached', 'Signals are useful when their path, timing, ownership, and outcome remain connected.'],
  ['03', 'Systems keep moving', 'Operational models should evolve with reality instead of becoming another static artifact to maintain.'],
] as const;

export default function AboutPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.pageHero}>
        <div className={`site-container ${styles.pageHeroGrid}`}>
          <div>
            <p className="eyebrow">About Kipory</p>
            <h1 className={styles.pageTitle}>Work is connected.<br /><em>Understanding should be too.</em></h1>
          </div>
          <p className={styles.pageLead}>We are building a shared language for operational systems—one that helps people see dependencies, follow change, and improve outcomes together.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`}>
        <div className="site-container">
          <div className={styles.proseGrid}>
            <h2>Most teams see pieces. The work moves through a whole.</h2>
            <div className={styles.prose}>
              <p>Modern work crosses more tools, teams, and decisions than any single dashboard can explain. When something slows or breaks, people reconstruct the journey from fragments.</p>
              <p>Kipory begins with a different premise: the flow itself should be visible. By preserving connections between signals and outcomes, teams gain a view that supports investigation without losing the larger system.</p>
              <p>Our goal is simple—to make operational complexity understandable enough to act on.</p>
            </div>
          </div>
          <div className={styles.values}>
            {values.map(([number, title, body]) => (
              <article className={styles.value} key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className="site-container">
          <p className="eyebrow">Build the clearer system</p>
          <h2>Bring the whole flow<br /><em>into view.</em></h2>
          <Link className="button button--accent" href="/contact">Talk with us <span>↗</span></Link>
        </div>
      </section>
    </main>
  );
}
