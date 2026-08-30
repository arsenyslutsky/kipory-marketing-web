import { expect, it } from 'vitest';
import robots, { dynamic as robotsDynamic } from './robots';
import sitemap, { dynamic as sitemapDynamic } from './sitemap';

it('opts metadata routes into static export generation', () => {
  expect(robotsDynamic).toBe('force-static');
  expect(sitemapDynamic).toBe('force-static');
});

it('allows crawlers and advertises the canonical sitemap', () => {
  expect(robots()).toEqual({
    host: 'https://kipory.com',
    rules: {
      allow: '/',
      userAgent: '*',
    },
    sitemap: 'https://kipory.com/sitemap.xml',
  });
});

it('lists every canonical marketing route once', () => {
  expect(sitemap().map(({ url }) => url)).toEqual([
    'https://kipory.com/',
    'https://kipory.com/contact/',
    'https://kipory.com/waitlist/',
  ]);
});
