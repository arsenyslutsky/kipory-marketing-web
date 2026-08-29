'use client';

import {
  FlowLayer3D,
  type FlowLayer3DArrivalEvent,
  type FlowLayer3DNodeStyle,
} from '@/components/elements/FlowLayer3D';
import type { Node3DProgressMode } from '@/components/elements/Node3D';
import type { WorkflowRuntimeOptions } from '@/components/elements/workflow-runtime';
import {
  WorkflowArrivalBursts,
  type WorkflowArrivalBurstsHandle,
} from '@/components/elements/WorkflowArrivalBursts';
import { businessFlowPalette } from '@/features/business-flow-palette';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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

export type BusinessFlowVerticalProps = WorkflowRuntimeOptions & {
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
  nodeProgressMaxDelay?: number;
  nodeProgressMinDelay?: number;
  nodeProgressMode?: Node3DProgressMode;
  nodeProgressSize?: number;
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
  activityStrategy,
  auxiliaryIconFillColor = businessFlowPalette.black,
  beamColor = businessFlowPalette.beam,
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamHeadGlowBlur = 0,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 0,
  beamHighlightColor = businessFlowPalette.beamHighlight,
  beamSpeed = 1,
  beamTrailLength = 0,
  burstFadeTime = 920,
  burstRadius = 32,
  burstStrength = 1,
  className,
  color = businessFlowPalette.iconStroke,
  centralIconFillColor = businessFlowPalette.black,
  centralIconFillMode = 'gradient',
  centralIconStrokeOpacity = 1,
  connectorColor = businessFlowPalette.connector,
  connectorOpacity = 0.62,
  connectorRadius = 1.75,
  connectorWidth = 1.25,
  gradientEndColor = businessFlowPalette.frontGradient.end,
  gradientMidColor = businessFlowPalette.frontGradient.mid,
  gradientStartColor = businessFlowPalette.frontGradient.start,
  gridColor = businessFlowPalette.grid,
  gridDensity = 30,
  gridOpacity = 0.2,
  height = '38rem',
  iconSize = 40,
  loadStrategy,
  maxConcurrentBeams = 24,
  numberOfNodesBottom = 10,
  numberOfNodesTop = 10,
  nodeProgressMaxDelay = 1800,
  nodeProgressMinDelay = 500,
  nodeProgressMode = 'outline',
  nodeProgressSize = 15,
  preloadMargin,
  resolutionScale,
  auxiliaryNodeSpacing = 1,
  showContinuationConnectors = false,
  strokeWidth = 5,
  width = '20rem',
}: BusinessFlowVerticalProps) {
  const reducedMotion = useReducedMotionPreference();
  const burstRef = useRef<WorkflowArrivalBurstsHandle>(null);
  const [flowActive, setFlowActive] = useState(false);
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
    iconStrokeColor: color,
    satellites,
    strokeWidth,
  }), [
    auxiliaryIconFillColor,
    centralIconFillColor,
    centralIconFillMode,
    centralIconStrokeOpacity,
    color,
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
    progressBarHeight: nodeProgressSize,
    progressMaxDelay: nodeProgressMaxDelay,
    progressMinDelay: nodeProgressMinDelay,
    progressMode: nodeProgressMode,
    progressPadding: 1,
    sideXGradient: { angle: 360, ...businessFlowPalette.sideXGradient },
    sideZGradient: { angle: 177, ...businessFlowPalette.sideZGradient },
  }), [
    gradient,
    nodeProgressMaxDelay,
    nodeProgressMinDelay,
    nodeProgressMode,
    nodeProgressSize,
  ]);
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
  const onArrival = useCallback((event: FlowLayer3DArrivalEvent) => {
    burstRef.current?.add(event);
  }, []);
  const onActivityChange = useCallback((active: boolean) => {
    setFlowActive(active);
    if (!active) burstRef.current?.clear();
  }, []);
  useEffect(() => {
    if (!beamEnabled || reducedMotion) burstRef.current?.clear();
  }, [beamEnabled, reducedMotion]);
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
  return (
    <section className={rootClassName} style={style} aria-label="Vertical business flow">
      <FlowLayer3D
        activityStrategy={activityStrategy}
        beam={beam}
        beamSource={beamSource}
        className={styles.flowLayer}
        connector={connector}
        loadStrategy={loadStrategy}
        nodes={nodes}
        nodeStyle={nodeStyle}
        onActivityChange={onActivityChange}
        onArrival={onArrival}
        paths={paths}
        preloadMargin={preloadMargin}
        reducedMotion={reducedMotion}
        resolutionScale={resolutionScale}
      />
      <WorkflowArrivalBursts
        ref={burstRef}
        active={flowActive && beamEnabled}
        color={beamColor}
        fadeTime={burstFadeTime}
        highlight={beamHighlightColor}
        radius={burstRadius}
        reducedMotion={reducedMotion}
        resetKey={beamSource}
        strength={burstStrength}
      />
      <ul className={styles.semanticList} aria-label="Central flow nodes">
        {businessFlowVerticalCentralNodes.map(({ id, label }) => (
          <li key={id}>{label}</li>
        ))}
      </ul>
    </section>
  );
}
