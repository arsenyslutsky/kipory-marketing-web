import type { CSSProperties } from 'react';
import {
  PillarIcon,
  type PillarIconFillMode,
  type PillarIconName,
} from './PillarIcon';
import {
  PillarSurroundingIcon,
  type PillarSurroundingIconName,
} from './PillarSurroundingIcon';
import { PillarsConnectors, type PillarPoint } from './PillarsConnectors';
import styles from './BusinessFlowVertical.module.css';

const pillars: Array<{ name: PillarIconName; label: string }> = [
  { name: 'server', label: 'Server' },
  { name: 'graph', label: 'Graph' },
  { name: 'vector', label: 'Vector' },
  { name: 'intelligence', label: 'Intelligence' },
];

const surroundingIconNames: PillarSurroundingIconName[] = [
  'download',
  'profile',
  'profile-alt',
];

function rowPoint(index: number, count: number, y: number, spacing: number) {
  const inset = 8;
  const availableWidth = 100 - inset * 2;
  const baseX = count === 1 ? 50 : inset + (availableWidth * index) / (count - 1);

  return {
    x: 50 + (baseX - 50) * spacing,
    y,
  };
}

function createSurroundingIcons(
  requestedTopCount: number,
  requestedBottomCount: number,
  requestedSpacing: number,
) {
  const topCount = Math.max(0, Math.floor(requestedTopCount));
  const bottomCount = Math.max(0, Math.floor(requestedBottomCount));
  const spacing = Math.min(1, Math.max(0, requestedSpacing));

  return [
    ...Array.from({ length: topCount }, (_, index) => ({
      name: surroundingIconNames[index % surroundingIconNames.length],
      ...rowPoint(index, topCount, 18, spacing),
    })),
    ...Array.from({ length: bottomCount }, (_, index) => ({
      name: surroundingIconNames[(topCount + index) % surroundingIconNames.length],
      ...rowPoint(index, bottomCount, 82, spacing),
    })),
  ];
}

export type BusinessFlowVerticalProps = {
  auxiliaryIconFillColor?: string;
  beamColor?: string;
  beamEmissionRandomness?: number;
  beamEnabled?: boolean;
  beamHeadGlowBlur?: number;
  beamHeadGlowOpacity?: number;
  beamHeadGlowRadius?: number;
  beamHighlightColor?: string;
  beamSpeed?: number;
  beamTrailLength?: number;
  burstFadeTime?: number;
  burstRadius?: number;
  burstStrength?: number;
  className?: string;
  color?: string;
  centralIconFillColor?: string;
  centralIconFillMode?: PillarIconFillMode;
  centralIconStrokeOpacity?: number;
  connectorColor?: string;
  connectorOpacity?: number;
  connectorRadius?: number;
  connectorWidth?: number;
  gradientEndColor?: string;
  gradientMidColor?: string;
  gradientStartColor?: string;
  gridColor?: string;
  gridDensity?: number;
  gridOpacity?: number;
  height?: CSSProperties['height'];
  iconSize?: number;
  maxConcurrentBeams?: number;
  numberOfNodesBottom?: number;
  numberOfNodesTop?: number;
  auxiliaryNodeSpacing?: number;
  showContinuationConnectors?: boolean;
  strokeWidth?: number;
  width?: CSSProperties['width'];
};

type IllustrationStyle = CSSProperties & {
  '--pillars-color': string;
  '--pillars-grid-color': string;
  '--pillars-grid-density': string;
  '--pillars-grid-opacity': string;
  '--pillars-height': string;
  '--pillars-icon-size': string;
  '--pillars-width': string;
};

type SurroundingIconStyle = CSSProperties & {
  '--surrounding-x': string;
  '--surrounding-y': string;
};

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

export function BusinessFlowVertical({
  auxiliaryIconFillColor = '#000000',
  beamColor = '#449c40',
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamHeadGlowBlur = 0,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 0,
  beamHighlightColor = '#c9ebc7',
  beamSpeed = 1,
  beamTrailLength = 0,
  burstFadeTime = 920,
  burstRadius = 32,
  burstStrength = 1,
  className,
  color = 'var(--paper)',
  centralIconFillColor = '#000000',
  centralIconFillMode = 'gradient',
  centralIconStrokeOpacity = 1,
  connectorColor = '#ffffff',
  connectorOpacity = 0.62,
  connectorRadius = 1.75,
  connectorWidth = 1.25,
  gradientEndColor = '#052f24',
  gradientMidColor = '#03492b',
  gradientStartColor = '#066b43',
  gridColor = '#39473f',
  gridDensity = 30,
  gridOpacity = 0.2,
  height = '38rem',
  iconSize = 40,
  maxConcurrentBeams = 24,
  numberOfNodesBottom = 10,
  numberOfNodesTop = 10,
  auxiliaryNodeSpacing = 1,
  showContinuationConnectors = false,
  strokeWidth = 5,
  width = '20rem',
}: BusinessFlowVerticalProps) {
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;
  const style: IllustrationStyle = {
    '--pillars-color': color,
    '--pillars-grid-color': gridColor,
    '--pillars-grid-density': `${gridDensity}px`,
    '--pillars-grid-opacity': String(gridOpacity),
    '--pillars-height': cssSize(height),
    '--pillars-icon-size': `${iconSize}px`,
    '--pillars-width': cssSize(width),
  };
  const surroundingIcons = createSurroundingIcons(
    numberOfNodesTop,
    numberOfNodesBottom,
    auxiliaryNodeSpacing,
  );
  const satellitePoints = surroundingIcons.map(({ x, y }) => [x, y] as PillarPoint);

  return (
    <section className={rootClassName} style={style} aria-label="Vertical business flow">
      <PillarsConnectors
        key={`${numberOfNodesTop}:${numberOfNodesBottom}:${auxiliaryNodeSpacing}`}
        beamColor={beamColor}
        beamEmissionRandomness={beamEmissionRandomness}
        beamEnabled={beamEnabled}
        beamHeadGlowBlur={beamHeadGlowBlur}
        beamHeadGlowOpacity={beamHeadGlowOpacity}
        beamHeadGlowRadius={beamHeadGlowRadius}
        beamHighlightColor={beamHighlightColor}
        beamSpeed={beamSpeed}
        beamTrailLength={beamTrailLength}
        burstFadeTime={burstFadeTime}
        burstRadius={burstRadius}
        burstStrength={burstStrength}
        color={connectorColor}
        connectorRadius={connectorRadius}
        maxConcurrentBeams={maxConcurrentBeams}
        opacity={connectorOpacity}
        satellitePoints={satellitePoints}
        showContinuationConnectors={showContinuationConnectors}
        width={connectorWidth}
      />
      <div className={styles.surroundingLayer} aria-hidden="true">
        {surroundingIcons.map((icon, index) => {
          const surroundingStyle: SurroundingIconStyle = {
            '--surrounding-x': `${icon.x}%`,
            '--surrounding-y': `${icon.y}%`,
          };

          return (
            <PillarSurroundingIcon
              className={styles.surroundingIcon}
              fill={auxiliaryIconFillColor}
              key={`${icon.name}-${index}`}
              name={icon.name}
              strokeWidth={strokeWidth / 4}
              style={surroundingStyle}
            />
          );
        })}
      </div>
      <div className={styles.composition}>
        <div className={styles.grid} role="list">
          {pillars.map((pillar) => (
            <article className={styles.card} role="listitem" key={pillar.name}>
              <PillarIcon
                className={styles.icon}
                fillColor={centralIconFillColor}
                fillMode={centralIconFillMode}
                name={pillar.name}
                strokeOpacity={centralIconStrokeOpacity}
                title={`${pillar.label} icon`}
                strokeWidth={strokeWidth}
                gradientStartColor={gradientStartColor}
                gradientMidColor={gradientMidColor}
                gradientEndColor={gradientEndColor}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
