import type { Metadata } from 'next';
import styles from '../marketing.module.css';

export const metadata: Metadata = {
  title: 'Join the waiting list',
  description: 'Join the Kipory waiting list and be among the first to hear when access expands.',
};

export default function WaitlistPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={`${styles.pageHero} ${styles.waitlistHero}`}>
        <div className={`site-container ${styles.pageHeroGrid} ${styles.waitlistHeroGrid}`}>
          <div className={styles.pageHeroHeading}>
            <h1 className={styles.pageTitle}>Join the waiting list.</h1>
          </div>
          <div className={styles.pageHeroCopy}>
            <p className={styles.pageSubtitle}>See the flow sooner.</p>
            <p className={styles.pageLead}>Leave your details and we will keep you informed as Kipory prepares for wider access.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection}`}>
        <div className={`site-container ${styles.contactGrid}`}>
          <div className={styles.contactNotes}>
            <strong>What happens next</strong>
            <p>Tell us who you are and where you work. We will use your email to follow up about Kipory access.</p>
            <p>This form opens your email application and does not store your information on this website.</p>
          </div>
          <form
            className={styles.contactForm}
            aria-label="Join the Kipory waiting list"
            action="mailto:hello@kipory.com?subject=Kipory%20waiting%20list"
            method="post"
            encType="text/plain"
          >
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input id="name" name="name" autoComplete="name" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="company">Company (optional)</label>
              <input id="company" name="company" autoComplete="organization" />
            </div>
            <p className={styles.formNote}>Submitting opens a message addressed to hello@kipory.com in your default email application.</p>
            <button className="button button--accent" type="submit">
              Prepare waitlist email
              <svg className={styles.buttonIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 12 12 4M6 4h6v6" />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
