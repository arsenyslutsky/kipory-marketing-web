import type { FlowLayer3DBeamSource, FlowLayer3DPath } from '@/components/elements/FlowLayer3D';
import {
  businessFlowHorizontalLayoutNodeById,
  type BusinessFlowHorizontalLayoutNode,
} from './nodes';

type BusinessFlowHorizontalRoute = FlowLayer3DPath & {
  delay: number;
  short?: boolean;
};

const curve = 48;

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

export function createBusinessFlowHorizontalBeamSource(speed: number): FlowLayer3DBeamSource {
  const resolvedSpeed = Math.max(0.1, speed);
  const cycleMs = 5200 / resolvedSpeed;

  return {
    slots: routes.length,
    next(slot, generation) {
      const route = routes[slot];
      if (!route) return null;
      const durationMs = cycleMs * (route.short ? 0.12 : 0.2);
      const delayMs = generation === 0
        ? (route.delay * 1000) / resolvedSpeed
        : cycleMs - durationMs;
      const point = route.points.at(-1)!;

      return {
        id: `${route.id}:${generation}`,
        delayMs,
        durationMs,
        path: route,
        arrivals: [{ id: route.id, point, progress: 1 }],
      };
    },
  };
}
