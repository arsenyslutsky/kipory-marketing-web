import type { CSSProperties } from 'react';
import styles from './MaskedBackground.module.css';

export type MaskedBackgroundVariant = 'hero' | 'pillars' | 'delivery';

export type MaskedBackgroundProps = {
  /** Match the corresponding landing-page surface, including its mask direction. */
  variant: MaskedBackgroundVariant;
  /** @deprecated Use maskWidth and maskHeight. Fallback for legacy callers. */
  maskSize?: number;
  /** Soft mask width as a percentage of the section width (50–500%). */
  maskWidth?: number;
  /** Soft mask height as a percentage of the section height (50–500%). */
  maskHeight?: number;
  /** Invert the tint and grid mask. Defaults on for Hero/Pillars, off for Delivery. */
  invert?: boolean;
  /** Soft-edged mask geometry. Rectangle preserves the existing image mask. */
  maskShape?: 'rectangle' | 'ellipsis';
  /** Opacity of the final masked tint and grid, after inversion (0–1). */
  maskOpacity?: number;
  /** Horizontal center of the mask shape within the section (0–100%). */
  maskCenterX?: number;
  /** Vertical center of the mask shape within the section (0–100%). */
  maskCenterY?: number;
  /** Dashed grid cell size in pixels. Hero uses the illustration's own grid. */
  gridSize?: number;
  /** Defaults to 0.4 for Pillars and 0.22 for Delivery; unused by Hero. */
  gridOpacity?: number;
  className?: string;
};

/** Decorative layer for a positioned, isolated section with a base surface. */
export function MaskedBackground({
  variant,
  maskSize = 85,
  maskWidth = maskSize,
  maskHeight = maskSize,
  invert = variant !== 'delivery',
  maskShape = 'rectangle',
  maskOpacity = 1,
  maskCenterX = 50,
  maskCenterY = 50,
  gridSize = 20,
  gridOpacity = variant === 'pillars' ? 0.4 : 0.22,
  className,
}: MaskedBackgroundProps) {
  const style = {
    '--masked-background-size': `${maskWidth}% ${maskHeight}%`,
    '--masked-background-opacity': maskOpacity,
    '--masked-background-offset-x': `${maskCenterX - 50}cqw`,
    '--masked-background-offset-y': `${maskCenterY - 50}cqh`,
    '--masked-background-grid-size': `${gridSize}px`,
    '--masked-background-grid-opacity': gridOpacity,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-masked-background={variant}
      data-mask-inverted={invert}
      data-mask-shape={maskShape}
      style={style}
    >
      {variant !== 'hero' && (
        <div className={styles.gridMask}><div className={styles.grid} /></div>
      )}
    </div>
  );
}
