import { describe, expect, it } from 'vitest';
import { normalizedPointToWorld, resolveFlowLayer3DPath } from './resolveFlowLayer3D';

describe('normalizedPointToWorld', () => {
  it('maps top-view coordinates into an aspect-correct X/Z plane', () => {
    expect(normalizedPointToWorld([0, 0], { aspectRatio: 2, worldHeight: 10 }))
      .toEqual([-10, 0, -5]);
    expect(normalizedPointToWorld([1, 1], { aspectRatio: 2, worldHeight: 10 }))
      .toEqual([10, 0, 5]);
    expect(normalizedPointToWorld([0.5, 0.5], { aspectRatio: 2, worldHeight: 10 }))
      .toEqual([0, 0, 0]);
  });
});

describe('resolveFlowLayer3DPath', () => {
  it('maps points and preserves route settings', () => {
    expect(resolveFlowLayer3DPath({
      id: 'route-a', curve: 48,
      points: [[0, 0.5], [0.5, 0.5], [0.5, 1]],
    }, { aspectRatio: 1, worldHeight: 20 })).toEqual({
      id: 'route-a',
      fading: false,
      path: {
        curve: 48,
        interpolation: 'linear',
        points: [[-10, 0, 0], [0, 0, 0], [0, 0, 10]],
      },
    });
  });

  it('returns null for fewer than two distinct points', () => {
    expect(resolveFlowLayer3DPath({ id: 'empty', points: [] }, { aspectRatio: 1 })).toBeNull();
    expect(resolveFlowLayer3DPath({
      id: 'duplicate', points: [[0.5, 0.5], [0.5, 0.5]],
    }, { aspectRatio: 1 })).toBeNull();
  });
});
