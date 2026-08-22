import type { Metadata } from 'next';
import styles from '../marketing.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Start a conversation with Kipory about mapping and improving the operational flow behind your business.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={styles.pageHero}>
        <div className={`site-container ${styles.pageHeroGrid}`}>
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className={styles.pageTitle}>Show us how<br /><em>your system moves.</em></h1>
          </div>
          <p className={styles.pageLead}>Tell us where work crosses boundaries, where context gets lost, or where the current picture stops being useful.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`}>
        <div className={`site-container ${styles.contactGrid}`}>
          <div className={styles.contactNotes}>
            <p className="eyebrow">Start a conversation</p>
            <strong>What happens next</strong>
            <p>Share a little about the flow you want to understand. We will use it to shape a focused first conversation.</p>
            <p>This form opens your email application and does not store your information on this website.</p>
          </div>
          <form className={styles.contactForm} action="mailto:hello@kipory.com" method="post" encType="text/plain">
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" autoComplete="name" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="company">Company</label>
              <input id="company" name="company" autoComplete="organization" />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="message">What flow do you want to understand?</label>
              <textarea id="message" name="message" required />
            </div>
            <p className={styles.formNote}>Submitting opens a message addressed to hello@kipory.com in your default email application.</p>
            <button className="button button--accent" type="submit">Prepare message <span>↗</span></button>
          </form>
        </div>
      </section>
    </main>
  );
}
