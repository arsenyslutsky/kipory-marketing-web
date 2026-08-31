import type { Metadata } from 'next';
import {
  FormField,
  MarketingSection,
  PageHero,
  SiteContainer,
  SplitLayout,
} from '@/components/marketing';
import {
  formFieldHomepageProps,
  marketingSectionHomepageProps,
  pageHeroHomepageProps,
  siteContainerHomepageProps,
  splitLayoutHomepageProps,
} from '@/components/marketing/presets';
import { SubmissionForm } from '../../components/ui/SubmissionForm';
import { BackgroundBeams } from '../../components/ui/BackgroundBeams';
import { RouteTransition } from '@/components/site/RouteTransition';
import { createPageMetadata } from '@/lib/siteMetadata';
import styles from '../marketing.module.css';

export const metadata: Metadata = createPageMetadata({
  title: 'Contact',
  socialTitle: 'Contact — Kipory',
  description: 'Start a conversation with Kipory about mapping and improving the operational flow behind your business.',
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <RouteTransition>
      <main id="main-content" className={styles.main}>
      <PageHero
        {...pageHeroHomepageProps}
        title="Show us how your system moves."
        subtitle="SHOW US WHERE WORK STOPS."
        titleClassName={`${styles.pageTextReveal} ${styles.pageTextRevealFirst}`}
        subtitleClassName={`${styles.pageTextReveal} ${styles.pageTextRevealSecond}`}
        background={<BackgroundBeams />}
      />

      <MarketingSection {...marketingSectionHomepageProps}>
        <SiteContainer {...siteContainerHomepageProps}>
          <SplitLayout
            {...splitLayoutHomepageProps}
            contentRatio={0.75}
            visualRatio={1.25}
            gap={118}
            content={(
              <div className={styles.contactNotes}>
                <p className={`eyebrow ${styles.pageTextReveal} ${styles.pageTextRevealLead}`}>Start a conversation</p>
                <strong className={`${styles.pageTextReveal} ${styles.pageTextRevealLead}`}>What happens next</strong>
                <p className={`${styles.pageTextReveal} ${styles.pageTextRevealBody}`}>
                  Thanks for reaching out. We’ll review your message and get back to you as soon as possible.
                </p>
              </div>
            )}
            visual={(
              <SubmissionForm
                className={styles.contactForm}
                ariaLabel="Contact Kipory"
                panelSize="tall"
                successStatus="MESSAGE SENT"
                successTitle="WE'LL TAKE IT FROM HERE."
                successBody="Thanks for the context. Our team will review your note and follow up by email."
              >
                <FormField {...formFieldHomepageProps} label="First name" htmlFor="first-name">
              <input id="first-name" name="firstName" autoComplete="given-name" required />
                </FormField>
                <FormField {...formFieldHomepageProps} label="Last name" htmlFor="last-name">
              <input id="last-name" name="lastName" autoComplete="family-name" required />
                </FormField>
                <FormField {...formFieldHomepageProps} label="Company" htmlFor="company">
              <input id="company" name="company" autoComplete="organization" required />
                </FormField>
                <FormField {...formFieldHomepageProps} label="Role" htmlFor="role">
              <select id="role" name="role" defaultValue="" required>
                <option value="" disabled>Select your role</option>
                <option value="development-engineering">Development / Engineering</option>
                <option value="management-leadership">Management / Leadership</option>
                <option value="product">Product</option>
                <option value="data-analytics">Data / Analytics</option>
                <option value="operations">Operations</option>
                <option value="other">Other</option>
              </select>
                </FormField>
                <FormField {...formFieldHomepageProps} label="Company email" htmlFor="company-email" wide>
              <input id="company-email" name="email" type="email" autoComplete="email" required />
                </FormField>
                <FormField {...formFieldHomepageProps} label="Reason for inquiry" htmlFor="inquiry-reason" wide>
              <select id="inquiry-reason" name="inquiryReason" defaultValue="" required>
                <option value="" disabled>Select a reason</option>
                <option value="product-demo">Product demo</option>
                <option value="technical-questions">Technical questions</option>
                <option value="pricing-access">Pricing and access</option>
                <option value="partnership">Partnership</option>
                <option value="press-media">Press and media</option>
                <option value="other">Other</option>
              </select>
                </FormField>
                <FormField {...formFieldHomepageProps} label="Comments" htmlFor="comments" wide>
              <textarea id="comments" name="comments" />
                </FormField>
                <button className="button button--accent" type="submit">
                  Send message
                  <svg className={styles.buttonIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <path d="M4 12 12 4M6 4h6v6" />
                  </svg>
                </button>
              </SubmissionForm>
            )}
          />
        </SiteContainer>
      </MarketingSection>
      </main>
    </RouteTransition>
  );
}
