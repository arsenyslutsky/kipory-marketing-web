import Link from 'next/link';

import styles from '../marketing.module.css';

type LearnMoreLinkProps = {
  className: string;
  href: string;
  label: string;
  scrollShiftRem?: number;
};

export function LearnMoreLink({ className, href, label, scrollShiftRem = 0 }: LearnMoreLinkProps) {
  return (
    <Link
      className={`${styles.learnMoreLink} ${className}`}
      href={href}
      data-scroll-parallax
      data-scroll-shift-rem={scrollShiftRem}
    >
      <span>{label}</span>
      <span className={styles.learnMoreChevron} aria-hidden="true">
        <svg viewBox="0 0 16 18" focusable="false">
          <path d="M3 3.5 8 8.5l5-5M3 9.5l5 5 5-5" />
        </svg>
      </span>
    </Link>
  );
}
