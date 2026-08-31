import type { ReactNode } from 'react';
import { MarketingSection, SiteContainer } from '@/components/marketing';
import { siteContainerHomepageProps } from '@/components/marketing/presets';

type FormControlStoryFrameProps = {
  children: ReactNode;
};

export function FormControlStoryFrame({ children }: FormControlStoryFrameProps) {
  return (
    <MarketingSection tone="alternate" paddingTop={80} paddingBottom={80}>
      <SiteContainer {...siteContainerHomepageProps}>
        <div style={{ maxWidth: 520 }}>{children}</div>
      </SiteContainer>
    </MarketingSection>
  );
}
