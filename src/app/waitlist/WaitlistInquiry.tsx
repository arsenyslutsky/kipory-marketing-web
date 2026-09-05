'use client';

import { useState } from 'react';
import {
  FormButton,
  FormInput,
  formControlCurrentNextjsAppProps,
} from '@/components/form-controls';
import { FormField, SplitLayout } from '@/components/marketing';
import { MobileWorkflowFallback } from '@/components/media/MobileWorkflowFallback';
import {
  formFieldHomepageProps,
  splitLayoutHomepageProps,
} from '@/components/marketing/presets';
import { SubmissionForm } from '@/components/ui/SubmissionForm';
import {
  BusinessCoreNodeFlow,
  businessCoreNodeFlowWaitlistProps,
} from '@/features/business-core-node-flow';
import styles from '../marketing.module.css';

const initialNotes = {
  heading: 'Want early access?',
  body: 'Tell us who you are and where you work. We’ll follow up by email as Kipory access expands.',
};

const submittedNotes = {
  heading: 'What happens next',
  body: 'We’ll review your request and keep you informed by email as access expands.',
};

export function WaitlistInquiry() {
  const [submitted, setSubmitted] = useState(false);
  const notes = submitted ? submittedNotes : initialNotes;
  const notesHeadingClassName = submitted
    ? styles.submissionTextRevealHeading
    : `${styles.pageTextReveal} ${styles.pageTextRevealLead}`;
  const notesBodyClassName = submitted
    ? styles.submissionTextRevealBody
    : `${styles.pageTextReveal} ${styles.pageTextRevealBody}`;

  return (
    <SplitLayout
      {...splitLayoutHomepageProps}
      contentRatio={0.75}
      visualRatio={1.25}
      gap={118}
      content={(
        <div className={styles.contactNotes}>
          <strong className={notesHeadingClassName}>{notes.heading}</strong>
          <p className={notesBodyClassName}>{notes.body}</p>
          <MobileWorkflowFallback
            alt="Business core node flow"
            className={styles.contactCoreFlow}
            darkSrc="/images/workflows/mobile/waitlist-core-flow.png"
            height={176}
            lightSrc="/images/workflows/mobile/waitlist-core-flow-light.png"
            name="waitlist-core"
            width={176}
          >
            <BusinessCoreNodeFlow
              {...businessCoreNodeFlowWaitlistProps}
              className={styles.contactCoreFlow}
            />
          </MobileWorkflowFallback>
        </div>
      )}
      visual={(
        <SubmissionForm
          className={styles.contactForm}
          ariaLabel="Join the Kipory waiting list"
          onSubmitted={() => setSubmitted(true)}
          successStatus="ACCESS REQUESTED"
          successTitle="YOU'RE ON THE LIST."
          successBody="Thanks for joining. We'll keep you informed as Kipory access expands."
        >
          <FormField {...formFieldHomepageProps} label="Name" htmlFor="name">
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="name"
              name="name"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField {...formFieldHomepageProps} label="Work email" htmlFor="email">
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField {...formFieldHomepageProps} label="Company (optional)" htmlFor="company" wide>
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="company"
              name="company"
              autoComplete="off"
            />
          </FormField>
          <FormButton type="submit">Join waitlist</FormButton>
        </SubmissionForm>
      )}
    />
  );
}
