'use client';

import { useCallback, useId, useState, type CSSProperties } from 'react';
import styles from './PillarsIllustration.module.css';

export type PillarPoint = readonly [x: number, y: number];

export type PillarsConnectorsProps = {
  beamColor?: string;
  beamEnabled?: boolean;
  beamHighlightColor?: string;
  beamSpeed?: number;
  color?: string;
  connectorRadius?: number;
  maxConcurrentBeams?: number;
  opacity?: number;
  satellitePoints: PillarPoint[];
  width?: number;
};

type BeamStyle = CSSProperties & {
  '--beam-delay': string;
  '--beam-duration': string;
};

type CentralNode = keyof typeof coloredPoints;

type BeamTrace = {
  direction: -1 | 1;
  sourceIndex: number;
  targetIndex: number;
};

const coloredPoints = {
  server: [50, 38] as PillarPoint,
  graph: [29, 50] as PillarPoint,
  vector: [71, 50] as PillarPoint,
  intelligence: [50, 62] as PillarPoint,
};

const coloredRoutes: PillarPoint[][] = [
  [[47, 40], [41, 40], [41, 47], [32, 47], [32, 49]],
  [[53, 40], [59, 40], [59, 47], [68, 47], [68, 49]],
  [[32, 51], [39, 51], [39, 59], [47, 59], [47, 60]],
  [[68, 51], [61, 51], [61, 59], [53, 59], [53, 60]],
];

const centralCycle: CentralNode[] = ['server', 'graph', 'intelligence', 'vector'];

function distance(a: PillarPoint, b: PillarPoint) {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

function moveToward(from: PillarPoint, to: PillarPoint, amount: number): PillarPoint {
  const length = distance(from, to);
  if (length === 0) return from;
  return [
    from[0] + ((to[0] - from[0]) / length) * amount,
    from[1] + ((to[1] - from[1]) / length) * amount,
  ];
}

function roundedPolylinePath(rawPoints: PillarPoint[], cornerRadius: number) {
  const points = rawPoints.filter((point, index) => (
    index === 0 || distance(point, rawPoints[index - 1]) > 0.001
  ));

  if (points.length === 2) {
    return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
  }

  const resolvedRadius = Math.max(0, cornerRadius);
  if (resolvedRadius === 0) {
    return points.slice(1).reduce(
      (path, point) => `${path} L ${point[0]} ${point[1]}`,
      `M ${points[0][0]} ${points[0][1]}`,
    );
  }

  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const radius = Math.min(
      resolvedRadius,
      distance(previous, current) / 2,
      distance(current, next) / 2,
    );
    const before = moveToward(current, previous, radius);
    const after = moveToward(current, next, radius);
    path += ` L ${before[0]} ${before[1]} Q ${current[0]} ${current[1]} ${after[0]} ${after[1]}`;
  }

  const last = points.at(-1)!;
  return `${path} L ${last[0]} ${last[1]}`;
}

function perimeterEdge(point: PillarPoint) {
  const distances = [point[1], 100 - point[0], 100 - point[1], point[0]];
  return distances.indexOf(Math.min(...distances));
}

function routeToSatellite(point: PillarPoint): PillarPoint[] {
  const edge = perimeterEdge(point);
  const normalizedX = Math.min(1, Math.max(0, (point[0] - 8) / 84));
  const normalizedY = Math.min(1, Math.max(0, (point[1] - 8) / 84));

  if (edge === 0) {
    const start: PillarPoint = [46 + normalizedX * 8, coloredPoints.server[1] - 2];
    const laneY = 18 + normalizedX * 10;
    return [start, [start[0], laneY], [point[0], laneY], [point[0], point[1] + 2.5]];
  }

  if (edge === 2) {
    const start: PillarPoint = [46 + normalizedX * 8, coloredPoints.intelligence[1] + 2];
    const laneY = 72 + normalizedX * 10;
    return [start, [start[0], laneY], [point[0], laneY], [point[0], point[1] - 2.5]];
  }

  if (edge === 3) {
    const start: PillarPoint = [coloredPoints.graph[0] - 3, 46 + normalizedY * 8];
    const laneX = 20 - normalizedY * 10;
    return [start, [laneX, start[1]], [laneX, point[1]], [point[0] + 2.5, point[1]]];
  }

  const start: PillarPoint = [coloredPoints.vector[0] + 3, 46 + normalizedY * 8];
  const laneX = 80 + normalizedY * 10;
  return [start, [laneX, start[1]], [laneX, point[1]], [point[0] - 2.5, point[1]]];
}

function satelliteParent(point: PillarPoint): CentralNode {
  const edge = perimeterEdge(point);
  if (edge === 0) return 'server';
  if (edge === 1) return 'vector';
  if (edge === 2) return 'intelligence';
  return 'graph';
}

function appendRoute(target: PillarPoint[], route: PillarPoint[]) {
  route.forEach((point) => {
    if (target.length === 0 || distance(target.at(-1)!, point) > 0.001) target.push(point);
  });
}

function routeBetweenCentralNodes(from: CentralNode, to: CentralNode): PillarPoint[] {
  const edgeIndex = (
    (from === 'server' && to === 'graph') || (from === 'graph' && to === 'server') ? 0
      : (from === 'server' && to === 'vector') || (from === 'vector' && to === 'server') ? 1
        : (from === 'graph' && to === 'intelligence')
          || (from === 'intelligence' && to === 'graph') ? 2
          : 3
  );
  const canonicalFrom: CentralNode[] = ['server', 'server', 'graph', 'vector'];
  const route = [coloredPoints[canonicalFrom[edgeIndex]], ...coloredRoutes[edgeIndex]];
  const canonicalTo: CentralNode[] = ['graph', 'vector', 'intelligence', 'intelligence'];
  route.push(coloredPoints[canonicalTo[edgeIndex]]);

  return canonicalFrom[edgeIndex] === from ? route : [...route].reverse();
}

function centralTraversal(
  source: CentralNode,
  target: CentralNode,
  direction: -1 | 1,
) {
  const route: PillarPoint[] = [coloredPoints[source]];
  let currentIndex = centralCycle.indexOf(source);

  // Visit every pillar once before exiting through the pillar that owns the target.
  for (let step = 0; step < centralCycle.length - 1; step += 1) {
    const nextIndex = (currentIndex + direction + centralCycle.length) % centralCycle.length;
    appendRoute(route, routeBetweenCentralNodes(centralCycle[currentIndex], centralCycle[nextIndex]));
    currentIndex = nextIndex;
  }

  while (centralCycle[currentIndex] !== target) {
    const nextIndex = (currentIndex + direction + centralCycle.length) % centralCycle.length;
    appendRoute(route, routeBetweenCentralNodes(centralCycle[currentIndex], centralCycle[nextIndex]));
    currentIndex = nextIndex;
  }

  return route;
}

function completeBeamRoute(trace: BeamTrace, satellitePoints: PillarPoint[]) {
  const sourcePoint = satellitePoints[trace.sourceIndex];
  const targetPoint = satellitePoints[trace.targetIndex];
  const sourceParent = satelliteParent(sourcePoint);
  const targetParent = satelliteParent(targetPoint);
  const route: PillarPoint[] = [sourcePoint];

  appendRoute(route, [...routeToSatellite(sourcePoint)].reverse());
  appendRoute(route, [coloredPoints[sourceParent]]);
  appendRoute(route, centralTraversal(sourceParent, targetParent, trace.direction));
  appendRoute(route, [coloredPoints[targetParent]]);
  appendRoute(route, routeToSatellite(targetPoint));
  appendRoute(route, [targetPoint]);

  return route;
}

function initialBeamTrace(slot: number, total: number): BeamTrace {
  const sourceIndex = (slot * 7) % total;
  const targetIndex = (sourceIndex + 5 + slot * 3) % total;
  return {
    direction: slot % 2 === 0 ? 1 : -1,
    sourceIndex,
    targetIndex: targetIndex === sourceIndex ? (targetIndex + 1) % total : targetIndex,
  };
}

function randomBeamTrace(total: number, previous: BeamTrace): BeamTrace {
  const sourceIndex = Math.floor(Math.random() * total);
  let targetIndex = Math.floor(Math.random() * (total - 1));
  if (targetIndex >= sourceIndex) targetIndex += 1;

  if (sourceIndex === previous.sourceIndex && targetIndex === previous.targetIndex) {
    targetIndex = (targetIndex + 1) % total;
    if (targetIndex === sourceIndex) targetIndex = (targetIndex + 1) % total;
  }

  return {
    direction: Math.random() < 0.5 ? -1 : 1,
    sourceIndex,
    targetIndex,
  };
}

function approximateScreenLength(route: PillarPoint[]) {
  return route.slice(1).reduce((length, point, index) => {
    const previous = route[index];
    const deltaX = point[0] - previous[0];
    const deltaY = (point[1] - previous[1]) * 1.9;
    return length + Math.hypot(deltaX, deltaY);
  }, 0);
}

export function PillarsConnectors({
  beamColor = '#449c40',
  beamEnabled = true,
  beamHighlightColor = '#c9ebc7',
  beamSpeed = 1,
  color = '#ffffff',
  connectorRadius = 1.75,
  maxConcurrentBeams = Number.POSITIVE_INFINITY,
  opacity = 0.62,
  satellitePoints,
  width = 1.25,
}: PillarsConnectorsProps) {
  const glowFilterId = `pillars-beam-glow-${useId().replaceAll(':', '')}`;
  const satelliteRoutes = satellitePoints.map(routeToSatellite);
  const routes = [...coloredRoutes, ...satelliteRoutes];
  const resolvedBeamSpeed = Math.max(0.1, beamSpeed);
  const beamCount = beamEnabled && satellitePoints.length > 1
    ? Math.min(satellitePoints.length, Math.max(0, Math.floor(maxConcurrentBeams)))
    : 0;
  const [beamTraces, setBeamTraces] = useState<BeamTrace[]>(() => (
    Array.from(
      { length: satellitePoints.length },
      (_, slot) => initialBeamTrace(slot, satellitePoints.length),
    )
  ));

  const advanceBeam = useCallback((slot: number) => {
    setBeamTraces((current) => current.map((trace, index) => (
      index === slot ? randomBeamTrace(satellitePoints.length, trace) : trace
    )));
  }, [satellitePoints.length]);

  return (
    <svg
      className={styles.connectors}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>
      {routes.map((route, index) => {
        const path = roundedPolylinePath(route, connectorRadius);

        return (
          <path
            className={styles.connector}
            d={path}
            fill="none"
            key={`${route[0].join('-')}-${route.at(-1)!.join('-')}-${index}`}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={opacity}
            strokeWidth={width}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {beamTraces.slice(0, beamCount).map((trace, slot) => {
        const route = completeBeamRoute(trace, satellitePoints);
        const path = roundedPolylinePath(route, connectorRadius);
        const duration = Math.min(
          4.3,
          Math.max(1.5, approximateScreenLength(route) / 42),
        ) / resolvedBeamSpeed;
        const beamStyle: BeamStyle = {
          '--beam-delay': `${-((slot * 0.37) % duration)}s`,
          '--beam-duration': `${duration}s`,
        };

        return (
          <g key={slot} style={beamStyle}>
            <path
              className={styles.beamGlow}
              d={path}
              fill="none"
              filter={`url(#${glowFilterId})`}
              pathLength="1"
              stroke={beamColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={width * 6}
              vectorEffect="non-scaling-stroke"
            />
            <path
              className={styles.beamCore}
              d={path}
              fill="none"
              onAnimationIteration={() => advanceBeam(slot)}
              pathLength="1"
              stroke={beamHighlightColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={width * 2}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
    </svg>
  );
}
