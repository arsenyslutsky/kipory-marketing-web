import type { FlowLayer3DBeamSource, FlowLayer3DPath } from '@/components/elements/FlowLayer3D';

type BusinessFlowHorizontalRoute = FlowLayer3DPath & {
  delay: number;
  short?: boolean;
};

const curve = 48;

function point(x: number, y: number) {
  return [x / 320, y / 608] as const;
}

const routes: readonly BusinessFlowHorizontalRoute[] = [
  {
    id: 'aux-top',
    points: [
      point(324, 244),
      point(302, 244),
      point(302, 282),
      point(282, 282),
      point(248, 304),
    ],
    curve,
    delay: 0,
    short: true,
  },
  {
    id: 'aux-middle',
    points: [point(324, 304), point(282, 304), point(248, 304)],
    delay: 0.1,
    short: true,
  },
  {
    id: 'aux-bottom',
    points: [
      point(324, 364),
      point(302, 364),
      point(302, 326),
      point(282, 326),
      point(248, 304),
    ],
    curve,
    delay: 0.2,
    short: true,
  },
  {
    id: 'collector-relay-top',
    points: [
      point(248, 304),
      point(214, 282),
      point(190, 282),
      point(190, 107),
      point(170, 107),
      point(143, 107),
    ],
    curve,
    delay: 0.72,
  },
  {
    id: 'collector-relay-middle',
    points: [point(248, 304), point(214, 304), point(170, 304), point(143, 304)],
    delay: 0.78,
    short: true,
  },
  {
    id: 'collector-relay-bottom',
    points: [
      point(248, 304),
      point(214, 326),
      point(190, 326),
      point(190, 501),
      point(170, 501),
      point(143, 501),
    ],
    curve,
    delay: 0.84,
  },
  {
    id: 'relay-top-terminal-1',
    points: [
      point(143, 107),
      point(116, 92),
      point(90, 92),
      point(90, 59),
      point(58, 59),
      point(37, 59),
    ],
    curve,
    delay: 1.72,
  },
  {
    id: 'relay-top-terminal-2',
    points: [
      point(143, 107),
      point(116, 122),
      point(90, 122),
      point(90, 155),
      point(58, 155),
      point(37, 155),
    ],
    curve,
    delay: 1.8,
  },
  {
    id: 'relay-middle-terminal-1',
    points: [
      point(143, 304),
      point(116, 289),
      point(90, 289),
      point(90, 251),
      point(58, 251),
      point(37, 251),
    ],
    curve,
    delay: 1.76,
  },
  {
    id: 'relay-middle-terminal-2',
    points: [
      point(143, 304),
      point(116, 319),
      point(90, 319),
      point(90, 357),
      point(58, 357),
      point(37, 357),
    ],
    curve,
    delay: 1.84,
  },
  {
    id: 'relay-bottom-terminal-1',
    points: [
      point(143, 501),
      point(116, 486),
      point(90, 486),
      point(90, 453),
      point(58, 453),
      point(37, 453),
    ],
    curve,
    delay: 1.8,
  },
  {
    id: 'relay-bottom-terminal-2',
    points: [
      point(143, 501),
      point(116, 516),
      point(90, 516),
      point(90, 549),
      point(58, 549),
      point(37, 549),
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
