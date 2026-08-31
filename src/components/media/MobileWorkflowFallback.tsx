'use client';

import type { PropsWithChildren } from 'react';
import { useSyncExternalStore } from 'react';
import styles from './MobileWorkflowFallback.module.css';

const desktopMediaQuery = '(min-width: 621px)';

type MobileWorkflowFallbackProps = PropsWithChildren<{
  alt: string;
  className?: string;
  height: number;
  name: string;
  src: string;
  width: number;
  fill?: boolean;
  fit?: 'contain' | 'cover';
}>;

function subscribeToDesktopViewport(onStoreChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => undefined;

  const mediaQuery = window.matchMedia(desktopMediaQuery);
  mediaQuery.addEventListener('change', onStoreChange);
  return () => mediaQuery.removeEventListener('change', onStoreChange);
}

function isDesktopViewport() {
  if (typeof window.matchMedia !== 'function') return true;
  return window.matchMedia(desktopMediaQuery).matches;
}

function useDesktopViewport() {
  return useSyncExternalStore(subscribeToDesktopViewport, isDesktopViewport, () => false);
}

function densitySourceSet(src: string) {
  const extensionIndex = src.lastIndexOf('.');
  const stem = src.slice(0, extensionIndex);
  const extension = src.slice(extensionIndex);
  return `${src} 1x, ${stem}@2x${extension} 2x, ${stem}@3x${extension} 3x`;
}

export function MobileWorkflowFallback({
  alt,
  children,
  className,
  fill = false,
  fit = 'contain',
  height,
  name,
  src,
  width,
}: MobileWorkflowFallbackProps) {
  const desktop = useDesktopViewport();

  if (desktop) return children;

  return (
    <picture
      className={`${styles.picture} ${fill ? styles.fill : ''} ${className ?? ''}`.trim()}
      data-mobile-workflow-fallback={name}
      style={fill ? undefined : {
        aspectRatio: `${width} / ${height}`,
        width: `min(100%, ${width}px)`,
      }}
    >
      <img
        alt={alt}
        className={`${styles.image} ${styles[fit]}`}
        decoding="async"
        draggable="false"
        height={height}
        src={src}
        srcSet={densitySourceSet(src)}
        width={width}
      />
    </picture>
  );
}
