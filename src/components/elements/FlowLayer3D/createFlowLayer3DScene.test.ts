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

vi.mock('../Beam3D/createBeam3DObject', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../Beam3D/createBeam3DObject')>();
  return {
    ...actual,
    createBeam3DFlareTexture: vi.fn(actual.createBeam3DFlareTexture),
    createBeam3DObject: vi.fn(actual.createBeam3DObject),
  };
});

import * as THREE from 'three';
import {
  createBeam3DFlareTexture,
  createBeam3DObject,
} from '../Beam3D/createBeam3DObject';
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

it('starts beam timing at zero and advances by the animation-frame delta without a deprecated clock warning', () => {
  const animationFrames: FrameRequestCallback[] = [];
  const disconnect = vi.fn();
  const observe = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect, observe };
  }));
  vi.spyOn(performance, 'now').mockReturnValue(400);
  const timerUpdate = vi.spyOn(THREE.Timer.prototype, 'update');
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(
    new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const path = { id: 'timed-route', points: [[0, 0.5], [1, 0.5]] } as const;

  const controller = createFlowLayer3DScene({
    beam: {
      beamColor: '#449c40',
      beamHighlightColor: '#c9ebc7',
      beamWidth: 1,
      enabled: true,
      glowIntensity: 1,
      trailLength: 0.38,
    },
    beamSource: {
      slots: 1,
      next: (_slot, generation) => ({
        delayMs: 0,
        durationMs: 1000,
        id: `timed-run:${generation}`,
        path,
      }),
    },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    paths: [path],
  });

  const beam = vi.mocked(createBeam3DObject).mock.results[0]?.value;
  if (!beam) throw new Error('Expected the timed beam to be created.');
  const firstFrame = animationFrames.shift();
  if (!firstFrame) throw new Error('Expected the first animation frame.');
  firstFrame(1000);

  expect(renderer.render).toHaveBeenCalledOnce();
  expect(timerUpdate).toHaveBeenCalledOnce();
  expect(beam.uniforms.uTime.value).toBe(0);
  expect(beam.uniforms.uProgress.value).toBe(0);

  const secondFrame = animationFrames.shift();
  if (!secondFrame) throw new Error('Expected the second animation frame.');
  secondFrame(1200);

  expect(renderer.render).toHaveBeenCalledTimes(2);
  expect(timerUpdate).toHaveBeenCalledTimes(2);
  expect(beam.uniforms.uTime.value).toBeCloseTo(0.2);
  expect(beam.uniforms.uProgress.value).toBeCloseTo(0.2);
  expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('THREE.Clock'));

  controller.destroy();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(renderer.dispose).toHaveBeenCalledOnce();
});
