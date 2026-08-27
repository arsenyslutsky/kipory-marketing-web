import type { FlowLayer3DBeamSource, FlowLayer3DPath } from '@/components/elements/FlowLayer3D';
import {
  businessFlowHorizontalLayoutNodeById,
  type BusinessFlowHorizontalLayoutNode,
} from './nodes';

type BusinessFlowHorizontalRoute = FlowLayer3DPath & {
  delay: number;
  short?: boolean;
};

export type HorizontalBeamSourceOptions = {
  emissionRandomness: number;
  maxConcurrentBeams: number;
  random?: () => number;
  speed: number;
  trailLengthInIllustrationUnits?: number;
};

const curve = 48;
const illustrationWidth = 320;
const illustrationHeight = 608;
const minimumEmissionPause = 0.12;
const emissionPauseVariation = 1.08;

function point(x: number, y: number) {
  return [x / 320, y / 608] as const;
}

function nodePoint(id: BusinessFlowHorizontalLayoutNode['id']) {
  const node = businessFlowHorizontalLayoutNodeById[id];
  return point(node.x, node.y);
}

const routes: readonly BusinessFlowHorizontalRoute[] = [
  {
    id: 'aux-top',
    points: [
      point(324, 244),
      point(302, 244),
      point(302, 282),
      point(282, 282),
      nodePoint('collector'),
    ],
    curve,
    delay: 0,
    fading: true,
    short: true,
  },
  {
    id: 'aux-middle',
    points: [point(324, 304), point(282, 304), nodePoint('collector')],
    delay: 0.1,
    fading: true,
    short: true,
  },
  {
    id: 'aux-bottom',
    points: [
      point(324, 364),
      point(302, 364),
      point(302, 326),
      point(282, 326),
      nodePoint('collector'),
    ],
    curve,
    delay: 0.2,
    fading: true,
    short: true,
  },
  {
    id: 'collector-relay-top',
    points: [
      nodePoint('collector'),
      point(214, 282),
      point(190, 282),
      point(190, 107),
      point(170, 107),
      nodePoint('relay-1'),
    ],
    curve,
    delay: 0.72,
  },
  {
    id: 'collector-relay-middle',
    points: [nodePoint('collector'), point(214, 304), point(170, 304), nodePoint('relay-2')],
    delay: 0.78,
    short: true,
  },
  {
    id: 'collector-relay-bottom',
    points: [
      nodePoint('collector'),
      point(214, 326),
      point(190, 326),
      point(190, 501),
      point(170, 501),
      nodePoint('relay-3'),
    ],
    curve,
    delay: 0.84,
  },
  {
    id: 'relay-top-terminal-1',
    points: [
      nodePoint('relay-1'),
      point(116, 92),
      point(90, 92),
      point(90, 59),
      point(58, 59),
      nodePoint('terminal-1'),
    ],
    curve,
    delay: 1.72,
  },
  {
    id: 'relay-top-terminal-2',
    points: [
      nodePoint('relay-1'),
      point(116, 122),
      point(90, 122),
      point(90, 155),
      point(58, 155),
      nodePoint('terminal-2'),
    ],
    curve,
    delay: 1.8,
  },
  {
    id: 'relay-middle-terminal-1',
    points: [
      nodePoint('relay-2'),
      point(116, 289),
      point(90, 289),
      point(90, 251),
      point(58, 251),
      nodePoint('terminal-3'),
    ],
    curve,
    delay: 1.76,
  },
  {
    id: 'relay-middle-terminal-2',
    points: [
      nodePoint('relay-2'),
      point(116, 319),
      point(90, 319),
      point(90, 357),
      point(58, 357),
      nodePoint('terminal-4'),
    ],
    curve,
    delay: 1.84,
  },
  {
    id: 'relay-bottom-terminal-1',
    points: [
      nodePoint('relay-3'),
      point(116, 486),
      point(90, 486),
      point(90, 453),
      point(58, 453),
      nodePoint('terminal-5'),
    ],
    curve,
    delay: 1.8,
  },
  {
    id: 'relay-bottom-terminal-2',
    points: [
      nodePoint('relay-3'),
      point(116, 516),
      point(90, 516),
      point(90, 549),
      point(58, 549),
      nodePoint('terminal-6'),
    ],
    curve,
    delay: 1.88,
  },
];

export const businessFlowHorizontalPaths: readonly FlowLayer3DPath[] = routes;

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
      (x - previousX) * illustrationWidth,
      (y - previousY) * illustrationHeight,
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
  maxConcurrentBeams,
  random = Math.random,
  speed,
  trailLengthInIllustrationUnits = 0,
}: HorizontalBeamSourceOptions): FlowLayer3DBeamSource {
  const resolvedSpeed = Math.max(0.1, speed);
  const cycleMs = 5200 / resolvedSpeed;
  const slots = Math.min(routes.length, Math.max(0, Math.floor(maxConcurrentBeams)));

  return {
    slots,
    next(slot, generation) {
      if (slot < 0 || slot >= slots) return null;
      const route = routes[(slot + generation * slots) % routes.length];
      const durationMs = cycleMs * (route.short ? 0.12 : 0.2);
      const point = route.points.at(-1)!;

      return {
        id: `${route.id}:${generation}`,
        delayMs: emissionDelay(generation, slot, emissionRandomness, random) * 1000,
        durationMs,
        path: route,
        arrivals: [{ id: route.id, point, progress: 1 }],
        trailLength: trailLengthToProgress(trailLengthInIllustrationUnits, route),
      };
    },
  };
}
