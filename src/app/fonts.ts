import { Datatype, Outfit, Ovo } from 'next/font/google';

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400'],
  variable: '--font-outfit',
});

export const ovo = Ovo({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ovo',
});

export const datatype = Datatype({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-datatype',
});

export const fontVariables = `${outfit.variable} ${ovo.variable} ${datatype.variable}`;
