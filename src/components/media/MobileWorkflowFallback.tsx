'use client';

import type { CSSProperties, PropsWithChildren } from 'react';
import { useSyncExternalStore } from 'react';
import type { ResolvedTheme } from '@/theme/theme';
import styles from './MobileWorkflowFallback.module.css';

const desktopMediaQuery = '(min-width: 621px)';
const transparentImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E";

type FallbackImageStyle = CSSProperties & {
  '--mobile-workflow-dark-image': string;
  '--mobile-workflow-light-image': string;
  '--mobile-workflow-selected-image'?: string;
};

type MobileWorkflowFallbackProps = PropsWithChildren<{
  alt: string;
  className?: string;
  darkSrc: string;
  height: number;
  lightSrc: string;
  mode?: ResolvedTheme;
  name: string;
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

function densityImageSet(src: string) {
  const extensionIndex = src.lastIndexOf('.');
  const stem = src.slice(0, extensionIndex);
  const extension = src.slice(extensionIndex);
  return `image-set(url(${JSON.stringify(src)}) 1x, url(${JSON.stringify(`${stem}@2x${extension}`)}) 2x, url(${JSON.stringify(`${stem}@3x${extension}`)}) 3x)`;
}

export function MobileWorkflowFallback({
  alt,
  children,
  className,
  darkSrc,
  fill = false,
  fit = 'contain',
  height,
  lightSrc,
  mode,
  name,
  width,
}: MobileWorkflowFallbackProps) {
  const desktop = useDesktopViewport();

  if (desktop) return children;

  const imageStyle: FallbackImageStyle = {
    '--mobile-workflow-dark-image': densityImageSet(darkSrc),
    '--mobile-workflow-light-image': densityImageSet(lightSrc),
    ...(mode ? {
      '--mobile-workflow-selected-image': `var(--mobile-workflow-${mode}-image)`,
    } : {}),
  };

  return (
    <picture
      className={`${styles.picture} ${fill ? styles.fill : ''} ${className ?? ''}`.trim()}
      data-mobile-workflow-fallback={name}
      data-mode={mode}
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
        src={transparentImage}
        style={imageStyle}
        width={width}
      />
    </picture>
  );
}
