'use client';

import {
  FlowLayer3D,
  type FlowLayer3DNodeStyle,
} from '@/components/elements/FlowLayer3D';
import type { Node3DProgressMode } from '@/components/elements/Node3D';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  businessFlowHorizontalLayoutNodes,
  createBusinessFlowHorizontalNodes,
  type BusinessFlowHorizontalLayoutNode,
} from '../nodes';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
} from '../routes';
import styles from './BusinessFlowHorizontal.module.css';

export type BusinessFlowHorizontalProps = {
  auxiliaryIconFillColor?: string;
  beamColor?: string;
  beamEnabled?: boolean;
  beamHighlightColor?: string;
  beamSpeed?: number;
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
  nodeProgressMode?: Node3DProgressMode;
  strokeWidth?: number;
  width?: CSSProperties['width'];
};

type IllustrationStyle = CSSProperties & {
  '--camera-beam': string;
  '--camera-beam-highlight': string;
  '--camera-color': string;
  '--camera-flow-cycle': string;
  '--camera-grid-color': string;
  '--camera-grid-density': string;
  '--camera-grid-opacity': string;
  '--camera-height': string;
  '--camera-width': string;
};

type PositionedStyle = CSSProperties & {
  '--camera-delay': string;
  '--camera-x'?: string;
  '--camera-y'?: string;
};

function cssSize(value: CSSProperties['width']): string {
  if (typeof value === 'number') return `${value}px`;
  return value ?? 'auto';
}

function nodePosition(node: BusinessFlowHorizontalLayoutNode, resolvedSpeed: number): PositionedStyle {
  return {
    '--camera-delay': `${node.delay / resolvedSpeed}s`,
    '--camera-x': `${(node.x / 320) * 100}%`,
    '--camera-y': `${(node.y / 608) * 100}%`,
  };
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
  beamEnabled = true,
  beamHighlightColor = '#c9ebc7',
  beamSpeed = 1.4,
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
  nodeProgressMode = 'outline',
  strokeWidth = 1.5,
  width = '20rem',
}: BusinessFlowHorizontalProps) {
  const reducedMotion = useReducedMotionPreference();
  const resolvedSpeed = Math.max(0.1, beamSpeed);
  const cycleDuration = 5.2 / resolvedSpeed;
  const connector = useMemo(() => ({
    color: connectorColor,
    opacity: connectorOpacity,
    stroke: 'dashed' as const,
    width: connectorWidth,
  }), [connectorColor, connectorOpacity, connectorWidth]);
  const beam = useMemo(() => ({
    beamColor,
    beamHighlightColor,
    beamWidth: 1,
    enabled: beamEnabled,
    glowIntensity: 1,
    trailLength: 0.38,
  }), [beamColor, beamEnabled, beamHighlightColor]);
  const beamSource = useMemo(
    () => createBusinessFlowHorizontalBeamSource(resolvedSpeed),
    [resolvedSpeed],
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
    progressBarHeight: 15,
    progressMode: nodeProgressMode,
    progressPadding: 1,
    sideXGradient: { angle: 360, start: '#31775a', mid: '#10402e', end: '#5c899b' },
    sideZGradient: { angle: 177, start: '#427298', mid: '#366480', end: '#0e4b81' },
  }), [nodeProgressMode]);
  const rootClassName = [
    styles.root,
    !beamEnabled && styles.motionDisabled,
    className,
  ].filter(Boolean).join(' ');
  const style: IllustrationStyle = {
    '--camera-beam': beamColor,
    '--camera-beam-highlight': beamHighlightColor,
    '--camera-color': color,
    '--camera-flow-cycle': `${cycleDuration}s`,
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
      aria-label="Horizontal business flow entering from the right, passing through one collector and three relays, then reaching six terminal nodes"
    >
      <FlowLayer3D
        beam={beam}
        beamSource={beamSource}
        className={styles.flowLayer}
        connector={connector}
        nodes={nodes}
        nodeStyle={nodeStyle}
        paths={businessFlowHorizontalPaths}
        reducedMotion={reducedMotion}
      />

      <div className={styles.burstLayer} aria-hidden="true">
        {businessFlowHorizontalLayoutNodes.map((node) => (
          <span
            className={styles.nodeBurst}
            key={node.id}
            style={nodePosition(node, resolvedSpeed)}
          >
            <span className={styles.nodeBurstGlow} />
            <span className={styles.nodeBurstCore} />
          </span>
        ))}
      </div>
    </figure>
  );
}
