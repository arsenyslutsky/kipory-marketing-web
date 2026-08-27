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
import { normalizedPointToWorld } from './resolveFlowLayer3D';

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

it('projects normalized left and top points to the matching screen edges', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { value: 640 },
    clientWidth: { value: 320 },
  });
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
    container,
    paths: [],
  });

  const firstFrame = animationFrames.shift();
  if (!firstFrame) throw new Error('Expected the first animation frame.');
  firstFrame(1000);
  const camera = renderer.render.mock.calls[0]?.[1] as THREE.OrthographicCamera | undefined;
  if (!camera) throw new Error('Expected the orthographic camera to render.');
  camera.updateMatrixWorld();
  const left = new THREE.Vector3(...normalizedPointToWorld([0.15, 0.5], {
    aspectRatio: 0.5,
    worldHeight: 20,
  })).project(camera);
  const right = new THREE.Vector3(...normalizedPointToWorld([0.75, 0.5], {
    aspectRatio: 0.5,
    worldHeight: 20,
  })).project(camera);
  const top = new THREE.Vector3(...normalizedPointToWorld([0.5, 0.15], {
    aspectRatio: 0.5,
    worldHeight: 20,
  })).project(camera);
  const bottom = new THREE.Vector3(...normalizedPointToWorld([0.5, 0.75], {
    aspectRatio: 0.5,
    worldHeight: 20,
  })).project(camera);

  expect(left.x).toBeLessThan(right.x);
  expect(top.y).toBeGreaterThan(bottom.y);

  controller.destroy();
});

it('keeps delayed trail and packet hidden until the exact delay boundary', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(
    new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const path = { id: 'delayed-route', points: [[0, 0.5], [1, 0.5]] } as const;
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
      next: () => ({ delayMs: 250, durationMs: 1000, id: 'delayed-run', path }),
    },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    paths: [path],
  });
  const beam = vi.mocked(createBeam3DObject).mock.results[0]?.value;
  if (!beam) throw new Error('Expected the delayed beam to be created.');

  const initialFrame = animationFrames.shift();
  if (!initialFrame) throw new Error('Expected the initial animation frame.');
  initialFrame(1000);
  const beforeBoundaryFrame = animationFrames.shift();
  if (!beforeBoundaryFrame) throw new Error('Expected the pre-boundary animation frame.');
  beforeBoundaryFrame(1249);

  expect(beam.uniforms.uProgress.value).toBeCloseTo(0);
  expect(beam.uniforms.uVisibility.value).toBe(0);
  expect(beam.packet.material.opacity).toBe(0);

  const boundaryFrame = animationFrames.shift();
  if (!boundaryFrame) throw new Error('Expected the boundary animation frame.');
  boundaryFrame(1250);

  expect(beam.uniforms.uProgress.value).toBeCloseTo(0);
  expect(beam.uniforms.uVisibility.value).toBe(1);
  expect(beam.packet.material.opacity).toBe(1);

  controller.destroy();
});

it('renders a completed path before assigning the next run and keeps the next run on schedule', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(
    new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const firstPath = { id: 'first-route', points: [[0, 0.25], [1, 0.25]] } as const;
  const nextPath = { id: 'next-route', points: [[0, 0.75], [1, 0.75]] } as const;
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
        durationMs: generation === 0 ? 100 : 1000,
        id: `run:${generation}`,
        path: generation === 0 ? firstPath : nextPath,
      }),
    },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    paths: [firstPath, nextPath],
  });
  const beam = vi.mocked(createBeam3DObject).mock.results[0]?.value;
  if (!beam) throw new Error('Expected the transitioning beam to be created.');
  const setPath = vi.spyOn(beam, 'setPath');

  const initialFrame = animationFrames.shift();
  if (!initialFrame) throw new Error('Expected the initial animation frame.');
  initialFrame(1000);
  const completionFrame = animationFrames.shift();
  if (!completionFrame) throw new Error('Expected the completion animation frame.');
  completionFrame(1101);

  expect(beam.uniforms.uProgress.value).toBeCloseTo(1);
  expect(setPath).not.toHaveBeenCalled();

  const nextRunFrame = animationFrames.shift();
  if (!nextRunFrame) throw new Error('Expected the next-run animation frame.');
  nextRunFrame(1116);

  expect(setPath).toHaveBeenCalledOnce();
  expect(beam.uniforms.uProgress.value).toBeCloseTo(0.016);
  expect(beam.position.z).toBeCloseTo(5);

  controller.destroy();
});

it('applies a run-specific trail length and restores the shared fallback for later runs', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(
    new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const path = { id: 'trail-route', points: [[0, 0.5], [1, 0.5]] } as const;
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
        durationMs: generation === 0 ? 100 : 1000,
        id: `trail-run:${generation}`,
        path,
        ...(generation === 0 ? { trailLength: 0.25 } : {}),
      }),
    },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    paths: [path],
  });
  const beam = vi.mocked(createBeam3DObject).mock.results[0]?.value;
  if (!beam) throw new Error('Expected the trail beam to be created.');

  expect(beam.core.material.uniforms.uTrailLength.value).toBe(0.25);

  const initialFrame = animationFrames.shift();
  if (!initialFrame) throw new Error('Expected the initial animation frame.');
  initialFrame(1000);
  const completionFrame = animationFrames.shift();
  if (!completionFrame) throw new Error('Expected the completion animation frame.');
  completionFrame(1101);
  const nextRunFrame = animationFrames.shift();
  if (!nextRunFrame) throw new Error('Expected the next-run animation frame.');
  nextRunFrame(1116);

  expect(beam.core.material.uniforms.uTrailLength.value).toBe(0.38);

  controller.destroy();
});

it('applies start and end continuation fading to both trail and packet visibility', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(
    new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const path = { id: 'faded-route', points: [[0.5, 0], [0.5, 1]] } as const;
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
      next: () => ({
        delayMs: 0,
        durationMs: 1000,
        fade: { endFromProgress: 0.8, startUntilProgress: 0.2 },
        id: 'faded-run',
        path,
      }),
    },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    paths: [path],
  });
  const beam = vi.mocked(createBeam3DObject).mock.results[0]?.value;
  if (!beam) throw new Error('Expected the fading beam to be created.');

  const renderAt = (timestamp: number) => {
    const frame = animationFrames.shift();
    if (!frame) throw new Error(`Expected an animation frame at ${timestamp}ms.`);
    frame(timestamp);
  };

  renderAt(1000);
  expect(beam.uniforms.uVisibility.value).toBe(0);
  expect(beam.packet.material.opacity).toBe(0);

  renderAt(1100);
  expect(beam.uniforms.uVisibility.value).toBeCloseTo(0.5);
  expect(beam.packet.material.opacity).toBeCloseTo(0.5);

  renderAt(1200);
  expect(beam.uniforms.uVisibility.value).toBe(1);
  expect(beam.packet.material.opacity).toBe(1);

  renderAt(1900);
  expect(beam.uniforms.uVisibility.value).toBeCloseTo(0.5);
  expect(beam.packet.material.opacity).toBeCloseTo(0.5);

  renderAt(2000);
  expect(beam.uniforms.uVisibility.value).toBe(0);
  expect(beam.packet.material.opacity).toBe(0);

  controller.destroy();
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
