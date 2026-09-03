import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { siteConfig } from '@/lib/siteMetadata';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { THEME_COLORS, themeBootScript } from '@/theme/theme';
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

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: THEME_COLORS.dark,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={fontVariables}
      data-theme="dark"
      data-theme-preference="system"
      suppressHydrationWarning
    >
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
