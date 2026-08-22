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
          <p className="site-footer__statement">A clearer way to understand how work moves.</p>
        </div>
        <div className="site-footer__links">
          <div>
            <span>Explore</span>
            <Link href="/product">Product</Link>
            <Link href="/about">About</Link>
          </div>
          <div>
            <span>Connect</span>
            <Link href="/contact">Contact</Link>
            <Link href="/contact">Request access</Link>
          </div>
        </div>
      </div>
      <div className="site-container site-footer__bottom">
        <span>© {new Date().getFullYear()} Kipory</span>
        <span>Built for systems that never stand still.</span>
      </div>
    </footer>
  );
}
