import {
  PillarIcon,
  PillarSurroundingIcon,
  type PillarIconName,
  type PillarSurroundingIconName,
} from '@/features/business-flow-vertical';
import { FlowLayer3D } from '@/components/elements/FlowLayer3D';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
} from '../routes';
import styles from './BusinessFlowHorizontal.module.css';

type FlowNode = {
  delay: number;
  icon: PillarIconName | PillarSurroundingIconName;
  id: string;
  kind: 'collector' | 'relay' | 'terminal';
  x: number;
  y: number;
};

const nodes: FlowNode[] = [
  { id: 'terminal-1', kind: 'terminal', icon: 'download', x: 37, y: 59, delay: 2.68 },
  { id: 'terminal-2', kind: 'terminal', icon: 'profile', x: 37, y: 155, delay: 2.76 },
  { id: 'terminal-3', kind: 'terminal', icon: 'profile-alt', x: 37, y: 251, delay: 2.72 },
  { id: 'terminal-4', kind: 'terminal', icon: 'download', x: 37, y: 357, delay: 2.8 },
  { id: 'terminal-5', kind: 'terminal', icon: 'profile', x: 37, y: 453, delay: 2.76 },
  { id: 'terminal-6', kind: 'terminal', icon: 'profile-alt', x: 37, y: 549, delay: 2.84 },
  { id: 'relay-1', kind: 'relay', icon: 'server', x: 143, y: 107, delay: 1.68 },
  { id: 'relay-2', kind: 'relay', icon: 'graph', x: 143, y: 304, delay: 1.74 },
  { id: 'relay-3', kind: 'relay', icon: 'vector', x: 143, y: 501, delay: 1.8 },
  { id: 'collector', kind: 'collector', icon: 'intelligence', x: 248, y: 304, delay: 0.68 },
];

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
  '--camera-icon-size': string;
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

function nodePosition(node: FlowNode, resolvedSpeed: number): PositionedStyle {
  return {
    '--camera-delay': `${node.delay / resolvedSpeed}s`,
    '--camera-x': `${(node.x / 320) * 100}%`,
    '--camera-y': `${(node.y / 608) * 100}%`,
  };
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
  strokeWidth = 1.5,
  width = '20rem',
}: BusinessFlowHorizontalProps) {
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
    '--camera-icon-size': `${iconSize}px`,
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
        paths={businessFlowHorizontalPaths}
      />

      <div className={styles.burstLayer} aria-hidden="true">
        {nodes.map((node) => (
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

      <div className={styles.iconLayer} aria-hidden="true">
        {nodes.map((node) => (
          <span
            className={`${styles.iconNode} ${styles[`${node.kind}Node`]}`}
            key={node.id}
            style={nodePosition(node, resolvedSpeed)}
          >
            {node.kind === 'terminal' ? (
              <PillarSurroundingIcon
                className={styles.surroundingIcon}
                fill={auxiliaryIconFillColor}
                name={node.icon as PillarSurroundingIconName}
                strokeWidth={strokeWidth / 4}
              />
            ) : (
              <PillarIcon
                className={styles.pillarIcon}
                fillColor={centralIconFillColor}
                fillMode="black"
                name={node.icon as PillarIconName}
                strokeOpacity={centralIconStrokeOpacity}
                strokeWidth={strokeWidth}
              />
            )}
          </span>
        ))}
      </div>
    </figure>
  );
}
