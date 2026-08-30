import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/siteMetadata';

const routes = ['/', '/contact/', '/waitlist/'] as const;

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
  }));
}
