'use client';

import {
  FlowLayer3D,
  type FlowLayer3DArrival,
  type FlowLayer3DArrivalEvent,
  type FlowLayer3DBeamSource,
} from '@/components/elements/FlowLayer3D';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  createBusinessFlowVerticalBeamSource,
  createBusinessFlowVerticalPaths,
  type PillarPoint,
} from '../routes';
import {
  PillarIcon,
  type PillarIconFillMode,
  type PillarIconName,
} from './PillarIcon';
import {
  PillarSurroundingIcon,
  type PillarSurroundingIconName,
} from './PillarSurroundingIcon';
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

  return { x: 50 + (baseX - 50) * spacing, y };
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

type BurstStyle = CSSProperties & {
  '--burst-color': string;
  '--burst-core-fade-time': string;
  '--burst-fade-time': string;
  '--burst-highlight': string;
  '--burst-radius': string;
  '--burst-strength': string;
};

type BurstRecord = {
  key: string;
  point: FlowLayer3DArrival['point'];
};

type BurstContext = {
  beamEnabled: boolean;
  beamSource: FlowLayer3DBeamSource;
  reducedMotion: boolean;
};

type BurstState = {
  context: BurstContext;
  records: BurstRecord[];
};

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

function useReducedMotionPreference() {
  const getPreference = () => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [reducedMotion, setReducedMotion] = useState(getPreference);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches);

    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
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
  const reducedMotion = useReducedMotionPreference();
  const surroundingIcons = useMemo(
    () => createSurroundingIcons(numberOfNodesTop, numberOfNodesBottom, auxiliaryNodeSpacing),
    [auxiliaryNodeSpacing, numberOfNodesBottom, numberOfNodesTop],
  );
  const satellitePoints = useMemo(
    () => surroundingIcons.map(({ x, y }) => [x, y] as PillarPoint),
    [surroundingIcons],
  );
  const curve = Math.min(100, Math.max(0, connectorRadius * 20));
  const paths = useMemo(
    () => createBusinessFlowVerticalPaths(satellitePoints, showContinuationConnectors)
      .map((path) => ({ ...path, curve })),
    [curve, satellitePoints, showContinuationConnectors],
  );
  const beamSource = useMemo(
    () => createBusinessFlowVerticalBeamSource({
      connectorRadius,
      emissionRandomness: beamEmissionRandomness,
      maxConcurrentBeams,
      satellitePoints,
      showContinuationConnectors,
      speed: beamSpeed,
      trailLengthInIllustrationUnits: beamTrailLength,
    }),
    [
      beamEmissionRandomness,
      beamSpeed,
      beamTrailLength,
      connectorRadius,
      maxConcurrentBeams,
      satellitePoints,
      showContinuationConnectors,
    ],
  );
  const connector = useMemo(() => ({
    color: connectorColor,
    opacity: connectorOpacity,
    stroke: 'dashed' as const,
    width: connectorWidth,
  }), [connectorColor, connectorOpacity, connectorWidth]);
  const beam = useMemo(() => ({
    beamColor,
    beamHighlightColor,
    beamWidth: Math.max(1.25, connectorWidth * 1.4),
    enabled: beamEnabled,
    glowIntensity: 1,
    headGlowBlur: beamHeadGlowBlur,
    headGlowOpacity: beamHeadGlowOpacity,
    headGlowRadius: beamHeadGlowRadius,
    trailLength: 0,
  }), [
    beamColor,
    beamEnabled,
    beamHeadGlowBlur,
    beamHeadGlowOpacity,
    beamHeadGlowRadius,
    beamHighlightColor,
    connectorWidth,
  ]);
  const burstContext = useMemo<BurstContext>(() => ({
    beamEnabled,
    beamSource,
    reducedMotion,
  }), [beamEnabled, beamSource, reducedMotion]);
  const [burstState, setBurstState] = useState<BurstState>(() => ({
    context: burstContext,
    records: [],
  }));
  const burstRecords = burstState.context === burstContext ? burstState.records : [];
  const updateBurstRecords = useCallback((
    update: (current: BurstRecord[]) => BurstRecord[],
  ) => {
    setBurstState((current) => ({
      context: burstContext,
      records: update(current.context === burstContext ? current.records : []),
    }));
  }, [burstContext]);
  const onArrival = useCallback(({ arrival, generation, runId }: FlowLayer3DArrivalEvent) => {
    if (!beamEnabled || reducedMotion) return;
    const key = `${runId}:${generation}:${arrival.id}`;
    updateBurstRecords((current) => current.some((record) => record.key === key)
      ? current
      : [...current, { key, point: arrival.point }]);
  }, [beamEnabled, reducedMotion, updateBurstRecords]);
  const finishBurst = useCallback((key: string) => {
    updateBurstRecords((current) => current.filter((record) => record.key !== key));
  }, [updateBurstRecords]);
  const rootClassName = [styles.root, !beamEnabled && styles.motionDisabled, className]
    .filter(Boolean)
    .join(' ');
  const style: IllustrationStyle = {
    '--pillars-color': color,
    '--pillars-grid-color': gridColor,
    '--pillars-grid-density': `${gridDensity}px`,
    '--pillars-grid-opacity': String(gridOpacity),
    '--pillars-height': cssSize(height),
    '--pillars-icon-size': `${iconSize}px`,
    '--pillars-width': cssSize(width),
  };
  const resolvedBurstFadeTime = Math.max(1, burstFadeTime);
  const burstStyle: BurstStyle = {
    '--burst-color': beamColor,
    '--burst-core-fade-time': `${resolvedBurstFadeTime * (640 / 920)}ms`,
    '--burst-fade-time': `${resolvedBurstFadeTime}ms`,
    '--burst-highlight': beamHighlightColor,
    '--burst-radius': `${Math.max(0, burstRadius)}px`,
    '--burst-strength': String(Math.max(0, burstStrength)),
  };

  return (
    <section className={rootClassName} style={style} aria-label="Vertical business flow">
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        className={styles.flowLayer}
        connector={connector}
        onArrival={onArrival}
        paths={paths}
        reducedMotion={reducedMotion}
      />
      <div className={styles.burstLayer} aria-hidden="true">
        {burstRecords.map((record) => (
          <span
            className={styles.nodeBurst}
            data-testid="arrival-burst"
            key={record.key}
            style={{
              ...burstStyle,
              left: `${record.point[0] * 100}%`,
              top: `${record.point[1] * 100}%`,
            }}
          >
            <span
              className={styles.nodeBurstGlow}
              onAnimationEnd={() => finishBurst(record.key)}
            />
            <span className={styles.nodeBurstCore} />
          </span>
        ))}
      </div>
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
