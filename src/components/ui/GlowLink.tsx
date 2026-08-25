import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './GlowLink.module.css';

type GlowLinkProps = {
  children: ReactNode;
  href: string;
};

export function GlowLink({ children, href }: GlowLinkProps) {
  return (
    <span className={styles.wrapper}>
      <Link className={styles.link} href={href}>
        <span className={styles.outerGlow} aria-hidden="true">
          <span className={styles.glowField} />
        </span>
        <span className={styles.edgeGlow} aria-hidden="true">
          <span className={styles.glowField} />
        </span>
        <span className={styles.surface}>{children}</span>
      </Link>
    </span>
  );
}
