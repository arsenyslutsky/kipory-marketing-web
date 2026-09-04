import { expect, it } from 'vitest';
import { createBusinessFlowHorizontalLayoutNodes } from './nodes';
import {
  businessFlowHorizontalPaths,
  createBusinessFlowHorizontalBeamSource,
  createBusinessFlowHorizontalPaths,
} from './routes';

function createSource(overrides: Partial<Parameters<typeof createBusinessFlowHorizontalBeamSource>[0]> = {}) {
  return createBusinessFlowHorizontalBeamSource({
    emissionRandomness: 0,
    maxConcurrentBeams: 5,
    random: () => 0.5,
    speed: 1,
    trailLengthInPixels: 0,
    ...overrides,
  });
}

it('preserves twelve connectors while bringing the right entries onto visible nodes', () => {
  expect(businessFlowHorizontalPaths).toHaveLength(12);
  expect(businessFlowHorizontalPaths[0]).toMatchObject({
    id: 'right-1-collector',
    points: [
      [304 / 320, 59 / 608], [282 / 320, 59 / 608],
      [282 / 320, 304 / 608], [248 / 320, 304 / 608],
    ],
  });
  expect(businessFlowHorizontalPaths.at(-1)?.id).toBe('relay-3-left-6');
});

it('does not fade connectors attached to visible right nodes', () => {
  expect(businessFlowHorizontalPaths.filter((path) => path.fading)).toEqual([]);
});

it('extends every attached connector beneath the center of its item', () => {
  const endpoints = Object.fromEntries(businessFlowHorizontalPaths.map((path) => [
    path.id,
    [path.points[0], path.points.at(-1)],
  ]));

  expect(endpoints).toEqual({
    'right-1-collector': [[304 / 320, 59 / 608], [248 / 320, 304 / 608]],
    'right-2-collector': [[304 / 320, 304 / 608], [248 / 320, 304 / 608]],
    'right-3-collector': [[304 / 320, 549 / 608], [248 / 320, 304 / 608]],
    'collector-relay-1': [[248 / 320, 304 / 608], [143 / 320, 107 / 608]],
    'collector-relay-2': [[248 / 320, 304 / 608], [143 / 320, 304 / 608]],
    'collector-relay-3': [[248 / 320, 304 / 608], [143 / 320, 501 / 608]],
    'relay-1-left-1': [[143 / 320, 107 / 608], [37 / 320, 59 / 608]],
    'relay-1-left-2': [[143 / 320, 107 / 608], [37 / 320, 157 / 608]],
    'relay-2-left-3': [[143 / 320, 304 / 608], [37 / 320, 255 / 608]],
    'relay-2-left-4': [[143 / 320, 304 / 608], [37 / 320, 353 / 608]],
    'relay-3-left-5': [[143 / 320, 501 / 608], [37 / 320, 451 / 608]],
    'relay-3-left-6': [[143 / 320, 501 / 608], [37 / 320, 549 / 608]],
  });
});

it('keeps every custom connector endpoint attached to a generated node', () => {
  const layoutNodes = createBusinessFlowHorizontalLayoutNodes(2, 4);
  const paths = createBusinessFlowHorizontalPaths(layoutNodes);
  const nodePoints = new Set(layoutNodes.map((node) => `${node.x / 320}:${node.y / 608}`));

  expect(paths).toHaveLength(9);
  paths.forEach((path) => {
    expect(nodePoints.has(path.points[0].join(':')), path.id).toBe(true);
    expect(nodePoints.has(path.points.at(-1)!.join(':')), path.id).toBe(true);
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
    'right-1-collector',
    'right-2-collector',
    'right-3-collector',
    'collector-relay-1',
    'collector-relay-2',
    'collector-relay-3',
  ]);
});

it('uses deterministic staggering when randomness is disabled', () => {
  const source = createSource();

  expect(source.next(0, 0)).toMatchObject({ id: 'right-1-collector:0', delayMs: 0 });
  expect(source.next(1, 0)?.delayMs).toBe(280);
  expect(source.next(0, 1)?.delayMs).toBe(0);
});

it('uses injected randomness for later emission delays', () => {
  const source = createSource({ emissionRandomness: 100, random: () => 0.5 });
  source.next(0, 0);

  const later = source.next(0, 1)!;
  expect(later.id).toBe('collector-relay-3:1');
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
    id: 'collector',
    point: [248 / 320, 304 / 608],
    progress: 1,
  }]);
  expect(source.next(-1, 0)).toBeNull();
  expect(source.next(5, 0)).toBeNull();
});

it('keeps the configured trail length in CSS pixels for the shared renderer', () => {
  const source = createSource({ trailLengthInPixels: 32 });
  const straightRouteRun = source.next(1, 0)!;

  expect(straightRouteRun.path.id).toBe('right-2-collector');
  expect(straightRouteRun.trailLengthInPixels).toBe(32);
});

it('floors and caps concurrent beam slots', () => {
  expect(createSource({ maxConcurrentBeams: 2.9 }).slots).toBe(2);
  expect(createSource({ maxConcurrentBeams: 99 }).slots).toBe(12);
  expect(createSource({ maxConcurrentBeams: -1 }).slots).toBe(0);
});
