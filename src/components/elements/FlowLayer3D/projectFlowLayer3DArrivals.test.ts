import * as THREE from 'three';
import { expect, it } from 'vitest';
import { resolveFlowPath3D } from '../FlowPath3D/resolveFlowPath3D';
import { normalizedPointToWorld, resolveFlowLayer3DPath } from './resolveFlowLayer3D';
import { projectFlowLayer3DArrivals } from './projectFlowLayer3DArrivals';

it('projects arrival progress onto the same rounded world-space path rendered by the beam', () => {
  const route = {
    curve: 80,
    id: 'rounded',
    points: [[0.1, 0.2], [0.7, 0.2], [0.7, 0.9]] as const,
  };
  const resolved = resolveFlowLayer3DPath(route, { aspectRatio: 2, worldHeight: 20 });
  if (!resolved) throw new Error('Expected a resolved route.');
  const path = resolveFlowPath3D(resolved.path);

  const [arrival] = projectFlowLayer3DArrivals(
    [{ id: 'corner', point: [0.7, 0.2] as const, progress: 0.5 }],
    path,
    { aspectRatio: 2, worldHeight: 20 },
  );
  const target = new THREE.Vector3(...normalizedPointToWorld(
    [0.7, 0.2],
    { aspectRatio: 2, worldHeight: 20 },
  ));

  expect(arrival.progress).not.toBe(0.5);
  expect(path.curve.getPointAt(arrival.progress).distanceToSquared(target)).toBeLessThan(
    path.curve.getPointAt(0.5).distanceToSquared(target),
  );
});

it('keeps projected progress finite for degenerate path segments', () => {
  const path = resolveFlowPath3D({
    interpolation: 'linear',
    points: [[0, 0, 0], [0, 0, 0], [1, 0, 0]],
  });

  const [arrival] = projectFlowLayer3DArrivals(
    [{ id: 'target', point: [0.75, 0.5], progress: Number.NaN }],
    path,
    { aspectRatio: 1, worldHeight: 20 },
  );

  expect(Number.isFinite(arrival.progress)).toBe(true);
  expect(arrival.progress).toBeGreaterThanOrEqual(0);
  expect(arrival.progress).toBeLessThanOrEqual(1);
});
