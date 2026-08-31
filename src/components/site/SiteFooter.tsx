import Link from 'next/link';
import { SiteContainer } from '@/components/marketing';
import { siteContainerHomepageProps } from '@/components/marketing/presets';
import { siteConfig } from '@/lib/siteMetadata';
import { BrandMark } from './BrandMark';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <SiteContainer {...siteContainerHomepageProps} className="site-footer__top">
        <div>
          <Link className="brand" href="/" aria-label="Kipory home">
            <BrandMark className="brand__mark" />
            <span>KIPORY</span>
          </Link>
          <p className="site-footer__statement">Complex processes made to be simple.</p>
        </div>
        <div className="site-footer__links">
          <div>
            <span className="site-footer__link-heading">Explore</span>
            <Link href="/">Home</Link>
          </div>
          <div>
            <span className="site-footer__link-heading">Create</span>
            <a href={siteConfig.appUrl}>Sign in</a>
          </div>
          <div>
            <span className="site-footer__link-heading">Connect</span>
            <Link href="/contact">Contact</Link>
            <Link href="/waitlist">Join waiting list</Link>
          </div>
        </div>
      </SiteContainer>
      <SiteContainer {...siteContainerHomepageProps} className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Kipory</span>
      </SiteContainer>
    </footer>
  );
}
