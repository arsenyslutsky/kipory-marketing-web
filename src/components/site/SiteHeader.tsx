import Link from 'next/link';
import { SiteContainer } from '@/components/marketing';
import { siteContainerHomepageProps } from '@/components/marketing/presets';
import { siteConfig } from '@/lib/siteMetadata';
import { BrandMark } from './BrandMark';

const navigation = [
  { href: '/contact', label: "Let's Talk" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <SiteContainer {...siteContainerHomepageProps} className="site-header__inner">
        <Link className="brand" href="/" aria-label="Kipory home">
          <BrandMark className="brand__mark" />
          <span>KIPORY</span>
        </Link>

        <div className="site-header__actions">
          <nav className="site-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>

          <a className="button button--compact button--light site-header__cta" href={siteConfig.appUrl}>
            Sign in
          </a>
        </div>
      </SiteContainer>
    </header>
  );
}
