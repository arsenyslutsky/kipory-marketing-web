import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import styles from './MarketingBlocks.module.css';

export type MarketingSectionTone = 'base' | 'alternate' | 'alternate-to-base';
export type MarketingGridFade = 'none' | 'left-to-right' | 'right-to-left';

export type MarketingSectionVisualProps = {
  tone?: MarketingSectionTone;
  grid?: boolean;
  gridFade?: MarketingGridFade;
  paddingTop?: number;
  paddingBottom?: number;
  gridSize?: number;
  gridOpacity?: number;
};

export type MarketingSectionProps = PropsWithChildren<
  MarketingSectionVisualProps & HTMLAttributes<HTMLElement>
>;

export function MarketingSection({
  children,
  className,
  tone = 'base',
  grid = false,
  gridFade = 'none',
  paddingTop = 110,
  paddingBottom = 110,
  gridSize = 20,
  gridOpacity = .22,
  style,
  ...props
}: MarketingSectionProps) {
  const visualStyle = {
    '--marketing-section-padding-top': `${paddingTop}px`,
    '--marketing-section-padding-bottom': `${paddingBottom}px`,
    '--marketing-grid-size': `${gridSize}px`,
    '--marketing-grid-opacity': String(gridOpacity),
    ...style,
  } as CSSProperties;

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(' ')}
      data-tone={tone}
      data-grid={grid ? 'true' : 'false'}
      data-grid-fade={gridFade}
      style={visualStyle}
      {...props}
    >
      {children}
    </section>
  );
}
