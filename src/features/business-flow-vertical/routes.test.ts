import { expect, it } from 'vitest';
import {
  createBusinessFlowVerticalBeamSource,
  createBusinessFlowVerticalPaths,
} from './routes';

const satellites = [[20, 18], [80, 18], [20, 82], [80, 82]] as const;

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
  const source = createBusinessFlowVerticalBeamSource({
    connectorRadius: 1.75,
    emissionRandomness: 0,
    maxConcurrentBeams: 4,
    random: () => 0.5,
    satellitePoints: satellites,
    showContinuationConnectors: false,
    speed: 1,
  });
  expect(source.slots).toBe(4);
  expect(source.next(0, 0)?.delayMs).toBe(0);
  expect(source.next(1, 0)?.delayMs).toBe(280);
  const run = source.next(0, 0)!;
  expect(run.arrivals?.at(-1)?.progress).toBe(1);
  expect(run.durationMs).toBeGreaterThanOrEqual(1500);
  expect(run.durationMs).toBeLessThanOrEqual(4300);
});
