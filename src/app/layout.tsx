import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { siteConfig } from '@/lib/siteMetadata';
import { fontVariables } from './fonts';
import './typography.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: siteConfig.defaultTitle,
    template: '%s — Kipory',
  },
  description: siteConfig.defaultDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
