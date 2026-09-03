'use client';

import {
  FlowLayer3D,
  type FlowLayer3DArrivalEvent,
  type FlowLayer3DNodeStyle,
  type NodeShadowProps,
} from '@/components/elements/FlowLayer3D';
import type { Connector3DStroke } from '@/components/elements/Connector3D/types';
import type { Node3DProgressMode } from '@/components/elements/Node3D';
import type { WorkflowRuntimeOptions } from '@/components/elements/workflow-runtime';
import {
  WorkflowArrivalBursts,
  type WorkflowArrivalBurstsHandle,
} from '@/components/elements/WorkflowArrivalBursts';
import { getBusinessFlowPalette } from '@/features/business-flow-palette';
import { useResolvedTheme } from '@/theme/ThemeProvider';
import type { ResolvedTheme } from '@/theme/theme';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBusinessCoreNodeFlowLayoutNodes,
  createBusinessCoreNodeFlowNodes,
  resolveBusinessCoreNodeFlowConnectionCount,
  type BusinessCoreNodeFlowAuxiliaryIcon,
  type BusinessCoreNodeFlowIcon,
} from '../nodes';
import {
  createBusinessCoreNodeFlowBeamSource,
  createBusinessCoreNodeFlowPaths,
} from '../routes';
import styles from './BusinessCoreNodeFlow.module.css';

export type BusinessCoreNodeFlowProps = WorkflowRuntimeOptions & NodeShadowProps & {
  auxiliaryIcon?: BusinessCoreNodeFlowAuxiliaryIcon;
  auxiliaryIconFillColor?: string;
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
  centralIcon?: BusinessCoreNodeFlowIcon;
  centralIconFillColor?: string;
  centralIconStrokeOpacity?: number;
  className?: string;
  color?: string;
  connectorColor?: string;
  connectorOpacity?: number;
  connectorStroke?: Connector3DStroke;
  connectorWidth?: number;
  gridColor?: string;
  gridDensity?: number;
  gridOpacity?: number;
  iconSize?: number;
  maxConcurrentBeams?: number;
  mode?: ResolvedTheme;
  nodeProgressMaxDelay?: number;
  nodeProgressMinDelay?: number;
  nodeProgressMode?: Node3DProgressMode;
  nodeProgressSize?: number;
  numberOfAuxiliaryConnections?: number;
  showAuxiliaryNodes?: boolean;
  size?: CSSProperties['width'];
  strokeWidth?: number;
};

type IllustrationStyle = CSSProperties & {
  '--camera-color': string;
  '--camera-grid-color': string;
  '--camera-grid-density': string;
  '--camera-grid-opacity': string;
  '--camera-size': string;
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

export function BusinessCoreNodeFlow({
  activityStrategy,
  auxiliaryIcon = 'mixed',
  auxiliaryIconFillColor: auxiliaryIconFillColorProp,
  beamColor: beamColorProp,
  beamEmissionRandomness = 100,
  beamEnabled = true,
  beamGlowIntensity = 1,
  beamHeadGlowBlur = 2,
  beamHeadGlowOpacity = 1,
  beamHeadGlowRadius = 11,
  beamHighlightColor: beamHighlightColorProp,
  beamSpeed = 1.4,
  beamTrailLength = 135,
  beamWidth = 1.4,
  burstFadeTime = 900,
  burstRadius = 24,
  burstStrength = 0.5,
  centralIcon = 'intelligence',
  centralIconFillColor: centralIconFillColorProp,
  centralIconStrokeOpacity = 1,
  className,
  color: colorProp,
  connectorColor: connectorColorProp,
  connectorOpacity = 0.8,
  connectorStroke = 'dashed',
  connectorWidth = 1,
  gridColor: gridColorProp,
  gridDensity = 30,
  gridOpacity = 0,
  iconSize = 44,
  loadStrategy,
  maxConcurrentBeams = 6,
  mode: explicitMode,
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
  numberOfAuxiliaryConnections = 12,
  preloadMargin,
  resolutionScale,
  showAuxiliaryNodes = true,
  size = 'min(42rem, 90vw)',
  strokeWidth = 2.25,
}: BusinessCoreNodeFlowProps) {
  const mode = useResolvedTheme(explicitMode);
  const palette = getBusinessFlowPalette(mode);
  const auxiliaryIconFillColor = auxiliaryIconFillColorProp ?? palette.horizontalAuxiliaryIconFill;
  const beamColor = beamColorProp ?? palette.beam;
  const beamHighlightColor = beamHighlightColorProp ?? palette.beamHighlight;
  const centralIconFillColor = centralIconFillColorProp ?? palette.horizontalCentralIconFill;
  const color = colorProp ?? palette.horizontalIconStroke;
  const connectorColor = connectorColorProp ?? palette.connector;
  const gridColor = gridColorProp ?? palette.grid;
  const reducedMotion = useReducedMotionPreference();
  const burstRef = useRef<WorkflowArrivalBurstsHandle>(null);
  const [flowActive, setFlowActive] = useState(false);
  const connectionCount = resolveBusinessCoreNodeFlowConnectionCount(numberOfAuxiliaryConnections);
  const paths = useMemo(
    () => createBusinessCoreNodeFlowPaths(connectionCount),
    [connectionCount],
  );
  const layoutNodes = useMemo(
    () => createBusinessCoreNodeFlowLayoutNodes(
      connectionCount,
      showAuxiliaryNodes,
      centralIcon,
      auxiliaryIcon,
    ),
    [auxiliaryIcon, centralIcon, connectionCount, showAuxiliaryNodes],
  );
  const nodes = useMemo(() => createBusinessCoreNodeFlowNodes({
    auxiliaryIconColor: auxiliaryIconFillColor,
    centralIconColor: centralIconFillColor,
    centralIconStrokeOpacity,
    iconSize,
    iconStrokeColor: color,
    layoutNodes,
    strokeWidth,
  }), [
    auxiliaryIconFillColor,
    centralIconFillColor,
    centralIconStrokeOpacity,
    color,
    iconSize,
    layoutNodes,
    strokeWidth,
  ]);
  const connector = useMemo(() => ({
    color: connectorColor,
    opacity: connectorOpacity,
    stroke: connectorStroke,
    width: connectorWidth,
  }), [connectorColor, connectorOpacity, connectorStroke, connectorWidth]);
  const beam = useMemo(() => ({
    beamColor,
    beamHighlightColor,
    beamWidth,
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
    beamWidth,
  ]);
  const beamSource = useMemo(() => createBusinessCoreNodeFlowBeamSource({
    emissionRandomness: beamEmissionRandomness,
    maxConcurrentBeams,
    paths,
    showAuxiliaryNodes,
    speed: Math.max(0.1, beamSpeed),
    trailLengthInIllustrationUnits: beamTrailLength,
  }), [
    beamEmissionRandomness,
    beamSpeed,
    beamTrailLength,
    maxConcurrentBeams,
    paths,
    showAuxiliaryNodes,
  ]);
  const nodeStyle = useMemo<FlowLayer3DNodeStyle>(() => ({
    mode,
    frontGradient: { angle: 117, ...palette.frontGradient },
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
  }), [mode, nodeProgressMaxDelay, nodeProgressMinDelay, nodeProgressMode, nodeProgressSize, palette]);
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

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const style: IllustrationStyle = {
    '--camera-color': color,
    '--camera-grid-color': gridColor,
    '--camera-grid-density': `${gridDensity}px`,
    '--camera-grid-opacity': String(gridOpacity),
    '--camera-size': cssSize(size),
  };

  return (
    <figure
      aria-label={`Business core node flow with ${connectionCount} outward auxiliary connections and ${showAuxiliaryNodes ? 'visible' : 'hidden'} auxiliary nodes`}
      className={rootClassName}
      role="img"
      style={style}
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
    </figure>
  );
}
