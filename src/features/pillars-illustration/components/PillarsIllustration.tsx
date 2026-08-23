import type { CSSProperties } from 'react';
import { PillarIcon, type PillarIconName } from './PillarIcon';
import {
  PillarSurroundingIcon,
  type PillarSurroundingIconName,
} from './PillarSurroundingIcon';
import { PillarsConnectors, type PillarPoint } from './PillarsConnectors';
import styles from './PillarsIllustration.module.css';

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

function perimeterPoint(index: number, count: number) {
  const inset = 8;
  const sideLength = 100 - inset * 2;
  const perimeter = sideLength * 4;
  const position = ((index + 0.5) * perimeter) / count;

  if (position < sideLength) return { x: inset + position, y: inset };
  if (position < sideLength * 2) {
    return { x: 100 - inset, y: inset + position - sideLength };
  }
  if (position < sideLength * 3) {
    return { x: 100 - inset - (position - sideLength * 2), y: 100 - inset };
  }
  return { x: inset, y: 100 - inset - (position - sideLength * 3) };
}

function createSurroundingIcons(requestedCount: number) {
  const count = Math.max(0, Math.floor(requestedCount));
  return Array.from({ length: count }, (_, index) => ({
    name: surroundingIconNames[index % surroundingIconNames.length],
    ...perimeterPoint(index, count),
  }));
}

export type PillarsIllustrationProps = {
  auxiliaryIconCount?: number;
  beamColor?: string;
  beamEnabled?: boolean;
  beamHighlightColor?: string;
  beamSpeed?: number;
  className?: string;
  color?: string;
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

export function PillarsIllustration({
  auxiliaryIconCount = 20,
  beamColor = '#449c40',
  beamEnabled = true,
  beamHighlightColor = '#c9ebc7',
  beamSpeed = 1,
  className,
  color = 'var(--paper)',
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
  strokeWidth = 5,
  width = '20rem',
}: PillarsIllustrationProps) {
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
  const surroundingIcons = createSurroundingIcons(auxiliaryIconCount);
  const satellitePoints = surroundingIcons.map(({ x, y }) => [x, y] as PillarPoint);

  return (
    <section className={rootClassName} style={style} aria-label="Platform pillar illustration">
      <PillarsConnectors
        key={satellitePoints.length}
        beamColor={beamColor}
        beamEnabled={beamEnabled}
        beamHighlightColor={beamHighlightColor}
        beamSpeed={beamSpeed}
        color={connectorColor}
        connectorRadius={connectorRadius}
        maxConcurrentBeams={maxConcurrentBeams}
        opacity={connectorOpacity}
        satellitePoints={satellitePoints}
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
                name={pillar.name}
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
