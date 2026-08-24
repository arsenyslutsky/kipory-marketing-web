import { Chakra_Petch, Crimson_Pro, Outfit } from 'next/font/google';

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-outfit',
});

export const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['300', '700'],
  variable: '--font-chakra-petch',
});

export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: '200',
  style: 'normal',
  variable: '--font-crimson-pro',
});

export const fontVariables = `${outfit.variable} ${chakraPetch.variable} ${crimsonPro.variable}`;
