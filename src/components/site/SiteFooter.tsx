import Link from 'next/link';
import { BrandMark } from './BrandMark';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer__top">
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
            <span className="site-footer__link-heading">Connect</span>
            <Link href="/contact">Contact</Link>
            <Link href="/waitlist">Join waiting list</Link>
          </div>
        </div>
      </div>
      <div className="site-container site-footer__bottom">
        <span>© {new Date().getFullYear()} Kipory</span>
      </div>
    </footer>
  );
}
