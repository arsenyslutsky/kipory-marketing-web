'use client';

import {
  FlowLayer3D,
  type FlowLayer3DArrival,
  type FlowLayer3DArrivalEvent,
  type FlowLayer3DBeamSource,
  type FlowLayer3DNodeStyle,
} from '@/components/elements/FlowLayer3D';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  businessFlowVerticalCentralNodes,
  createBusinessFlowVerticalNodes,
  createBusinessFlowVerticalSatellites,
} from '../nodes';
import {
  createBusinessFlowVerticalBeamSource,
  createBusinessFlowVerticalPaths,
  type PillarPoint,
} from '../routes';
import type { PillarIconFillMode } from './PillarIcon';
import styles from './BusinessFlowVertical.module.css';

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
  '--pillars-width': string;
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
  const satellites = useMemo(
    () => createBusinessFlowVerticalSatellites(
      numberOfNodesTop,
      numberOfNodesBottom,
      auxiliaryNodeSpacing,
    ),
    [auxiliaryNodeSpacing, numberOfNodesBottom, numberOfNodesTop],
  );
  const satellitePoints = useMemo(
    () => satellites.map(({ x, y }) => [x, y] as PillarPoint),
    [satellites],
  );
  const gradient = useMemo(() => ({
    angle: 117,
    start: gradientStartColor,
    mid: gradientMidColor,
    end: gradientEndColor,
  }), [gradientEndColor, gradientMidColor, gradientStartColor]);
  const nodes = useMemo(() => createBusinessFlowVerticalNodes({
    auxiliaryIconColor: auxiliaryIconFillColor,
    centralIconColor: centralIconFillColor,
    centralIconFillMode,
    centralIconStrokeOpacity,
    gradient,
    iconSize,
    satellites,
    strokeWidth,
  }), [
    auxiliaryIconFillColor,
    centralIconFillColor,
    centralIconFillMode,
    centralIconStrokeOpacity,
    gradient,
    iconSize,
    satellites,
    strokeWidth,
  ]);
  const nodeStyle = useMemo<FlowLayer3DNodeStyle>(() => ({
    assetBasePath: '/assets/nodes',
    frontGradient: gradient,
    mode: 'dark',
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
    progressBarHeight: 15,
    progressMode: 'outline',
    progressPadding: 1,
    sideXGradient: { angle: 360, start: '#31775a', mid: '#10402e', end: '#5c899b' },
    sideZGradient: { angle: 177, start: '#427298', mid: '#366480', end: '#0e4b81' },
  }), [gradient]);
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
        nodes={nodes}
        nodeStyle={nodeStyle}
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
      <ul className={styles.semanticList} aria-label="Central flow nodes">
        {businessFlowVerticalCentralNodes.map(({ id, label }) => (
          <li key={id}>{label}</li>
        ))}
      </ul>
    </section>
  );
}
