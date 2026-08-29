import { expect, it } from 'vitest';
import { resolveFlowLayer3DNode } from './resolveFlowLayer3DNode';

const node = {
  cardDepth: 40,
  height: 12,
  icon: 'server.svg',
  iconColor: '#fff',
  iconOpacity: 0.8,
  id: 'server',
  position: [0.2, 0.5],
  shape: 'square',
  tier: 1,
  width: 48,
} as const;

it('maps normalized position and CSS-pixel dimensions into world units', () => {
  expect(resolveFlowLayer3DNode(node, {
    aspectRatio: 0.5,
    viewportHeight: 640,
    worldHeight: 20,
  })).toMatchObject({
    cardDepth: 1.25,
    height: 0.375,
    position: [-3, 0],
    width: 1.5,
  });
});

it('rejects non-finite positions and non-positive dimensions', () => {
  expect(resolveFlowLayer3DNode({ ...node, width: 0 }, {
    aspectRatio: 1, viewportHeight: 640,
  })).toBeNull();
  expect(resolveFlowLayer3DNode({ ...node, position: [Number.NaN, 0.5] }, {
    aspectRatio: 1, viewportHeight: 640,
  })).toBeNull();
});
