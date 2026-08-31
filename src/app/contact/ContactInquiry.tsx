'use client';

import { useState } from 'react';
import {
  FormButton,
  FormDropdown,
  FormInput,
  FormTextarea,
  formControlCurrentNextjsAppProps,
} from '@/components/form-controls';
import { FormField, SplitLayout } from '@/components/marketing';
import {
  formFieldHomepageProps,
  splitLayoutHomepageProps,
} from '@/components/marketing/presets';
import { SubmissionForm } from '@/components/ui/SubmissionForm';
import {
  BusinessCoreNodeFlow,
  businessCoreNodeFlowContactProps,
} from '@/features/business-core-node-flow';
import styles from '../marketing.module.css';

const initialNotes = {
  heading: 'We’d love to hear from you.',
  body: 'Reach out with questions, product inquiries, or anything else you’d like to discuss. Share a few details and we’ll take it from there.',
};

const submittedNotes = {
  heading: 'What happens next',
  body: 'Thanks for reaching out. We’ll review your message and get back to you as soon as possible.',
};

export function ContactInquiry() {
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
          <p className={`eyebrow ${styles.pageTextReveal} ${styles.pageTextRevealLead}`}>
            Start a conversation
          </p>
          <strong className={notesHeadingClassName}>
            {notes.heading}
          </strong>
          <p className={notesBodyClassName}>
            {notes.body}
          </p>
          <BusinessCoreNodeFlow
            {...businessCoreNodeFlowContactProps}
            className={styles.contactCoreFlow}
          />
        </div>
      )}
      visual={(
        <SubmissionForm
          className={styles.contactForm}
          ariaLabel="Contact Kipory"
          panelSize="tall"
          onSubmitted={() => setSubmitted(true)}
          successStatus="MESSAGE SENT"
          successTitle="WE'LL TAKE IT FROM HERE."
          successBody="Thanks for the context. Our team will review your note and follow up by email."
        >
          <FormField {...formFieldHomepageProps} label="First name" htmlFor="first-name">
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="first-name"
              name="firstName"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField {...formFieldHomepageProps} label="Last name" htmlFor="last-name">
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="last-name"
              name="lastName"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField {...formFieldHomepageProps} label="Company" htmlFor="company">
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="company"
              name="company"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField {...formFieldHomepageProps} label="Role" htmlFor="role">
            <FormDropdown
              {...formControlCurrentNextjsAppProps}
              id="role"
              name="role"
              defaultValue=""
              required
            >
              <option value="" disabled>Select your role</option>
              <option value="development-engineering">Development / Engineering</option>
              <option value="management-leadership">Management / Leadership</option>
              <option value="product">Product</option>
              <option value="data-analytics">Data / Analytics</option>
              <option value="operations">Operations</option>
              <option value="other">Other</option>
            </FormDropdown>
          </FormField>
          <FormField {...formFieldHomepageProps} label="Company email" htmlFor="company-email" wide>
            <FormInput
              {...formControlCurrentNextjsAppProps}
              id="company-email"
              name="email"
              type="email"
              autoComplete="off"
              required
            />
          </FormField>
          <FormField
            {...formFieldHomepageProps}
            label="Reason for inquiry"
            htmlFor="inquiry-reason"
            wide
          >
            <FormDropdown
              {...formControlCurrentNextjsAppProps}
              id="inquiry-reason"
              name="inquiryReason"
              defaultValue=""
              required
            >
              <option value="" disabled>Select a reason</option>
              <option value="product-demo">Product demo</option>
              <option value="technical-questions">Technical questions</option>
              <option value="pricing-access">Pricing and access</option>
              <option value="partnership">Partnership</option>
              <option value="press-media">Press and media</option>
              <option value="other">Other</option>
            </FormDropdown>
          </FormField>
          <FormField {...formFieldHomepageProps} label="Comments" htmlFor="comments" wide>
            <FormTextarea
              {...formControlCurrentNextjsAppProps}
              id="comments"
              name="comments"
              autoComplete="off"
            />
          </FormField>
          <FormButton type="submit">Send message</FormButton>
        </SubmissionForm>
      )}
    />
  );
}
