import { afterEach, expect, it, vi } from 'vitest';

const renderer = vi.hoisted(() => ({
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(),
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it('disposes the renderer when renderer configuration fails', () => {
  renderer.setPixelRatio.mockImplementationOnce(() => {
    throw new Error('pixel-ratio setup failed');
  });

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

it('renders an animation frame without a deprecated clock warning', () => {
  let animationFrame: FrameRequestCallback | undefined;
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrame = callback;
    return 17;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect, observe };
  }));
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  const controller = createFlowLayer3DScene({
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
  });

  expect(animationFrame).toBeTypeOf('function');
  animationFrame?.(250);
  expect(renderer.render).toHaveBeenCalledOnce();
  expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('THREE.Clock'));

  controller.destroy();
  expect(disconnect).toHaveBeenCalledOnce();
});
