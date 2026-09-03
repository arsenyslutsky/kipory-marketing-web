'use client';

import {
  FlowLayer3D,
  type FlowLayer3DArrivalEvent,
  type FlowLayer3DNodeStyle,
  type NodeShadowProps,
} from '@/components/elements/FlowLayer3D';
import type { Node3DProgressMode } from '@/components/elements/Node3D';
import type { WorkflowRuntimeOptions } from '@/components/elements/workflow-runtime';
import {
  WorkflowArrivalBursts,
  type WorkflowArrivalBurstsHandle,
} from '@/components/elements/WorkflowArrivalBursts';
import { getBusinessFlowPalette } from '@/features/business-flow-palette';
import { useResolvedTheme } from '@/theme/ThemeProvider';
import type { ResolvedTheme } from '@/theme/theme';
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

export type BusinessFlowVerticalProps = WorkflowRuntimeOptions & NodeShadowProps & {
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
  mode?: ResolvedTheme;
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
  auxiliaryIconFillColor: auxiliaryIconFillColorProp,
  beamColor: beamColorProp,
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamHeadGlowBlur = 0,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 0,
  beamHighlightColor: beamHighlightColorProp,
  beamSpeed = 1,
  beamTrailLength = 0,
  burstFadeTime = 920,
  burstRadius = 32,
  burstStrength = 1,
  className,
  color: colorProp,
  centralIconFillColor: centralIconFillColorProp,
  centralIconFillMode = 'gradient',
  centralIconStrokeOpacity = 1,
  connectorColor: connectorColorProp,
  connectorOpacity = 0.62,
  connectorRadius = 1.75,
  connectorWidth = 1.25,
  gradientEndColor: gradientEndColorProp,
  gradientMidColor: gradientMidColorProp,
  gradientStartColor: gradientStartColorProp,
  gridColor: gridColorProp,
  gridDensity = 30,
  gridOpacity = 0.2,
  height = '38rem',
  iconSize = 40,
  loadStrategy,
  maxConcurrentBeams = 24,
  mode: explicitMode,
  numberOfNodesBottom = 10,
  numberOfNodesTop = 10,
  nodeProgressMaxDelay = 1800,
  nodeProgressMinDelay = 500,
  nodeProgressMode = 'outline',
  nodeProgressSize = 15,
  nodeShadowBias,
  nodeShadowBlurSamples,
  nodeShadowColor,
  nodeShadowLightX,
  nodeShadowLightY,
  nodeShadowLightZ,
  nodeShadowNormalBias,
  nodeShadowOpacity,
  nodeShadowRadius,
  preloadMargin,
  resolutionScale,
  auxiliaryNodeSpacing = 1,
  showContinuationConnectors = false,
  strokeWidth = 5,
  width = '20rem',
}: BusinessFlowVerticalProps) {
  const mode = useResolvedTheme(explicitMode);
  const palette = getBusinessFlowPalette(mode);
  const auxiliaryIconFillColor = auxiliaryIconFillColorProp ?? palette.auxiliaryIconFill;
  const beamColor = beamColorProp ?? palette.beam;
  const beamHighlightColor = beamHighlightColorProp ?? palette.beamHighlight;
  const centralIconFillColor = centralIconFillColorProp ?? palette.centralIconFill;
  const color = colorProp ?? palette.iconStroke;
  const connectorColor = connectorColorProp ?? palette.connector;
  const gradientEndColor = gradientEndColorProp ?? palette.frontGradient.end;
  const gradientMidColor = gradientMidColorProp ?? palette.frontGradient.mid;
  const gradientStartColor = gradientStartColorProp ?? palette.frontGradient.start;
  const gridColor = gridColorProp ?? palette.grid;
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
    mode,
    frontGradient: gradient,
    sideXGradient: { angle: 360, ...palette.sideXGradient },
    sideZGradient: { angle: 177, ...palette.sideZGradient },
    assetBasePath: '/assets/nodes',
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
    progressBarHeight: nodeProgressSize,
    progressMaxDelay: nodeProgressMaxDelay,
    progressMinDelay: nodeProgressMinDelay,
    progressMode: nodeProgressMode,
    progressPadding: 1,
  }), [
    mode,
    nodeProgressMaxDelay,
    nodeProgressMinDelay,
    nodeProgressMode,
    nodeProgressSize,
    palette,
    gradient,
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
        mode={mode}
        nodes={nodes}
        nodeStyle={nodeStyle}
        nodeShadowBias={nodeShadowBias}
        nodeShadowBlurSamples={nodeShadowBlurSamples}
        nodeShadowColor={nodeShadowColor}
        nodeShadowLightX={nodeShadowLightX}
        nodeShadowLightY={nodeShadowLightY}
        nodeShadowLightZ={nodeShadowLightZ}
        nodeShadowNormalBias={nodeShadowNormalBias}
        nodeShadowOpacity={nodeShadowOpacity}
        nodeShadowRadius={nodeShadowRadius}
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
