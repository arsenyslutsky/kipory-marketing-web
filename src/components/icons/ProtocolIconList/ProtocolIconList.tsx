import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { ProtocolIcon, type ProtocolIconVariant } from '../ProtocolIcon';
import styles from './ProtocolIconList.module.css';

export type ProtocolIconListLayout = 'wrap' | 'scroll';

export type ProtocolIconListProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  comingSoonFrom?: number;
  comingSoonGap?: number;
  comingSoonLineFadeLength?: number;
  comingSoonLogosOpacity?: number;
  comingSoonOnNextLine?: boolean;
  comingSoonRowGap?: number;
  comingSoonTitleColor?: string;
  comingSoonTitleOpacity?: number;
  layout?: ProtocolIconListLayout;
  logoOpacity?: number;
  logoScale?: number;
  scaleOfComingSoonItems?: number;
  scaleOfSpaceItems?: number;
  scaleOfSpaceLogos?: number;
  size?: number;
  textOpacity?: number;
  textScale?: number;
  title?: ReactNode;
  titleOpacity?: number;
  titleScale?: number;
  variants: readonly ProtocolIconVariant[];
};

type ProtocolIconListStyle = CSSProperties & {
  '--protocol-icon-list-title-opacity': string;
  '--protocol-icon-list-coming-soon-scale': string;
  '--protocol-icon-list-item-gap': string;
  '--protocol-icon-list-title-gap': string;
  '--protocol-icon-list-title-inline-gap': string;
  '--protocol-icon-list-title-rule-width': string;
  '--protocol-icon-list-status-gap': string;
  '--protocol-icon-list-status-fade-start': string;
  '--protocol-icon-list-status-line-width': string;
  '--protocol-icon-list-status-color': string;
  '--protocol-icon-list-status-opacity': string;
  '--protocol-icon-list-row-gap': string;
  '--protocol-icon-logo-opacity': string;
  '--protocol-icon-logo-text-gap': string;
  '--protocol-icon-text-opacity': string;
  '--protocol-icon-text-size': string;
};

type ProtocolIconItemStyle = CSSProperties & {
  '--protocol-icon-logo-text-gap'?: string;
  '--protocol-icon-text-size'?: string;
};

const protocolItemPositionStyle = { position: 'relative' } satisfies CSSProperties;
const comingSoonPositionStyle = {
  position: 'absolute',
  bottom: 'calc(100% + var(--protocol-icon-list-status-gap, 6px))',
  left: 0,
} satisfies CSSProperties;

function clampOpacity(opacity: number) {
  return Math.max(0, Math.min(1, opacity));
}

function clampScale(scale: number) {
  return Math.max(0.5, Math.min(1.5, scale));
}

function formatPixels(value: number) {
  return `${Math.round(value * 1000) / 1000}px`;
}

function formatPercentage(value: number) {
  return `${Math.round(value * 1000) / 1000}%`;
}

function formatContainerInline(value: number) {
  return `${Math.round(value * 1000) / 1000}cqi`;
}

export function ProtocolIconList({
  className,
  comingSoonFrom = 0,
  comingSoonGap,
  comingSoonLineFadeLength = 0.4,
  comingSoonLogosOpacity = 1,
  comingSoonOnNextLine = false,
  comingSoonRowGap = 40,
  comingSoonTitleColor = 'var(--accent)',
  comingSoonTitleOpacity = 0.8,
  layout = 'wrap',
  logoOpacity = 1,
  logoScale = 1,
  scaleOfComingSoonItems = 1,
  scaleOfSpaceItems = 1,
  scaleOfSpaceLogos = 1,
  size = 48,
  style,
  textOpacity = 1,
  textScale = 1,
  title,
  titleOpacity = 1,
  titleScale = 1,
  variants,
  ...props
}: ProtocolIconListProps) {
  const comingSoonPosition = Number.isFinite(comingSoonFrom)
    ? Math.max(0, Math.floor(comingSoonFrom))
    : 0;
  const isComingSoonOnNextLine = comingSoonOnNextLine
    && comingSoonPosition > 1
    && comingSoonPosition <= variants.length;
  const comingSoonLineRemainder = 1 - clampOpacity(comingSoonLineFadeLength);
  const comingSoonItemsScale = clampScale(scaleOfComingSoonItems);
  const statusGap = typeof comingSoonGap === 'number' && Number.isFinite(comingSoonGap)
    ? Math.max(0, comingSoonGap)
    : Math.max(4, Math.min(8, size / 8));
  const rowGap = typeof comingSoonRowGap === 'number' && Number.isFinite(comingSoonRowGap)
    ? Math.max(statusGap + 18, comingSoonRowGap)
    : Math.max(statusGap + 18, 40);
  const scaledStyle: ProtocolIconListStyle = {
    '--protocol-icon-list-coming-soon-scale': `${comingSoonItemsScale}`,
    '--protocol-icon-list-title-opacity': `${clampOpacity(titleOpacity)}`,
    '--protocol-icon-list-item-gap': formatPixels(
      Math.max(12, Math.min(48, size)) * clampScale(scaleOfSpaceItems),
    ),
    '--protocol-icon-list-title-gap': `${Math.max(12, size * (2 / 3))}px`,
    '--protocol-icon-list-title-inline-gap': `${Math.max(8, size * (11 / 24))}px`,
    '--protocol-icon-list-title-rule-width': `${Math.max(24, size * (7 / 6))}px`,
    '--protocol-icon-list-status-gap': formatPixels(statusGap),
    '--protocol-icon-list-status-fade-start': formatPercentage(
      comingSoonLineRemainder * 100,
    ),
    '--protocol-icon-list-status-line-width': formatContainerInline(
      comingSoonLineRemainder * 100,
    ),
    '--protocol-icon-list-status-color': comingSoonTitleColor,
    '--protocol-icon-list-status-opacity': `${clampOpacity(comingSoonTitleOpacity)}`,
    '--protocol-icon-list-row-gap': formatPixels(rowGap),
    '--protocol-icon-logo-opacity': `${clampOpacity(logoOpacity)}`,
    '--protocol-icon-logo-text-gap': formatPixels(
      Math.min(size * 0.625, 16) * clampScale(scaleOfSpaceLogos),
    ),
    '--protocol-icon-text-opacity': `${clampOpacity(textOpacity)}`,
    '--protocol-icon-text-size': formatPixels(size * 0.8 * clampScale(textScale)),
  };
  const titleSize = Math.max(12, size * (8 / 15)) * clampScale(titleScale);
  const renderItems = (
    rowVariants: readonly ProtocolIconVariant[],
    indexOffset = 0,
  ) => rowVariants.map((variant, rowIndex) => {
    const index = indexOffset + rowIndex;
    const isComingSoon = comingSoonPosition > 0 && index + 1 >= comingSoonPosition;
    const itemScale = isComingSoon ? comingSoonItemsScale : 1;
    const itemStyle: ProtocolIconItemStyle = isComingSoon
      ? {
          ...protocolItemPositionStyle,
          '--protocol-icon-logo-text-gap': formatPixels(
            Math.min(size * 0.625, 16) * clampScale(scaleOfSpaceLogos) * itemScale,
          ),
          '--protocol-icon-text-size': formatPixels(
            size * 0.8 * clampScale(textScale) * itemScale,
          ),
        }
      : protocolItemPositionStyle;

    return (
      <li className={styles.item} key={variant} style={itemStyle}>
        {isComingSoon && index + 1 === comingSoonPosition ? (
          <span className={styles.comingSoon} style={comingSoonPositionStyle}>
            Coming soon
          </span>
        ) : null}
        <ProtocolIcon
          variant={variant}
          height={size * clampScale(logoScale) * itemScale}
          opacity={isComingSoon ? clampOpacity(comingSoonLogosOpacity) : undefined}
          withText
        />
      </li>
    );
  });

  return (
    <div
      {...props}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-coming-soon-layout={isComingSoonOnNextLine ? 'new-row' : 'overlay'}
      data-layout={layout}
      style={{ ...scaledStyle, ...style }}
    >
      {title ? (
        <p className={styles.title} style={{ fontSize: titleSize }}>
          {title}
        </p>
      ) : null}
      {isComingSoonOnNextLine ? (
        <div className={styles.rows}>
          <ul aria-label="Available protocols" className={styles.list}>
            {renderItems(variants.slice(0, comingSoonPosition - 1))}
          </ul>
          <ul aria-label="Coming soon protocols" className={styles.list}>
            {renderItems(
              variants.slice(comingSoonPosition - 1),
              comingSoonPosition - 1,
            )}
          </ul>
        </div>
      ) : (
        <ul className={styles.list}>{renderItems(variants)}</ul>
      )}
    </div>
  );
}
