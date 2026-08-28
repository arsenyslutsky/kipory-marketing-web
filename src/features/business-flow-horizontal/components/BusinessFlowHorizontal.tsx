'use client';

import {
  FlowLayer3D,
  type FlowLayer3DArrival,
  type FlowLayer3DArrivalEvent,
  type FlowLayer3DBeamSource,
  type FlowLayer3DNodeStyle,
} from '@/components/elements/FlowLayer3D';
import type { Node3DProgressMode } from '@/components/elements/Node3D';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBusinessFlowHorizontalNodes } from '../nodes';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
} from '../routes';
import styles from './BusinessFlowHorizontal.module.css';

export type BusinessFlowHorizontalProps = {
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
  centralIconFillColor?: string;
  centralIconStrokeOpacity?: number;
  className?: string;
  color?: string;
  connectorColor?: string;
  connectorOpacity?: number;
  connectorWidth?: number;
  gridColor?: string;
  gridDensity?: number;
  gridOpacity?: number;
  height?: CSSProperties['height'];
  iconSize?: number;
  maxConcurrentBeams?: number;
  nodeProgressMaxDelay?: number;
  nodeProgressMinDelay?: number;
  nodeProgressMode?: Node3DProgressMode;
  nodeProgressSize?: number;
  strokeWidth?: number;
  width?: CSSProperties['width'];
};

type IllustrationStyle = CSSProperties & {
  '--camera-color': string;
  '--camera-grid-color': string;
  '--camera-grid-density': string;
  '--camera-grid-opacity': string;
  '--camera-height': string;
  '--camera-width': string;
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

export function BusinessFlowHorizontal({
  auxiliaryIconFillColor = '#212121',
  beamColor = '#449c40',
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamHeadGlowBlur = 0,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 0,
  beamHighlightColor = '#c9ebc7',
  beamSpeed = 1.4,
  beamTrailLength = 0,
  burstFadeTime = 920,
  burstRadius = 32,
  burstStrength = 1,
  centralIconFillColor = '#1d281d',
  centralIconStrokeOpacity = 0.52,
  className,
  color = '#f3f5ef',
  connectorColor = '#ffffff',
  connectorOpacity = 0.22,
  connectorWidth = 1.25,
  gridColor = '#39473f',
  gridDensity = 30,
  gridOpacity = 0,
  height = '38rem',
  iconSize = 40,
  maxConcurrentBeams = 24,
  nodeProgressMaxDelay = 1800,
  nodeProgressMinDelay = 500,
  nodeProgressMode = 'outline',
  nodeProgressSize = 15,
  strokeWidth = 1.5,
  width = '20rem',
}: BusinessFlowHorizontalProps) {
  const reducedMotion = useReducedMotionPreference();
  const resolvedSpeed = Math.max(0.1, beamSpeed);
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
  const beamSource = useMemo(
    () => createBusinessFlowHorizontalBeamSource({
      emissionRandomness: beamEmissionRandomness,
      maxConcurrentBeams,
      speed: resolvedSpeed,
      trailLengthInIllustrationUnits: beamTrailLength,
    }),
    [beamEmissionRandomness, beamTrailLength, maxConcurrentBeams, resolvedSpeed],
  );
  const nodes = useMemo(() => createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: auxiliaryIconFillColor,
    centralIconColor: centralIconFillColor,
    centralIconStrokeOpacity,
    iconSize,
    iconStrokeColor: color,
    strokeWidth,
  }), [
    auxiliaryIconFillColor,
    centralIconFillColor,
    centralIconStrokeOpacity,
    color,
    iconSize,
    strokeWidth,
  ]);
  const nodeStyle = useMemo<FlowLayer3DNodeStyle>(() => ({
    assetBasePath: '/assets/nodes',
    frontGradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
    mode: 'dark',
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
    progressBarHeight: nodeProgressSize,
    progressMaxDelay: nodeProgressMaxDelay,
    progressMinDelay: nodeProgressMinDelay,
    progressMode: nodeProgressMode,
    progressPadding: 1,
    sideXGradient: { angle: 360, start: '#31775a', mid: '#10402e', end: '#5c899b' },
    sideZGradient: { angle: 177, start: '#427298', mid: '#366480', end: '#0e4b81' },
  }), [nodeProgressMaxDelay, nodeProgressMinDelay, nodeProgressMode, nodeProgressSize]);
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
  const rootClassName = [
    styles.root,
    !beamEnabled && styles.motionDisabled,
    className,
  ].filter(Boolean).join(' ');
  const style: IllustrationStyle = {
    '--camera-color': color,
    '--camera-grid-color': gridColor,
    '--camera-grid-density': `${gridDensity}px`,
    '--camera-grid-opacity': String(gridOpacity),
    '--camera-height': cssSize(height),
    '--camera-width': cssSize(width),
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
    <figure
      className={rootClassName}
      style={style}
      role="img"
      aria-label="Horizontal business flow entering from the right, passing through one collector and three relays, then reaching six terminal nodes"
    >
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        className={styles.flowLayer}
        connector={connector}
        nodes={nodes}
        nodeStyle={nodeStyle}
        onArrival={onArrival}
        paths={businessFlowHorizontalPaths}
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
    </figure>
  );
}
