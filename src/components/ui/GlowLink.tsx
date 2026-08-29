import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import styles from './GlowLink.module.css';

export type GlowLinkVisualProps = {
  glowActive?: boolean;
  glowBlur?: number;
  glowColor?: string;
  glowDuration?: number;
  glowEdgeColor?: string;
  glowEdgeDuration?: number;
  glowHoverOpacity?: number;
  glowIdleOpacity?: number;
  glowSpread?: number;
};

export type GlowLinkProps = GlowLinkVisualProps & {
  children: ReactNode;
  href: string;
};

type GlowLinkStyle = CSSProperties & {
  '--glow-link-blur'?: string;
  '--glow-link-color'?: string;
  '--glow-link-duration'?: string;
  '--glow-link-edge-color'?: string;
  '--glow-link-edge-duration'?: string;
  '--glow-link-hover-opacity'?: string;
  '--glow-link-idle-opacity'?: string;
  '--glow-link-spread'?: string;
};

export function GlowLink({
  children,
  glowActive,
  glowBlur,
  glowColor,
  glowDuration,
  glowEdgeColor,
  glowEdgeDuration,
  glowHoverOpacity,
  glowIdleOpacity,
  glowSpread,
  href,
}: GlowLinkProps) {
  const glowStyle: GlowLinkStyle = {
    '--glow-link-blur': glowBlur === undefined ? undefined : `${glowBlur}px`,
    '--glow-link-color': glowColor,
    '--glow-link-duration': glowDuration === undefined ? undefined : `${glowDuration}s`,
    '--glow-link-edge-color': glowEdgeColor,
    '--glow-link-edge-duration': glowEdgeDuration === undefined ? undefined : `${glowEdgeDuration}s`,
    '--glow-link-hover-opacity': glowHoverOpacity === undefined ? undefined : String(glowHoverOpacity),
    '--glow-link-idle-opacity': glowIdleOpacity === undefined ? undefined : String(glowIdleOpacity),
    '--glow-link-spread': glowSpread === undefined ? undefined : `${glowSpread}px`,
  };

  return (
    <span className={styles.wrapper}>
      <Link
        className={styles.link}
        data-glow-active={glowActive ? 'true' : undefined}
        href={href}
        style={glowStyle}
      >
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
