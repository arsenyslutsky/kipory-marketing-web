import { Crimson_Pro, Outfit, Oxanium } from 'next/font/google';

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-outfit',
});

export const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['300', '700'],
  variable: '--font-oxanium',
});

export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: '200',
  style: 'normal',
  variable: '--font-crimson-pro',
});

export const fontVariables = `${outfit.variable} ${oxanium.variable} ${crimsonPro.variable}`;
