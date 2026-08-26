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

it('clamps speed to one tenth and scales durations above that floor', () => {
  const zeroSpeedDuration = createSource({ speed: 0 }).next(0, 0)!.durationMs;
  const floorSpeedDuration = createSource({ speed: 0.1 }).next(0, 0)!.durationMs;
  const doubleSpeedDuration = createSource({ speed: 2 }).next(0, 0)!.durationMs;

  expect(zeroSpeedDuration).toBe(floorSpeedDuration);
  expect(doubleSpeedDuration * 20).toBeCloseTo(floorSpeedDuration);
});

it('floors and caps concurrent beam slots', () => {
  expect(createSource({ maxConcurrentBeams: 2.9 }).slots).toBe(2);
  expect(createSource({ maxConcurrentBeams: 99 }).slots).toBe(4);
  expect(createSource({ maxConcurrentBeams: -1 }).slots).toBe(0);
});
