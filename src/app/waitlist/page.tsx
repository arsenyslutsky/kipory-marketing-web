import type { Metadata } from 'next';
import { SubmissionForm } from '../../components/ui/SubmissionForm';
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
            <p className={styles.pageSubtitle}>SEE THE FLOW SOONER.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection} ${styles.waitlistFormSection}`}>
        <div className={`site-container ${styles.contactGrid}`}>
          <div className={styles.contactNotes}>
            <strong>What happens next</strong>
            <p>Tell us who you are and where you work. We will use your email to follow up about Kipory access.</p>
          </div>
          <SubmissionForm
            className={styles.contactForm}
            ariaLabel="Join the Kipory waiting list"
            successStatus="ACCESS REQUESTED"
            successTitle="YOU'RE ON THE LIST."
            successBody="Thanks for joining. We'll keep you informed as Kipory access expands."
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
            <button className="button button--accent" type="submit">
              Join waitlist
              <svg className={styles.buttonIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 12 12 4M6 4h6v6" />
              </svg>
            </button>
          </SubmissionForm>
        </div>
      </section>
    </main>
  );
}
