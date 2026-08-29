import { expect, it } from 'vitest';
import {
  createBusinessFlowVerticalBeamSource,
  createBusinessFlowVerticalPaths,
} from './routes';

const satellites = [[20, 18], [80, 18], [20, 82], [80, 82]] as const;

function createSource(overrides: Partial<Parameters<typeof createBusinessFlowVerticalBeamSource>[0]> = {}) {
  return createBusinessFlowVerticalBeamSource({
    connectorRadius: 1.75,
    emissionRandomness: 0,
    maxConcurrentBeams: 4,
    random: () => 0.5,
    satellitePoints: satellites,
    showContinuationConnectors: false,
    speed: 1,
    ...overrides,
  });
}

it('builds central, satellite, and continuation connectors', () => {
  expect(createBusinessFlowVerticalPaths(satellites, false)).toHaveLength(7);
  const continued = createBusinessFlowVerticalPaths(satellites, true);
  expect(continued).toHaveLength(11);
  expect(continued.filter((path) => path.fading)).toHaveLength(4);
});

it('extends central, satellite, and continuation connectors beneath their item centers', () => {
  const paths = createBusinessFlowVerticalPaths(satellites, true);
  const endpoints = Object.fromEntries(paths.map((path) => [
    path.id,
    [path.points[0], path.points.at(-1)],
  ]));

  expect(endpoints).toEqual({
    'central-0': [[0.2, 0.5], [0.4, 0.5]],
    'central-1': [[0.4, 0.5], [0.6, 0.5]],
    'central-2': [[0.6, 0.5], [0.8, 0.5]],
    'satellite-0': [[0.2, 0.5], [0.2, 0.18]],
    'satellite-1': [[0.8, 0.5], [0.8, 0.18]],
    'satellite-2': [[0.2, 0.5], [0.2, 0.82]],
    'satellite-3': [[0.8, 0.5], [0.8, 0.82]],
    'continuation-0': [[0.2, 0], [0.2, 0.18]],
    'continuation-1': [[0.8, 0], [0.8, 0.18]],
    'continuation-2': [[0.2, 1], [0.2, 0.82]],
    'continuation-3': [[0.8, 1], [0.8, 0.82]],
  });
});

it('orients fading continuations from the canvas edge toward each satellite', () => {
  const continuations = createBusinessFlowVerticalPaths(satellites, true)
    .filter((path) => path.fading);

  expect(continuations.map((path) => path.points[0][1])).toEqual([0, 0, 1, 1]);
});

it('uses deterministic staggering when randomness is disabled', () => {
  const source = createSource();
  expect(source.slots).toBe(4);
  expect(source.next(0, 0)?.delayMs).toBe(0);
  expect(source.next(1, 0)?.delayMs).toBe(280);
  const run = source.next(0, 0)!;
  expect(run.arrivals?.at(-1)?.progress).toBe(1);
  expect(run.durationMs).toBeGreaterThanOrEqual(1500);
  expect(run.durationMs).toBeLessThanOrEqual(4300);
});

it('includes both continuation edges in a complete beam route', () => {
  const run = createSource({ showContinuationConnectors: true }).next(0, 0)!;

  expect(run.path.points[0]).toEqual([0.2, 0]);
  expect(run.path.points.at(-1)).toEqual([0.8, 1]);
  expect(run.arrivals?.map((arrival) => arrival.point)).toEqual([
    [0.2, 0.18],
    [0.2, 0.5],
    [0.4, 0.5],
    [0.6, 0.5],
    [0.8, 0.5],
    [0.8, 0.82],
  ]);
  expect(run.arrivals?.map((arrival) => arrival.id)).toEqual([
    'satellite-0',
    'server',
    'graph',
    'vector',
    'intelligence',
    'satellite-3',
  ]);
});

it('carries literal start and end continuation fade progress only on continued runs', () => {
  const satellitePoints = [[50, 18], [50, 82]] as const;
  const continued = createSource({
    connectorRadius: 0,
    satellitePoints,
    showContinuationConnectors: true,
  }).next(0, 0)!;
  const ordinary = createSource({
    connectorRadius: 0,
    satellitePoints,
    showContinuationConnectors: false,
  }).next(0, 0)!;

  expect(continued.fade?.startUntilProgress).toBeCloseTo(22.8 / 210);
  expect(continued.fade?.endFromProgress).toBeCloseTo(187.2 / 210);
  expect(ordinary.fade).toBeUndefined();
});

it('emits arrivals in strictly increasing route progress', () => {
  const arrivals = createSource().next(0, 0)!.arrivals!;

  expect(arrivals[0].progress).toBeGreaterThan(0);
  expect(arrivals.every((arrival, index) => (
    index === 0 || arrival.progress > arrivals[index - 1].progress
  ))).toBe(true);
  expect(arrivals.at(-1)?.progress).toBe(1);
});

it('uses injected randomness for later route selection and emission delay', () => {
  const source = createSource({ emissionRandomness: 100, random: () => 0.5 });
  source.next(0, 0);

  const later = source.next(0, 1)!;
  expect(later.id).toBe('vertical-0:1');
  expect(later.delayMs).toBe(660);
  expect(later.delayMs).toBeGreaterThanOrEqual(120);
  expect(later.delayMs).toBeLessThanOrEqual(1200);
  expect(later.path.points[0]).toEqual([0.8, 0.18]);
  expect(later.path.points.at(-1)).toEqual([0.8, 0.82]);
});

it('uses injected randomness for the first emission cycle', () => {
  const earlySource = createSource({ emissionRandomness: 100, random: () => 0 });
  const lateSource = createSource({ emissionRandomness: 100, random: () => 1 });

  expect(earlySource.next(0, 0)?.delayMs).toBeCloseTo(120);
  expect(lateSource.next(0, 0)?.delayMs).toBeCloseTo(1200);
});

it('clamps speed to one tenth and scales durations above that floor', () => {
  const zeroSpeedDuration = createSource({ speed: 0 }).next(0, 0)!.durationMs;
  const floorSpeedDuration = createSource({ speed: 0.1 }).next(0, 0)!.durationMs;
  const doubleSpeedDuration = createSource({ speed: 2 }).next(0, 0)!.durationMs;

  expect(zeroSpeedDuration).toBe(floorSpeedDuration);
  expect(doubleSpeedDuration * 20).toBeCloseTo(floorSpeedDuration);
});

it('converts legacy illustration-unit trail length into route progress', () => {
  const source = createSource({
    connectorRadius: 0,
    satellitePoints: [[50, 18], [50, 82]],
    trailLengthInIllustrationUnits: 21,
  });

  expect(source.next(0, 0)?.trailLength).toBe(0.25);
});

it('floors and caps concurrent beam slots', () => {
  expect(createSource({ maxConcurrentBeams: 2.9 }).slots).toBe(2);
  expect(createSource({ maxConcurrentBeams: 99 }).slots).toBe(4);
  expect(createSource({ maxConcurrentBeams: -1 }).slots).toBe(0);
});
