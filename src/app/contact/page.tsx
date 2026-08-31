import type { Metadata } from 'next';
import { MarketingSection, PageHero, SiteContainer } from '@/components/marketing';
import {
  marketingSectionHomepageProps,
  pageHeroHomepageProps,
  siteContainerHomepageProps,
} from '@/components/marketing/presets';
import { BackgroundBeams } from '../../components/ui/BackgroundBeams';
import { RouteTransition } from '@/components/site/RouteTransition';
import { createPageMetadata } from '@/lib/siteMetadata';
import styles from '../marketing.module.css';
import { ContactInquiry } from './ContactInquiry';

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
        title="Let’s talk about what’s next."
        subtitle="QUESTIONS AND IDEAS - START HERE."
        titleClassName={`${styles.pageTextReveal} ${styles.pageTextRevealFirst}`}
        subtitleClassName={`${styles.pageTextReveal} ${styles.pageTextRevealSecond}`}
        background={<BackgroundBeams />}
      />

      <MarketingSection {...marketingSectionHomepageProps}>
        <SiteContainer {...siteContainerHomepageProps}>
          <ContactInquiry />
        </SiteContainer>
      </MarketingSection>
      </main>
    </RouteTransition>
  );
}
