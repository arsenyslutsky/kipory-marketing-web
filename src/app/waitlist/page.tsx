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
import { WaitlistInquiry } from './WaitlistInquiry';

export const metadata: Metadata = createPageMetadata({
  title: 'Join the waiting list',
  socialTitle: 'Join the waiting list — Kipory',
  description: 'Join the Kipory waiting list and be among the first to hear when access expands.',
  path: '/waitlist/',
});

export default function WaitlistPage() {
  return (
    <RouteTransition>
      <main id="main-content" className={styles.main}>
      <PageHero
        {...pageHeroHomepageProps}
        title="Join the waiting list."
        subtitle="SEE THE FLOW SOONER."
        titleClassName={`${styles.pageTextReveal} ${styles.pageTextRevealFirst}`}
        subtitleClassName={`${styles.pageTextReveal} ${styles.pageTextRevealSecond}`}
        background={<BackgroundBeams />}
      />

      <MarketingSection {...marketingSectionHomepageProps}>
        <SiteContainer {...siteContainerHomepageProps}>
          <WaitlistInquiry />
        </SiteContainer>
      </MarketingSection>
      </main>
    </RouteTransition>
  );
}
