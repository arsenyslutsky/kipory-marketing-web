import { expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Chakra_Petch: () => ({ className: '', variable: '--font-chakra-petch' }),
  Crimson_Pro: () => ({ className: '', variable: '--font-crimson-pro' }),
  Outfit: () => ({ className: '', variable: '--font-outfit' }),
}));
import { metadata as contactMetadata } from './contact/page';
import { metadata as layoutMetadata } from './layout';
import { metadata as homeMetadata } from './page';
import { metadata as waitlistMetadata } from './waitlist/page';

const routeMetadata = [
  ['home', homeMetadata, '/'],
  ['contact', contactMetadata, '/contact/'],
  ['waitlist', waitlistMetadata, '/waitlist/'],
] as const;

it('uses the confirmed Kipory origin as the metadata base', () => {
  expect(layoutMetadata.metadataBase?.toString()).toBe('https://kipory.com/');
});

it('keeps route-specific canonical and social URLs out of the root layout', () => {
  expect(layoutMetadata.alternates?.canonical).toBeUndefined();
  expect(layoutMetadata.openGraph).toBeUndefined();
  expect(layoutMetadata.twitter).toBeUndefined();
});

it.each(routeMetadata)('%s publishes its own canonical and social URL', (_, metadata, path) => {
  expect(metadata.alternates?.canonical).toBe(path);
  expect(metadata.openGraph?.url).toBe(path);
});

it.each(routeMetadata)('%s publishes complete social sharing metadata', (_, metadata) => {
  expect(metadata.openGraph).toMatchObject({
    locale: 'en_US',
    siteName: 'Kipory',
    type: 'website',
  });
  expect(metadata.openGraph?.images).toEqual([
    {
      alt: 'Kipory business workflow platform',
      height: 630,
      type: 'image/png',
      url: '/opengraph-image.png',
      width: 1200,
    },
  ]);
  expect(metadata.twitter).toMatchObject({
    card: 'summary_large_image',
    images: [
      {
        alt: 'Kipory business workflow platform',
        height: 630,
        type: 'image/png',
        url: '/opengraph-image.png',
        width: 1200,
      },
    ],
  });
});
