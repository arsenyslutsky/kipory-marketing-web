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
import {
  getBusinessFlowHeroTreatment,
  getBusinessFlowPalette,
} from '@/features/business-flow-palette';
import {
  resolveNodeAppearance,
  type NodeAppearanceProps,
} from '@/features/node-appearance';
import { useResolvedTheme } from '@/theme/ThemeProvider';
import type { ResolvedTheme } from '@/theme/theme';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBusinessFlowHorizontalLayoutNodes,
  createBusinessFlowHorizontalNodes,
} from '../nodes';
import {
  createBusinessFlowHorizontalBeamSource,
  createBusinessFlowHorizontalPaths,
} from '../routes';
import styles from './BusinessFlowHorizontal.module.css';

export type BusinessFlowHorizontalProps = WorkflowRuntimeOptions & NodeShadowProps & NodeAppearanceProps & {
  auxiliaryIconFillColor?: string;
  auxiliaryIconOpacity?: number;
  beamColor?: string;
  beamEmissionRandomness?: number;
  beamEnabled?: boolean;
  beamGlowIntensity?: number;
  beamHeadGlowBlur?: number;
  beamHeadGlowOpacity?: number;
  beamHeadGlowRadius?: number;
  beamHighlightColor?: string;
  beamSpeed?: number;
  beamTrailLength?: number;
  beamWidth?: number;
  burstFadeTime?: number;
  burstRadius?: number;
  burstStrength?: number;
  centralIconFillColor?: string;
  centralIconOpacity?: number;
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
  iconStrokeColor?: string;
  maxConcurrentBeams?: number;
  mode?: ResolvedTheme;
  numberOfNodesLeft?: number;
  numberOfNodesRight?: number;
  nodeProgressMaxDelay?: number;
  nodeProgressMinDelay?: number;
  nodeProgressMode?: Node3DProgressMode;
  nodeProgressSize?: number;
  outlineOpacity?: number;
  outlineWidth?: number;
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

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

function nodeCountLabel(count: number) {
  return `${count} ${count === 1 ? 'node' : 'nodes'}`;
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
  activityStrategy,
  auxiliaryIconFillColor: auxiliaryIconFillColorProp,
  auxiliaryIconOpacity = 0.72,
  beamColor: beamColorProp,
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamGlowIntensity = 1,
  beamHeadGlowBlur = 0,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 0,
  beamHighlightColor: beamHighlightColorProp,
  beamSpeed = 1.4,
  beamTrailLength = 0,
  beamWidth: beamWidthProp,
  burstFadeTime = 920,
  burstRadius = 32,
  burstStrength = 1,
  centralIconFillColor: centralIconFillColorProp,
  centralIconOpacity = 1,
  centralIconStrokeOpacity = 0.52,
  className,
  color: colorProp,
  connectorColor: connectorColorProp,
  connectorOpacity = 0.22,
  connectorWidth = 1.25,
  gridColor: gridColorProp,
  gridDensity = 30,
  gridOpacity = 0,
  height = '38rem',
  iconSize = 40,
  iconStrokeColor: iconStrokeColorProp,
  loadStrategy,
  maxConcurrentBeams = 24,
  mode: explicitMode,
  numberOfNodesLeft = 6,
  numberOfNodesRight = 3,
  nodeBodyColor,
  nodeFrontGradientAngle,
  nodeFrontGradientEndColor,
  nodeFrontGradientMidColor,
  nodeFrontGradientStartColor,
  nodeProgressMaxDelay = 1800,
  nodeProgressMinDelay = 500,
  nodeProgressMode = 'outline',
  nodeProgressSize = 15,
  nodeSideXGradientAngle,
  nodeSideXGradientEndColor,
  nodeSideXGradientMidColor,
  nodeSideXGradientStartColor,
  nodeSideZGradientAngle,
  nodeSideZGradientEndColor,
  nodeSideZGradientMidColor,
  nodeSideZGradientStartColor,
  outlineOpacity,
  outlineWidth,
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
  strokeWidth = 1.5,
  width = '20rem',
}: BusinessFlowHorizontalProps) {
  const mode = useResolvedTheme(explicitMode);
  const palette = getBusinessFlowPalette(mode);
  const heroTreatment = getBusinessFlowHeroTreatment(mode);
  const auxiliaryIconFillColor = auxiliaryIconFillColorProp ?? heroTreatment.iconFill;
  const beamColor = beamColorProp ?? palette.beam;
  const beamHighlightColor = beamHighlightColorProp ?? palette.beamHighlight;
  const centralIconFillColor = centralIconFillColorProp ?? heroTreatment.iconFill;
  const iconStrokeColor = iconStrokeColorProp ?? colorProp ?? heroTreatment.iconStroke;
  const connectorColor = connectorColorProp ?? heroTreatment.connectorColor;
  const gridColor = gridColorProp ?? palette.grid;
  const nodeAppearance = useMemo(() => resolveNodeAppearance({
    nodeBodyColor,
    nodeFrontGradientAngle,
    nodeFrontGradientEndColor,
    nodeFrontGradientMidColor,
    nodeFrontGradientStartColor,
    nodeSideXGradientAngle,
    nodeSideXGradientEndColor,
    nodeSideXGradientMidColor,
    nodeSideXGradientStartColor,
    nodeSideZGradientAngle,
    nodeSideZGradientEndColor,
    nodeSideZGradientMidColor,
    nodeSideZGradientStartColor,
  }, {
    bodyColor: palette.nodeBody,
    frontGradient: { angle: 117, ...heroTreatment.frontGradient },
    sideXGradient: { angle: 360, ...heroTreatment.sideXGradient },
    sideZGradient: { angle: 177, ...heroTreatment.sideZGradient },
  }), [
    heroTreatment,
    nodeBodyColor,
    nodeFrontGradientAngle,
    nodeFrontGradientEndColor,
    nodeFrontGradientMidColor,
    nodeFrontGradientStartColor,
    nodeSideXGradientAngle,
    nodeSideXGradientEndColor,
    nodeSideXGradientMidColor,
    nodeSideXGradientStartColor,
    nodeSideZGradientAngle,
    nodeSideZGradientEndColor,
    nodeSideZGradientMidColor,
    nodeSideZGradientStartColor,
    palette.nodeBody,
  ]);
  const reducedMotion = useReducedMotionPreference();
  const burstRef = useRef<WorkflowArrivalBurstsHandle>(null);
  const [flowActive, setFlowActive] = useState(false);
  const resolvedSpeed = Math.max(0.1, beamSpeed);
  const layoutNodes = useMemo(
    () => createBusinessFlowHorizontalLayoutNodes(numberOfNodesLeft, numberOfNodesRight),
    [numberOfNodesLeft, numberOfNodesRight],
  );
  const paths = useMemo(
    () => createBusinessFlowHorizontalPaths(layoutNodes),
    [layoutNodes],
  );
  const resolvedLeftNodeCount = layoutNodes.filter((node) => node.id.startsWith('left-')).length;
  const resolvedRightNodeCount = layoutNodes.filter((node) => node.id.startsWith('right-')).length;
  const connector = useMemo(() => ({
    color: connectorColor,
    opacity: connectorOpacity,
    stroke: heroTreatment.connectorStroke,
    width: connectorWidth,
  }), [connectorColor, connectorOpacity, connectorWidth, heroTreatment]);
  const beam = useMemo(() => ({
    beamColor,
    beamHighlightColor,
    beamWidth: beamWidthProp ?? Math.max(1.25, connectorWidth * 1.4),
    enabled: beamEnabled,
    glowIntensity: beamGlowIntensity,
    headGlowBlur: beamHeadGlowBlur,
    headGlowOpacity: beamHeadGlowOpacity,
    headGlowRadius: beamHeadGlowRadius,
    trailLength: 0,
  }), [
    beamColor,
    beamEnabled,
    beamGlowIntensity,
    beamHeadGlowBlur,
    beamHeadGlowOpacity,
    beamHeadGlowRadius,
    beamHighlightColor,
    beamWidthProp,
    connectorWidth,
  ]);
  const beamSource = useMemo(
    () => createBusinessFlowHorizontalBeamSource({
      emissionRandomness: beamEmissionRandomness,
      layoutNodes,
      maxConcurrentBeams,
      paths,
      speed: resolvedSpeed,
      trailLengthInPixels: beamTrailLength,
    }),
    [beamEmissionRandomness, beamTrailLength, layoutNodes, maxConcurrentBeams, paths, resolvedSpeed],
  );
  const nodes = useMemo(() => createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: auxiliaryIconFillColor,
    auxiliaryIconOpacity,
    centralIconColor: centralIconFillColor,
    centralIconOpacity,
    centralIconStrokeOpacity,
    iconSize,
    iconStrokeColor,
    layoutNodes,
    strokeWidth,
  }), [
    auxiliaryIconFillColor,
    auxiliaryIconOpacity,
    centralIconFillColor,
    centralIconOpacity,
    centralIconStrokeOpacity,
    iconStrokeColor,
    iconSize,
    layoutNodes,
    strokeWidth,
  ]);
  const nodeStyle = useMemo<FlowLayer3DNodeStyle>(() => ({
    mode,
    ...nodeAppearance,
    assetBasePath: '/assets/nodes',
    nodeCornerRadius: heroTreatment.nodeCornerRadius,
    outlineOpacity: outlineOpacity ?? heroTreatment.outlineOpacity,
    outlineWidth: outlineWidth ?? heroTreatment.outlineWidth,
    progressBarHeight: nodeProgressSize,
    progressMaxDelay: nodeProgressMaxDelay,
    progressMinDelay: nodeProgressMinDelay,
    progressMode: nodeProgressMode,
    progressPadding: 1,
  }), [heroTreatment, mode, nodeAppearance, nodeProgressMaxDelay, nodeProgressMinDelay, nodeProgressMode, nodeProgressSize, outlineOpacity, outlineWidth]);
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
  const rootClassName = [
    styles.root,
    !beamEnabled && styles.motionDisabled,
    className,
  ].filter(Boolean).join(' ');
  const style: IllustrationStyle = {
    '--camera-color': iconStrokeColor,
    '--camera-grid-color': gridColor,
    '--camera-grid-density': `${gridDensity}px`,
    '--camera-grid-opacity': String(gridOpacity),
    '--camera-height': cssSize(height),
    '--camera-width': cssSize(width),
  };
  return (
    <figure
      className={rootClassName}
      style={style}
      role="img"
      aria-label={`Horizontal business flow with ${nodeCountLabel(resolvedRightNodeCount)} on the right, one collector, three relays, and ${nodeCountLabel(resolvedLeftNodeCount)} on the left`}
    >
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
        nodeShadowLightX={nodeShadowLightX ?? heroTreatment.nodeShadowLightX}
        nodeShadowLightY={nodeShadowLightY ?? heroTreatment.nodeShadowLightY}
        nodeShadowLightZ={nodeShadowLightZ ?? heroTreatment.nodeShadowLightZ}
        nodeShadowNormalBias={nodeShadowNormalBias}
        nodeShadowOpacity={nodeShadowOpacity ?? heroTreatment.nodeShadowOpacity}
        nodeShadowRadius={nodeShadowRadius ?? heroTreatment.nodeShadowRadius}
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
    </figure>
  );
}
