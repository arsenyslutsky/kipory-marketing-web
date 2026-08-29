import type { FlowLayer3DBeamSource, FlowLayer3DPath } from '@/components/elements/FlowLayer3D';
import {
  businessFlowHorizontalIllustrationHeight,
  businessFlowHorizontalIllustrationWidth,
  businessFlowHorizontalLayoutNodes,
  type BusinessFlowHorizontalLayoutNode,
} from './nodes';

export type BusinessFlowHorizontalRoute = FlowLayer3DPath & {
  delay: number;
  short?: boolean;
};

export type HorizontalBeamSourceOptions = {
  emissionRandomness: number;
  layoutNodes?: readonly BusinessFlowHorizontalLayoutNode[];
  maxConcurrentBeams: number;
  paths?: readonly BusinessFlowHorizontalRoute[];
  random?: () => number;
  speed: number;
  trailLengthInIllustrationUnits?: number;
};

const curve = 48;
const minimumEmissionPause = 0.12;
const emissionPauseVariation = 1.08;

function point(x: number, y: number) {
  return [
    x / businessFlowHorizontalIllustrationWidth,
    y / businessFlowHorizontalIllustrationHeight,
  ] as const;
}

function nodePoint(node: BusinessFlowHorizontalLayoutNode) {
  return point(node.x, node.y);
}

function nearestRelay(
  node: BusinessFlowHorizontalLayoutNode,
  relays: readonly BusinessFlowHorizontalLayoutNode[],
) {
  return relays.reduce((nearest, relay) => (
    Math.abs(relay.y - node.y) < Math.abs(nearest.y - node.y) ? relay : nearest
  ));
}

function routeFromRightNode(
  node: BusinessFlowHorizontalLayoutNode,
  collector: BusinessFlowHorizontalLayoutNode,
  index: number,
): BusinessFlowHorizontalRoute {
  const aligned = Math.abs(node.y - collector.y) < 0.001;
  const points = aligned
    ? [nodePoint(node), point(282, node.y), nodePoint(collector)]
    : [
        nodePoint(node),
        point(282, node.y),
        point(282, collector.y),
        nodePoint(collector),
      ];

  return {
    id: `${node.id}-collector`,
    points,
    curve,
    delay: index * 0.1,
    ...(aligned && { short: true }),
  };
}

function routeFromCollectorToRelay(
  collector: BusinessFlowHorizontalLayoutNode,
  relay: BusinessFlowHorizontalLayoutNode,
  index: number,
): BusinessFlowHorizontalRoute {
  const aligned = Math.abs(relay.y - collector.y) < 0.001;
  const direction = relay.y < collector.y ? -1 : 1;
  const collectorExitY = collector.y + direction * 22;
  const points = aligned
    ? [nodePoint(collector), point(214, collector.y), point(170, relay.y), nodePoint(relay)]
    : [
        nodePoint(collector),
        point(214, collectorExitY),
        point(190, collectorExitY),
        point(190, relay.y),
        point(170, relay.y),
        nodePoint(relay),
      ];

  return {
    id: `collector-${relay.id}`,
    points,
    curve,
    delay: 0.72 + index * 0.06,
    ...(aligned && { short: true }),
  };
}

function routeFromRelayToLeftNode(
  node: BusinessFlowHorizontalLayoutNode,
  relay: BusinessFlowHorizontalLayoutNode,
  index: number,
): BusinessFlowHorizontalRoute {
  const aligned = Math.abs(node.y - relay.y) < 0.001;
  const points = aligned
    ? [nodePoint(relay), point(116, relay.y), point(58, node.y), nodePoint(node)]
    : [
        nodePoint(relay),
        point(116, relay.y),
        point(90, relay.y),
        point(90, node.y),
        point(58, node.y),
        nodePoint(node),
      ];

  return {
    id: `${relay.id}-${node.id}`,
    points,
    curve,
    delay: 1.72 + index * 0.04,
    ...(aligned && { short: true }),
  };
}

export function createBusinessFlowHorizontalPaths(
  layoutNodes: readonly BusinessFlowHorizontalLayoutNode[] = businessFlowHorizontalLayoutNodes,
): readonly BusinessFlowHorizontalRoute[] {
  const collector = layoutNodes.find((node) => node.id === 'collector');
  const relays = layoutNodes.filter((node) => node.kind === 'relay');
  const leftNodes = layoutNodes.filter((node) => node.id.startsWith('left-'));
  const rightNodes = layoutNodes.filter((node) => node.id.startsWith('right-'));

  if (!collector || relays.length === 0) return [];

  return [
    ...rightNodes.map((node, index) => routeFromRightNode(node, collector, index)),
    ...relays.map((relay, index) => routeFromCollectorToRelay(collector, relay, index)),
    ...leftNodes.map((node, index) => routeFromRelayToLeftNode(
      node,
      nearestRelay(node, relays),
      index,
    )),
  ];
}

export const businessFlowHorizontalPaths = createBusinessFlowHorizontalPaths();

function seededEmissionUnit(slot: number) {
  let seed = Math.imul(slot + 1, 0x9e3779b1) >>> 0;
  seed ^= seed >>> 16;
  seed = Math.imul(seed, 0x85ebca6b) >>> 0;
  seed ^= seed >>> 13;

  return (seed >>> 0) / 0x1_0000_0000;
}

function emissionDelay(
  generation: number,
  slot: number,
  randomnessPercentage: number,
  random: () => number,
) {
  const randomness = Math.min(1, Math.max(0, randomnessPercentage / 100));
  const deterministicDelay = generation === 0 ? slot * 0.28 : 0;

  if (randomness === 0) return deterministicDelay;

  const randomUnit = generation === 0 ? seededEmissionUnit(slot) : random();
  const randomizedDelay = minimumEmissionPause + randomUnit * emissionPauseVariation;

  return deterministicDelay + (randomizedDelay - deterministicDelay) * randomness;
}

function routeLengthInIllustrationUnits(route: BusinessFlowHorizontalRoute) {
  return route.points.slice(1).reduce((length, [x, y], index) => {
    const [previousX, previousY] = route.points[index];
    return length + Math.hypot(
      (x - previousX) * businessFlowHorizontalIllustrationWidth,
      (y - previousY) * businessFlowHorizontalIllustrationHeight,
    );
  }, 0);
}

function trailLengthToProgress(
  trailLengthInIllustrationUnits: number,
  route: BusinessFlowHorizontalRoute,
) {
  const routeLength = routeLengthInIllustrationUnits(route);
  if (routeLength === 0) return 0;
  return Math.min(1, Math.max(0, trailLengthInIllustrationUnits) / routeLength);
}

export function createBusinessFlowHorizontalBeamSource({
  emissionRandomness,
  layoutNodes = businessFlowHorizontalLayoutNodes,
  maxConcurrentBeams,
  paths = businessFlowHorizontalPaths,
  random = Math.random,
  speed,
  trailLengthInIllustrationUnits = 0,
}: HorizontalBeamSourceOptions): FlowLayer3DBeamSource {
  const resolvedSpeed = Math.max(0.1, speed);
  const cycleMs = 5200 / resolvedSpeed;
  const slots = Math.min(paths.length, Math.max(0, Math.floor(maxConcurrentBeams)));

  return {
    slots,
    next(slot, generation) {
      if (slot < 0 || slot >= slots) return null;
      const route = paths[(slot + generation * slots) % paths.length];
      const durationMs = cycleMs * (route.short ? 0.12 : 0.2);
      const destinationPoint = route.points.at(-1)!;
      const targetNode = layoutNodes.find((node) => (
        node.x / businessFlowHorizontalIllustrationWidth === destinationPoint[0]
        && node.y / businessFlowHorizontalIllustrationHeight === destinationPoint[1]
      ));

      return {
        id: `${route.id}:${generation}`,
        delayMs: emissionDelay(generation, slot, emissionRandomness, random) * 1000,
        durationMs,
        path: route,
        arrivals: [{ id: targetNode?.id ?? route.id, point: destinationPoint, progress: 1 }],
        trailLength: trailLengthToProgress(trailLengthInIllustrationUnits, route),
      };
    },
  };
}
