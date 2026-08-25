import {
  PillarIcon,
  PillarSurroundingIcon,
  type PillarIconName,
  type PillarSurroundingIconName,
} from '@/features/business-flow-vertical';
import type { CSSProperties } from 'react';
import styles from './BusinessFlowHorizontal.module.css';

type FlowRoute = {
  d: string;
  delay: number;
  id: string;
  short?: boolean;
};

type FlowNode = {
  delay: number;
  icon: PillarIconName | PillarSurroundingIconName;
  id: string;
  kind: 'collector' | 'relay' | 'terminal';
  x: number;
  y: number;
};

const routes: FlowRoute[] = [
  { id: 'aux-top', d: 'M 324 244 C 302 244 302 282 282 282', delay: 0, short: true },
  { id: 'aux-middle', d: 'M 324 304 L 282 304', delay: 0.1, short: true },
  { id: 'aux-bottom', d: 'M 324 364 C 302 364 302 326 282 326', delay: 0.2, short: true },
  { id: 'collector-relay-top', d: 'M 214 282 C 190 282 194 107 170 107', delay: 0.72 },
  { id: 'collector-relay-middle', d: 'M 214 304 L 170 304', delay: 0.78, short: true },
  { id: 'collector-relay-bottom', d: 'M 214 326 C 190 326 194 501 170 501', delay: 0.84 },
  { id: 'relay-top-terminal-1', d: 'M 116 92 C 90 92 86 59 58 59', delay: 1.72 },
  { id: 'relay-top-terminal-2', d: 'M 116 122 C 90 122 86 155 58 155', delay: 1.8 },
  { id: 'relay-middle-terminal-1', d: 'M 116 289 C 90 289 86 251 58 251', delay: 1.76 },
  { id: 'relay-middle-terminal-2', d: 'M 116 319 C 90 319 86 357 58 357', delay: 1.84 },
  { id: 'relay-bottom-terminal-1', d: 'M 116 486 C 90 486 86 453 58 453', delay: 1.8 },
  { id: 'relay-bottom-terminal-2', d: 'M 116 516 C 90 516 86 549 58 549', delay: 1.88 },
];

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
  '--camera-connector': string;
  '--camera-connector-opacity': string;
  '--camera-connector-width': string;
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
  const rootClassName = [
    styles.root,
    !beamEnabled && styles.motionDisabled,
    className,
  ].filter(Boolean).join(' ');
  const style: IllustrationStyle = {
    '--camera-beam': beamColor,
    '--camera-beam-highlight': beamHighlightColor,
    '--camera-color': color,
    '--camera-connector': connectorColor,
    '--camera-connector-opacity': String(connectorOpacity),
    '--camera-connector-width': String(connectorWidth),
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
      <svg
        className={styles.diagram}
        viewBox="0 0 320 608"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <g className={styles.connectors}>
          {routes.map((route) => (
            <path key={route.id} d={route.d} pathLength="100" />
          ))}
        </g>

        <g className={styles.beams}>
          {routes.map((route) => {
            const delay = route.delay / resolvedSpeed;
            const timedStyle: PositionedStyle = {
              '--camera-delay': `${delay}s`,
            };
            const motionWindow = route.short ? 0.12 : 0.2;

            return (
              <g key={route.id}>
                <path
                  className={route.short ? styles.beamShortTrail : styles.beamTrail}
                  d={route.d}
                  pathLength="100"
                  style={timedStyle}
                />
                <path
                  className={route.short ? styles.beamShortCore : styles.beamCore}
                  d={route.d}
                  pathLength="100"
                  style={timedStyle}
                />
                <g
                  className={route.short ? styles.beamShortHead : styles.beamHead}
                  style={timedStyle}
                >
                  <circle className={styles.beamHeadHalo} r="9" />
                  <circle className={styles.beamHeadOrb} r="2.4" />
                  <animateMotion
                    begin={`${delay}s`}
                    calcMode="linear"
                    dur={`${cycleDuration}s`}
                    keyPoints="0;1;1"
                    keyTimes={`0;${motionWindow};1`}
                    path={route.d}
                    repeatCount="indefinite"
                  />
                </g>
              </g>
            );
          })}
        </g>
      </svg>

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
