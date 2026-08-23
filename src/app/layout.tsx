import type { Metadata } from 'next';
import { Datatype, Outfit, Ovo } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import './typography.css';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-outfit',
});

const ovo = Ovo({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ovo',
});

const datatype = Datatype({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-datatype',
});

export const metadata: Metadata = {
  title: {
    default: 'Kipory — See every signal. Shape what happens next.',
    template: '%s — Kipory',
  },
  description: 'Kipory gives product and operations teams a live, traceable view of every workflow moving through their business.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${ovo.variable} ${datatype.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
