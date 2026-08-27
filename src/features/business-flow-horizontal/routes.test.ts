import { expect, it } from 'vitest';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
} from './routes';

function createSource(overrides: Partial<Parameters<typeof createBusinessFlowHorizontalBeamSource>[0]> = {}) {
  return createBusinessFlowHorizontalBeamSource({
    emissionRandomness: 0,
    maxConcurrentBeams: 5,
    random: () => 0.5,
    speed: 1,
    trailLengthInIllustrationUnits: 0,
    ...overrides,
  });
}

it('preserves twelve connectors and the off-canvas entry', () => {
  expect(businessFlowHorizontalPaths).toHaveLength(12);
  expect(businessFlowHorizontalPaths[0]).toMatchObject({
    id: 'aux-top',
    points: [
      [324 / 320, 244 / 608], [302 / 320, 244 / 608],
      [302 / 320, 282 / 608], [282 / 320, 282 / 608], [248 / 320, 304 / 608],
    ],
  });
  expect(businessFlowHorizontalPaths.at(-1)?.id).toBe('relay-bottom-terminal-2');
});

it('fades only the off-canvas auxiliary connectors toward the collector', () => {
  expect(
    businessFlowHorizontalPaths
      .filter((path) => path.fading)
      .map((path) => ({
        end: path.points.at(-1),
        id: path.id,
        start: path.points[0],
      })),
  ).toEqual([
    {
      end: [248 / 320, 304 / 608],
      id: 'aux-top',
      start: [324 / 320, 244 / 608],
    },
    {
      end: [248 / 320, 304 / 608],
      id: 'aux-middle',
      start: [324 / 320, 304 / 608],
    },
    {
      end: [248 / 320, 304 / 608],
      id: 'aux-bottom',
      start: [324 / 320, 364 / 608],
    },
  ]);
});

it('extends every attached connector beneath the center of its item', () => {
  const endpoints = Object.fromEntries(businessFlowHorizontalPaths.map((path) => [
    path.id,
    [path.points[0], path.points.at(-1)],
  ]));

  expect(endpoints).toEqual({
    'aux-top': [[324 / 320, 244 / 608], [248 / 320, 304 / 608]],
    'aux-middle': [[324 / 320, 304 / 608], [248 / 320, 304 / 608]],
    'aux-bottom': [[324 / 320, 364 / 608], [248 / 320, 304 / 608]],
    'collector-relay-top': [[248 / 320, 304 / 608], [143 / 320, 107 / 608]],
    'collector-relay-middle': [[248 / 320, 304 / 608], [143 / 320, 304 / 608]],
    'collector-relay-bottom': [[248 / 320, 304 / 608], [143 / 320, 501 / 608]],
    'relay-top-terminal-1': [[143 / 320, 107 / 608], [37 / 320, 59 / 608]],
    'relay-top-terminal-2': [[143 / 320, 107 / 608], [37 / 320, 155 / 608]],
    'relay-middle-terminal-1': [[143 / 320, 304 / 608], [37 / 320, 251 / 608]],
    'relay-middle-terminal-2': [[143 / 320, 304 / 608], [37 / 320, 357 / 608]],
    'relay-bottom-terminal-1': [[143 / 320, 501 / 608], [37 / 320, 453 / 608]],
    'relay-bottom-terminal-2': [[143 / 320, 501 / 608], [37 / 320, 549 / 608]],
  });
});

it('limits concurrent slots and rotates them through every route', () => {
  const source = createSource();
  const routeIds = Array.from({ length: 3 }, (_, generation) => (
    Array.from({ length: source.slots }, (_, slot) => source.next(slot, generation)?.path.id)
  )).flat();

  expect(source.slots).toBe(5);
  expect(new Set(routeIds)).toEqual(new Set(businessFlowHorizontalPaths.map((path) => path.id)));
  expect(routeIds.slice(0, 6)).toEqual([
    'aux-top',
    'aux-middle',
    'aux-bottom',
    'collector-relay-top',
    'collector-relay-middle',
    'collector-relay-bottom',
  ]);
});

it('uses deterministic staggering when randomness is disabled', () => {
  const source = createSource();

  expect(source.next(0, 0)).toMatchObject({ id: 'aux-top:0', delayMs: 0 });
  expect(source.next(1, 0)?.delayMs).toBe(280);
  expect(source.next(0, 1)?.delayMs).toBe(0);
});

it('uses injected randomness for later emission delays', () => {
  const source = createSource({ emissionRandomness: 100, random: () => 0.5 });
  source.next(0, 0);

  const later = source.next(0, 1)!;
  expect(later.id).toBe('collector-relay-bottom:1');
  expect(later.delayMs).toBe(660);
  expect(later.delayMs).toBeGreaterThanOrEqual(120);
  expect(later.delayMs).toBeLessThanOrEqual(1200);
});

it('scales durations by speed above a one-tenth floor', () => {
  const zeroSpeedDuration = createSource({ speed: 0 }).next(3, 0)!.durationMs;
  const floorSpeedDuration = createSource({ speed: 0.1 }).next(3, 0)!.durationMs;
  const doubleSpeedDuration = createSource({ speed: 2 }).next(3, 0)!.durationMs;

  expect(zeroSpeedDuration).toBe(floorSpeedDuration);
  expect(doubleSpeedDuration * 20).toBeCloseTo(floorSpeedDuration);
});

it('emits arrivals at route endpoints and rejects invalid slots', () => {
  const source = createSource();
  const run = source.next(0, 0)!;

  expect(run.arrivals).toEqual([{
    id: 'aux-top',
    point: [248 / 320, 304 / 608],
    progress: 1,
  }]);
  expect(source.next(-1, 0)).toBeNull();
  expect(source.next(5, 0)).toBeNull();
});

it('converts illustration-pixel trail length into route progress', () => {
  const source = createSource({ trailLengthInIllustrationUnits: 32 });
  const straightRouteRun = source.next(1, 0)!;

  expect(straightRouteRun.path.id).toBe('aux-middle');
  expect(straightRouteRun.trailLength).toBeCloseTo(32 / 76);
});

it('floors and caps concurrent beam slots', () => {
  expect(createSource({ maxConcurrentBeams: 2.9 }).slots).toBe(2);
  expect(createSource({ maxConcurrentBeams: 99 }).slots).toBe(12);
  expect(createSource({ maxConcurrentBeams: -1 }).slots).toBe(0);
});
