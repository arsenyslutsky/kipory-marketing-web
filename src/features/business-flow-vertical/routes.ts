import type {
  FlowLayer3DArrival,
  FlowLayer3DBeamSource,
  FlowLayer3DPath,
  FlowLayer3DPoint,
} from '@/components/elements/FlowLayer3D';
import { businessFlowVerticalCentralNodes, type PillarPoint } from './nodes';

export type { PillarPoint } from './nodes';

export type VerticalBeamSourceOptions = {
  connectorRadius: number;
  emissionRandomness: number;
  maxConcurrentBeams: number;
  random?: () => number;
  satellitePoints: readonly PillarPoint[];
  showContinuationConnectors: boolean;
  speed: number;
  trailLengthInIllustrationUnits?: number;
};

type CentralNode = typeof businessFlowVerticalCentralNodes[number]['id'];

type BeamTrace = {
  generation: number;
  sourceIndex: number;
  targetIndex: number;
};

const coloredPoints = Object.fromEntries(
  businessFlowVerticalCentralNodes.map((node) => [node.id, node.point]),
) as Record<CentralNode, PillarPoint>;

const coloredRoutes: readonly (readonly PillarPoint[])[] = [
  [coloredPoints.server, [26, 50], [34, 50], coloredPoints.graph],
  [coloredPoints.graph, [46, 50], [54, 50], coloredPoints.vector],
  [coloredPoints.vector, [66, 50], [74, 50], coloredPoints.intelligence],
];

const centralOrder: readonly CentralNode[] = businessFlowVerticalCentralNodes.map((node) => node.id);
const continuationFadeBoundary = 12;
const minimumEmissionPause = 0.12;
const emissionPauseVariation = 1.08;

const normalize = ([x, y]: PillarPoint): FlowLayer3DPoint => [x / 100, y / 100];

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

function roundedRouteLength(rawPoints: readonly PillarPoint[], cornerRadius: number) {
  const points = rawPoints.filter((point, index) => (
    index === 0 || distance(point, rawPoints[index - 1]) > 0.001
  ));
  if (points.length < 2) return 0;
  const resolvedRadius = Math.max(0, cornerRadius);
  if (points.length === 2 || resolvedRadius === 0) {
    return points.slice(1).reduce(
      (length, point, index) => length + distance(points[index], point),
      0,
    );
  }

  let length = 0;
  let cursor = points[0];
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const trim = Math.min(
      resolvedRadius,
      distance(previous, corner) / 2,
      distance(corner, next) / 2,
    );
    const entry = moveToward(corner, previous, trim);
    const exit = moveToward(corner, next, trim);
    length += distance(cursor, entry);
    let curvePoint = entry;
    for (let step = 1; step <= 32; step += 1) {
      const t = step / 32;
      const inverse = 1 - t;
      const nextCurvePoint: PillarPoint = [
        inverse * inverse * entry[0] + 2 * inverse * t * corner[0] + t * t * exit[0],
        inverse * inverse * entry[1] + 2 * inverse * t * corner[1] + t * t * exit[1],
      ];
      length += distance(curvePoint, nextCurvePoint);
      curvePoint = nextCurvePoint;
    }
    cursor = exit;
  }

  return length + distance(cursor, points.at(-1)!);
}

function legacyTrailLengthToProgress(
  trailLengthInIllustrationUnits: number,
  route: readonly PillarPoint[],
  connectorRadius: number,
) {
  const routeLength = roundedRouteLength(route, connectorRadius);
  if (routeLength === 0) return 0;
  return Math.min(1, Math.max(0, trailLengthInIllustrationUnits) / routeLength);
}

function routeToSatellite(point: PillarPoint): PillarPoint[] {
  const parent = satelliteParent(point);
  const parentPoint = coloredPoints[parent];
  const direction = point[1] < parentPoint[1] ? -1 : 1;
  const junctionY = (parentPoint[1] + point[1]) / 2;

  return [
    parentPoint,
    [parentPoint[0], parentPoint[1] + direction * 3],
    [parentPoint[0], junctionY],
    [point[0], junctionY],
    [point[0], point[1] - direction * 2.5],
    point,
  ];
}

function continuationRoute(point: PillarPoint): PillarPoint[] {
  const isTopNode = point[1] < coloredPoints.server[1];
  const nodeEdgeY = point[1] + (isTopNode ? -2.5 : 2.5);
  const canvasEdgeY = isTopNode ? 0 : 100;

  return isTopNode
    ? [[point[0], canvasEdgeY], [point[0], nodeEdgeY], point]
    : [point, [point[0], nodeEdgeY], [point[0], canvasEdgeY]];
}

function satelliteParent(point: PillarPoint): CentralNode {
  return centralOrder.reduce((nearest, node) => (
    Math.abs(coloredPoints[node][0] - point[0])
      < Math.abs(coloredPoints[nearest][0] - point[0])
      ? node
      : nearest
  ));
}

function appendRoute(target: PillarPoint[], route: readonly PillarPoint[]) {
  route.forEach((point) => {
    if (target.length === 0 || distance(target.at(-1)!, point) > 0.001) target.push(point);
  });
}

function centralTraversal(source: CentralNode, target: CentralNode) {
  const sourceIndex = centralOrder.indexOf(source);
  const targetIndex = centralOrder.indexOf(target);
  const direction = sourceIndex <= targetIndex ? 1 : -1;
  const route: PillarPoint[] = [coloredPoints[source]];
  let currentIndex = sourceIndex;

  while (currentIndex !== targetIndex) {
    currentIndex += direction;
    appendRoute(route, [coloredPoints[centralOrder[currentIndex]]]);
  }

  return route;
}

function completeBeamRoute(
  trace: BeamTrace,
  satellitePoints: readonly PillarPoint[],
  showContinuationConnectors: boolean,
) {
  const targetPoint = satellitePoints[trace.targetIndex];
  const targetParent = satelliteParent(targetPoint);
  const sourcePoint = satellitePoints[trace.sourceIndex];
  const sourceParent = satelliteParent(sourcePoint);
  const route: PillarPoint[] = [];

  if (showContinuationConnectors) appendRoute(route, continuationRoute(sourcePoint));
  appendRoute(route, [sourcePoint]);
  appendRoute(route, [...routeToSatellite(sourcePoint)].reverse());
  appendRoute(route, [coloredPoints[sourceParent]]);
  appendRoute(route, centralTraversal(sourceParent, targetParent));
  appendRoute(route, [coloredPoints[targetParent]]);
  appendRoute(route, routeToSatellite(targetPoint));
  appendRoute(route, [targetPoint]);
  if (showContinuationConnectors) appendRoute(route, continuationRoute(targetPoint));

  return route;
}

function beamArrivalPoints(
  trace: BeamTrace,
  satellitePoints: readonly PillarPoint[],
  showContinuationConnectors: boolean,
) {
  const sourcePoint = satellitePoints[trace.sourceIndex];
  const sourceParent = satelliteParent(sourcePoint);
  const targetPoint = satellitePoints[trace.targetIndex];
  const targetParent = satelliteParent(targetPoint);

  const centralArrivals = centralTraversal(sourceParent, targetParent).map((point) => ({
    id: centralOrder.find((id) => distance(coloredPoints[id], point) < 0.001)!,
    point,
  }));

  return [
    ...(showContinuationConnectors
      ? [{ id: `satellite-${trace.sourceIndex}`, point: sourcePoint }]
      : []),
    ...centralArrivals,
    { id: `satellite-${trace.targetIndex}`, point: targetPoint },
  ];
}

function initialBeamTrace(
  slot: number,
  sourceIndexes: readonly number[],
  targetIndexes: readonly number[],
): BeamTrace {
  return {
    generation: 0,
    sourceIndex: sourceIndexes[(slot * 7) % sourceIndexes.length],
    targetIndex: targetIndexes[(slot * 3 + 1) % targetIndexes.length],
  };
}

function randomBeamTrace(
  sourceIndexes: readonly number[],
  targetIndexes: readonly number[],
  previous: BeamTrace,
  random: () => number,
): BeamTrace {
  const sourceIndex = sourceIndexes[Math.floor(random() * sourceIndexes.length)];
  let targetIndex = targetIndexes[Math.floor(random() * targetIndexes.length)];

  if (sourceIndex === previous.sourceIndex && targetIndex === previous.targetIndex) {
    const previousTargetPosition = targetIndexes.indexOf(targetIndex);
    targetIndex = targetIndexes[(previousTargetPosition + 1) % targetIndexes.length];
  }

  return {
    generation: previous.generation + 1,
    sourceIndex,
    targetIndex,
  };
}

function screenSegmentLength(from: PillarPoint, to: PillarPoint) {
  return Math.hypot(to[0] - from[0], (to[1] - from[1]) * 1.9);
}

function approximateScreenLength(route: readonly PillarPoint[]) {
  return route.slice(1).reduce(
    (length, point, index) => length + screenSegmentLength(route[index], point),
    0,
  );
}

function continuationFade(route: readonly PillarPoint[]) {
  const first = route[0];
  const last = route.at(-1)!;
  const totalLength = approximateScreenLength(route);
  if (totalLength === 0) return undefined;
  const startBoundary: PillarPoint = [
    first[0],
    first[1] < 50
      ? first[1] + continuationFadeBoundary
      : first[1] - continuationFadeBoundary,
  ];
  const endBoundary: PillarPoint = [
    last[0],
    last[1] < 50
      ? last[1] + continuationFadeBoundary
      : last[1] - continuationFadeBoundary,
  ];

  return {
    endFromProgress: 1 - screenSegmentLength(endBoundary, last) / totalLength,
    startUntilProgress: screenSegmentLength(first, startBoundary) / totalLength,
  };
}

function routeProgressAtPoint(route: readonly PillarPoint[], arrivalPoint: PillarPoint) {
  const arrivalIndex = route.findIndex((point) => distance(point, arrivalPoint) < 0.001);
  const totalLength = approximateScreenLength(route);

  if (arrivalIndex <= 0 || totalLength === 0) return 0;
  return approximateScreenLength(route.slice(0, arrivalIndex + 1)) / totalLength;
}

function emissionDelay(
  trace: BeamTrace,
  slot: number,
  randomnessPercentage: number,
  random: () => number,
) {
  const randomness = Math.min(1, Math.max(0, randomnessPercentage / 100));
  const deterministicDelay = trace.generation === 0 ? slot * 0.28 : 0;

  if (randomness === 0) return deterministicDelay;

  const randomizedDelay = minimumEmissionPause + random() * emissionPauseVariation;

  return deterministicDelay + (randomizedDelay - deterministicDelay) * randomness;
}

function createBeamRun(
  trace: BeamTrace,
  satellitePoints: readonly PillarPoint[],
  slot: number,
  speed: number,
  showContinuationConnectors: boolean,
  emissionRandomness: number,
  connectorRadius: number,
  trailLengthInIllustrationUnits: number,
  random: () => number,
) {
  const route = completeBeamRoute(trace, satellitePoints, showContinuationConnectors);
  const durationMs = (
    Math.min(4.3, Math.max(1.5, approximateScreenLength(route) / 42)) / speed
  ) * 1000;
  const arrivals: FlowLayer3DArrival[] = beamArrivalPoints(
    trace,
    satellitePoints,
    showContinuationConnectors,
  ).map((arrival) => ({
    id: arrival.id,
    point: normalize(arrival.point),
    progress: routeProgressAtPoint(route, arrival.point),
  }));

  return {
    arrivals,
    delayMs: emissionDelay(trace, slot, emissionRandomness, random) * 1000,
    durationMs,
    ...(showContinuationConnectors ? { fade: continuationFade(route) } : {}),
    id: `vertical-${slot}:${trace.generation}`,
    path: {
      id: `vertical-beam-${slot}:${trace.generation}`,
      points: route.map(normalize),
      curve: Math.min(100, Math.max(0, connectorRadius * 20)),
    },
    trailLength: legacyTrailLengthToProgress(
      trailLengthInIllustrationUnits,
      route,
      connectorRadius,
    ),
  };
}

export function createBusinessFlowVerticalPaths(
  satellitePoints: readonly PillarPoint[],
  showContinuation: boolean,
): FlowLayer3DPath[] {
  const curve = 0;
  const centralPaths = coloredRoutes.map((points, index) => ({
    id: `central-${index}`,
    points: points.map(normalize),
    curve,
  }));
  const satellitePaths = satellitePoints.map((point, index) => ({
    id: `satellite-${index}`,
    points: routeToSatellite(point).map(normalize),
    curve,
  }));
  const continuationPaths = showContinuation
    ? satellitePoints.map((point, index) => {
      const route = continuationRoute(point);
      const edgeFirstRoute = point[1] < 50 ? route : [...route].reverse();

      return {
        id: `continuation-${index}`,
        points: edgeFirstRoute.map(normalize),
        curve,
        fading: true,
      };
    })
    : [];

  return [...centralPaths, ...satellitePaths, ...continuationPaths];
}

export function createBusinessFlowVerticalBeamSource({
  connectorRadius,
  emissionRandomness,
  maxConcurrentBeams,
  random = Math.random,
  satellitePoints,
  showContinuationConnectors,
  speed,
  trailLengthInIllustrationUnits = 0,
}: VerticalBeamSourceOptions): FlowLayer3DBeamSource {
  const sourceIndexes = satellitePoints.flatMap((point, index) => point[1] < 50 ? [index] : []);
  const targetIndexes = satellitePoints.flatMap((point, index) => point[1] > 50 ? [index] : []);
  const hasCompleteRoute = sourceIndexes.length > 0 && targetIndexes.length > 0;
  const slots = hasCompleteRoute
    ? Math.min(satellitePoints.length, Math.max(0, Math.floor(maxConcurrentBeams)))
    : 0;
  const resolvedSpeed = Math.max(0.1, speed);
  const traces: Array<BeamTrace | undefined> = Array.from({ length: slots });

  return {
    slots,
    next(slot, generation) {
      if (slot < 0 || slot >= slots) return null;
      const initial = initialBeamTrace(slot, sourceIndexes, targetIndexes);
      const previous = traces[slot] ?? initial;
      const trace = generation === 0
        ? initial
        : randomBeamTrace(sourceIndexes, targetIndexes, previous, random);
      trace.generation = generation;
      traces[slot] = trace;

      return createBeamRun(
        trace,
        satellitePoints,
        slot,
        resolvedSpeed,
        showContinuationConnectors,
        Math.min(100, Math.max(0, emissionRandomness)),
        connectorRadius,
        trailLengthInIllustrationUnits,
        random,
      );
    },
  };
}
