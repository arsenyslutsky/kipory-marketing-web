import { afterEach, expect, it, vi } from 'vitest';

const renderer = vi.hoisted(() => ({
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(() => {
    throw new Error('pixel-ratio setup failed');
  }),
  setSize: vi.fn(),
}));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: vi.fn(function MockWebGLRenderer() {
      return renderer;
    }),
  };
});

import { createFlowLayer3DScene } from './createFlowLayer3DScene';

afterEach(() => vi.clearAllMocks());

it('disposes the renderer when renderer configuration fails', () => {
  expect(() => createFlowLayer3DScene({
    beam: {
      beamColor: '#449c40',
      beamHighlightColor: '#c9ebc7',
      beamWidth: 1,
      enabled: false,
      glowIntensity: 1,
      trailLength: 0.38,
    },
    beamSource: { slots: 0, next: () => null },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    paths: [],
  })).toThrow('pixel-ratio setup failed');

  expect(renderer.dispose).toHaveBeenCalledOnce();
});
