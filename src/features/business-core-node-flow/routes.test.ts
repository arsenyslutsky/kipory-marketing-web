import { expect, it } from 'vitest';
import {
  createBusinessCoreNodeFlowBeamSource,
  createBusinessCoreNodeFlowPaths,
} from './routes';

it('fans fading connector paths from all square borders toward the core', () => {
  const paths = createBusinessCoreNodeFlowPaths(4);

  expect(paths).toHaveLength(4);
  expect(paths.map((path) => path.points)).toEqual([
    [[0.5, 0], [0.5, 0.18], [0.5, 0.5]],
    [[1, 0.5], [0.82, 0.5], [0.5, 0.5]],
    [[0.5, 1], [0.5, 0.82], [0.5, 0.5]],
    [[0, 0.5], [0.18, 0.5], [0.5, 0.5]],
  ]);
  expect(paths.every((path) => path.fading)).toBe(true);
});

it('sends beams outward and fades them as they reach each border', () => {
  const paths = createBusinessCoreNodeFlowPaths(4);
  const source = createBusinessCoreNodeFlowBeamSource({
    emissionRandomness: 0,
    maxConcurrentBeams: 4,
    paths,
    showAuxiliaryNodes: true,
    speed: 1,
    trailLengthInIllustrationUnits: 80,
  });
  const run = source.next(0, 0)!;

  expect(run.path.points).toEqual([[0.5, 0.5], [0.5, 0.18], [0.5, 0]]);
  expect(run.fade).toEqual({ endFromProgress: 0.78 });
  expect(run.arrivals).toEqual([{
    id: 'auxiliary-1',
    point: [0.5, 0.18],
    progress: 0.64,
  }]);
  expect(run.trailLength).toBeCloseTo(0.16);
});

it('omits processing stops when auxiliary nodes are hidden', () => {
  const source = createBusinessCoreNodeFlowBeamSource({
    emissionRandomness: 0,
    maxConcurrentBeams: 3,
    paths: createBusinessCoreNodeFlowPaths(3),
    showAuxiliaryNodes: false,
    speed: 1,
  });

  expect(source.next(0, 0)?.arrivals).toEqual([]);
});

it('caps beam slots to the normalized connection count', () => {
  const paths = createBusinessCoreNodeFlowPaths(99);
  const source = createBusinessCoreNodeFlowBeamSource({
    emissionRandomness: 0,
    maxConcurrentBeams: 99,
    paths,
    showAuxiliaryNodes: true,
    speed: 1,
  });

  expect(paths).toHaveLength(24);
  expect(source.slots).toBe(24);
  expect(source.next(-1, 0)).toBeNull();
  expect(source.next(24, 0)).toBeNull();
});
