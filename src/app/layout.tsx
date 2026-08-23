import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { fontVariables } from './fonts';
import './typography.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kipory — See every signal. Shape what happens next.',
    template: '%s — Kipory',
  },
  description: 'Kipory gives product and operations teams a live, traceable view of every workflow moving through their business.',
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
