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
import styles from '../marketing.module.css';

export const metadata: Metadata = {
  title: 'Join the waiting list',
  description: 'Join the Kipory waiting list and be among the first to hear when access expands.',
};

export default function WaitlistPage() {
  return (
    <main id="main-content" className={styles.main}>
      <PageHero
        {...pageHeroHomepageProps}
        title="Join the waiting list."
        subtitle="SEE THE FLOW SOONER."
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
                <strong>What happens next</strong>
                <p>Tell us who you are and where you work. We will use your email to follow up about Kipory access.</p>
              </div>
            )}
            visual={(
              <SubmissionForm
                className={styles.contactForm}
                ariaLabel="Join the Kipory waiting list"
                successStatus="ACCESS REQUESTED"
                successTitle="YOU'RE ON THE LIST."
                successBody="Thanks for joining. We'll keep you informed as Kipory access expands."
              >
                <FormField {...formFieldHomepageProps} label="Name" htmlFor="name">
              <input id="name" name="name" autoComplete="name" required />
                </FormField>
                <FormField {...formFieldHomepageProps} label="Work email" htmlFor="email">
              <input id="email" name="email" type="email" autoComplete="email" required />
                </FormField>
                <FormField {...formFieldHomepageProps} label="Company (optional)" htmlFor="company" wide>
              <input id="company" name="company" autoComplete="organization" />
                </FormField>
                <button className="button button--accent" type="submit">
                  Join waitlist
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
  );
}
