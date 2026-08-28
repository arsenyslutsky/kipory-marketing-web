import type { Metadata } from 'next';
import { SubmissionForm } from '../../components/ui/SubmissionForm';
import styles from '../marketing.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Start a conversation with Kipory about mapping and improving the operational flow behind your business.',
};

export default function ContactPage() {
  return (
    <main id="main-content" className={styles.main}>
      <section className={`${styles.pageHero} ${styles.waitlistHero}`}>
        <div className={`site-container ${styles.pageHeroGrid} ${styles.waitlistHeroGrid}`}>
          <div className={styles.pageHeroHeading}>
            <h1 className={styles.pageTitle}>Show us how your system moves.</h1>
            <p className={styles.pageSubtitle}>SHOW US WHERE WORK STOPS.</p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightSection} ${styles.waitlistFormSection}`}>
        <div className={`site-container ${styles.contactGrid}`}>
          <div className={styles.contactNotes}>
            <p className="eyebrow">Start a conversation</p>
            <strong>What happens next</strong>
            <p>Share a little about the flow you want to understand. We will use it to shape a focused first conversation.</p>
          </div>
          <SubmissionForm
            className={styles.contactForm}
            ariaLabel="Contact Kipory"
            panelSize="tall"
            successStatus="MESSAGE SENT"
            successTitle="WE'LL TAKE IT FROM HERE."
            successBody="Thanks for the context. Our team will review your note and follow up by email."
          >
            <div className={styles.field}>
              <label htmlFor="first-name">First name</label>
              <input id="first-name" name="firstName" autoComplete="given-name" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="last-name">Last name</label>
              <input id="last-name" name="lastName" autoComplete="family-name" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="company">Company</label>
              <input id="company" name="company" autoComplete="organization" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="role">Role</label>
              <select id="role" name="role" defaultValue="" required>
                <option value="" disabled>Select your role</option>
                <option value="development-engineering">Development / Engineering</option>
                <option value="management-leadership">Management / Leadership</option>
                <option value="product">Product</option>
                <option value="data-analytics">Data / Analytics</option>
                <option value="operations">Operations</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="company-email">Company email</label>
              <input id="company-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="inquiry-reason">Reason for inquiry</label>
              <select id="inquiry-reason" name="inquiryReason" defaultValue="" required>
                <option value="" disabled>Select a reason</option>
                <option value="product-demo">Product demo</option>
                <option value="technical-questions">Technical questions</option>
                <option value="pricing-access">Pricing and access</option>
                <option value="partnership">Partnership</option>
                <option value="press-media">Press and media</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label htmlFor="comments">Comments</label>
              <textarea id="comments" name="comments" />
            </div>
            <button className="button button--accent" type="submit">
              Send message
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
