import type {
  FlowLayer3DBeamSource,
  FlowLayer3DPath,
  FlowLayer3DPoint,
} from '@/components/elements/FlowLayer3D';
import { createBusinessCoreNodeFlowSpokes } from './nodes';

export const businessCoreNodeFlowIllustrationSize = 1000;

export type BusinessCoreNodeFlowRoute = FlowLayer3DPath & {
  auxiliaryPoint: FlowLayer3DPoint;
};

export type BusinessCoreNodeFlowBeamSourceOptions = {
  emissionRandomness: number;
  maxConcurrentBeams: number;
  paths: readonly BusinessCoreNodeFlowRoute[];
  random?: () => number;
  showAuxiliaryNodes: boolean;
  speed: number;
  trailLengthInIllustrationUnits?: number;
};

const minimumEmissionPause = 0.12;
const emissionPauseVariation = 1.08;
const normalize = ([x, y]: readonly [number, number]): FlowLayer3DPoint => [x / 100, y / 100];

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

function pathLengthInIllustrationUnits(points: readonly FlowLayer3DPoint[]) {
  return points.slice(1).reduce((length, point, index) => {
    const previous = points[index];
    return length + Math.hypot(
      (point[0] - previous[0]) * businessCoreNodeFlowIllustrationSize,
      (point[1] - previous[1]) * businessCoreNodeFlowIllustrationSize,
    );
  }, 0);
}

function routeProgressAtPoint(
  points: readonly FlowLayer3DPoint[],
  target: FlowLayer3DPoint,
) {
  const totalLength = pathLengthInIllustrationUnits(points);
  const targetIndex = points.findIndex((point) => point[0] === target[0] && point[1] === target[1]);
  if (totalLength === 0 || targetIndex <= 0) return 0;
  return pathLengthInIllustrationUnits(points.slice(0, targetIndex + 1)) / totalLength;
}

export function createBusinessCoreNodeFlowPaths(
  numberOfAuxiliaryConnections = 12,
): readonly BusinessCoreNodeFlowRoute[] {
  return createBusinessCoreNodeFlowSpokes(numberOfAuxiliaryConnections).map((spoke) => {
    const auxiliaryPoint = normalize(spoke.auxiliaryPoint);
    return {
      auxiliaryPoint,
      fading: true,
      id: `${spoke.id}-core`,
      points: [normalize(spoke.edgePoint), auxiliaryPoint, [0.5, 0.5]],
    };
  });
}

export function createBusinessCoreNodeFlowBeamSource({
  emissionRandomness,
  maxConcurrentBeams,
  paths,
  random = Math.random,
  showAuxiliaryNodes,
  speed,
  trailLengthInIllustrationUnits = 0,
}: BusinessCoreNodeFlowBeamSourceOptions): FlowLayer3DBeamSource {
  const slots = Math.min(paths.length, Math.max(0, Math.floor(maxConcurrentBeams)));
  const resolvedSpeed = Math.max(0.1, speed);

  return {
    slots,
    next(slot, generation) {
      if (slot < 0 || slot >= slots) return null;
      const route = paths[(slot + generation * slots) % paths.length];
      const outwardPoints = [...route.points].reverse();
      const routeLength = pathLengthInIllustrationUnits(outwardPoints);
      const auxiliaryProgress = routeProgressAtPoint(outwardPoints, route.auxiliaryPoint);

      return {
        arrivals: showAuxiliaryNodes
          ? [{ id: route.id.replace(/-core$/, ''), point: route.auxiliaryPoint, progress: auxiliaryProgress }]
          : [],
        delayMs: emissionDelay(generation, slot, emissionRandomness, random) * 1000,
        durationMs: (2400 * (routeLength / 500)) / resolvedSpeed,
        fade: { endFromProgress: 0.78 },
        id: `${route.id}:${generation}`,
        path: { id: `${route.id}-beam`, points: outwardPoints },
        trailLength: routeLength === 0
          ? 0
          : Math.min(1, Math.max(0, trailLengthInIllustrationUnits) / routeLength),
      };
    },
  };
}
