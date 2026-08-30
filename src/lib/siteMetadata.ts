import type { Metadata } from 'next';

export const siteConfig = {
  appUrl: 'https://app.kipory.com/',
  defaultDescription: 'Kipory gives product and operations teams a live, traceable view of every workflow moving through their business.',
  defaultTitle: 'Kipory — See every signal. Shape what happens next.',
  name: 'Kipory',
  url: new URL('https://kipory.com/'),
} as const;

const socialImage = {
  alt: 'Kipory business workflow platform',
  height: 630,
  type: 'image/png',
  url: '/opengraph-image.png',
  width: 1200,
} as const;

type PageMetadataInput = {
  description: string;
  path: `/${string}`;
  socialTitle: string;
  title: Metadata['title'];
};

export function createPageMetadata({ description, path, socialTitle, title }: PageMetadataInput): Metadata {
  return {
    metadataBase: siteConfig.url,
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      images: [socialImage],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [socialImage],
    },
  };
}
