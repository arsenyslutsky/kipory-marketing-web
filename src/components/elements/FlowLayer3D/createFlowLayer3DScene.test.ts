import { afterEach, expect, it, vi } from 'vitest';

const renderer = vi.hoisted(() => ({
  capabilities: { getMaxAnisotropy: vi.fn(() => 1) },
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  shadowMap: { enabled: false, needsUpdate: false, type: undefined as number | undefined },
}));

const cssRenderer = vi.hoisted(() => ({
  domElement: document.createElement('div'),
  render: vi.fn(),
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

vi.mock('three/addons/renderers/CSS3DRenderer.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three/addons/renderers/CSS3DRenderer.js')>();
  return {
    ...actual,
    CSS3DRenderer: vi.fn(function MockCSS3DRenderer() {
      return cssRenderer;
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

vi.mock('./createFlowLayer3DNodes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./createFlowLayer3DNodes')>();
  return { ...actual, createFlowLayer3DNodes: vi.fn(actual.createFlowLayer3DNodes) };
});

vi.mock('./createFlowLayer3DObjects', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./createFlowLayer3DObjects')>();
  return { ...actual, createFlowLayer3DObjects: vi.fn(actual.createFlowLayer3DObjects) };
});

vi.mock('../Node3D/node3DGradientTextureCache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../Node3D/node3DGradientTextureCache')>();
  return { ...actual, disposeNode3DGradientTextures: vi.fn(actual.disposeNode3DGradientTextures) };
});

import * as THREE from 'three';
import {
  createBeam3DFlareTexture,
  createBeam3DObject,
} from '../Beam3D/createBeam3DObject';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { disposeNode3DGradientTextures } from '../Node3D/node3DGradientTextureCache';
import { createFlowLayer3DNodes, type FlowLayer3DNodes } from './createFlowLayer3DNodes';
import { createFlowLayer3DObjects, type FlowLayer3DObjects } from './createFlowLayer3DObjects';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';
import { normalizedPointToWorld } from './resolveFlowLayer3D';

afterEach(() => {
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.needsUpdate = false;
  renderer.shadowMap.type = undefined;
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
    cssLayer: document.createElement('div'),
    paths: [],
  })).toThrow('pixel-ratio setup failed');

  expect(renderer.dispose).toHaveBeenCalledOnce();
});

it('renders and disposes soft lower-right shadows beneath flow nodes', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<svg xmlns="http://www.w3.org/2000/svg" />',
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
    cssLayer: document.createElement('div'),
    nodes: [
      {
        cardDepth: 40,
        height: 12,
        icon: 'rectangle.svg',
        iconColor: '#f3f5ef',
        iconOpacity: 1,
        id: 'rectangle',
        position: [0.25, 0.4],
        shape: 'rectangle',
        tier: 1,
        width: 48,
      },
      {
        cardDepth: 40,
        height: 12,
        icon: 'circle.svg',
        iconColor: '#f3f5ef',
        iconOpacity: 1,
        id: 'circle',
        position: [0.75, 0.6],
        shape: 'circle',
        tier: 1,
        width: 48,
      },
    ],
    nodeStyle: {
      assetBasePath: '/assets/nodes',
      frontGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
      mode: 'dark',
      nodeCornerRadius: 12,
      outlineOpacity: 0,
      outlineWidth: 1,
      progressBarHeight: 8,
      progressMode: 'outline',
      progressPadding: 2,
      sideXGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
      sideZGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
    },
    paths: [],
  });

  const firstFrame = animationFrames.shift();
  if (!firstFrame) throw new Error('Expected the first animation frame.');
  firstFrame(1000);

  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  if (!scene) throw new Error('Expected the flow scene to render.');
  const light = scene.children.find((object): object is THREE.DirectionalLight => (
    object instanceof THREE.DirectionalLight
  ));
  const catcher = scene.children.find((object): object is THREE.Mesh => (
    object instanceof THREE.Mesh && object.material instanceof THREE.ShadowMaterial
  ));
  if (!light || !catcher || !(catcher.material instanceof THREE.ShadowMaterial)) {
    throw new Error('Expected a directional shadow light and receiving plane.');
  }

  expect(renderer.shadowMap.enabled).toBe(true);
  expect(renderer.shadowMap.needsUpdate).toBe(true);
  expect(renderer.shadowMap.type).toBe(THREE.VSMShadowMap);
  expect(light.castShadow).toBe(true);
  expect(light.position.x).toBeLessThan(0);
  expect(light.position.y).toBeGreaterThan(0);
  expect(light.position.z).toBeLessThan(0);
  expect(catcher.receiveShadow).toBe(true);
  expect(catcher.position.y).toBeLessThan(0.29);
  expect(catcher.material.transparent).toBe(true);
  expect(catcher.material.opacity).toBeGreaterThan(0);

  const flowNodes = vi.mocked(createFlowLayer3DNodes).mock.results[0]?.value?.nodes as FlowLayer3DNodes['nodes'] | undefined;
  if (!flowNodes) throw new Error('Expected the representative flow nodes to render.');
  const rectangleBody = flowNodes[0]?.children.find((object): object is THREE.Mesh => (
    object instanceof THREE.Mesh && object.geometry.type === 'RoundedBoxGeometry'
  ));
  const circleBody = flowNodes[1]?.children.find((object): object is THREE.Mesh => (
    object instanceof THREE.Mesh && object.geometry.type === 'CylinderGeometry'
  ));
  expect(rectangleBody?.castShadow).toBe(true);
  expect(circleBody?.castShadow).toBe(true);

  const disposeGeometry = vi.spyOn(catcher.geometry, 'dispose');
  const disposeMaterial = vi.spyOn(catcher.material, 'dispose');
  const disposeShadowMap = vi.fn();
  const disposeShadowMapPass = vi.fn();
  light.shadow.map = { dispose: disposeShadowMap } as unknown as THREE.WebGLRenderTarget;
  light.shadow.mapPass = { dispose: disposeShadowMapPass } as unknown as THREE.WebGLRenderTarget;
  controller.destroy();

  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
  expect(disposeShadowMap).toHaveBeenCalledOnce();
  expect(disposeShadowMapPass).toHaveBeenCalledOnce();
});

it('keeps every visible edge inside the directional-light shadow frustum in a wide viewport', () => {
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
    clientHeight: { value: 320 },
    clientWidth: { value: 1600 },
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
    cssLayer: document.createElement('div'),
    paths: [],
  });

  const firstFrame = animationFrames.shift();
  if (!firstFrame) throw new Error('Expected the first animation frame.');
  firstFrame(1000);
  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  const light = scene?.children.find((object): object is THREE.DirectionalLight => (
    object instanceof THREE.DirectionalLight
  ));
  if (!scene || !light) throw new Error('Expected the flow scene shadow light to render.');

  scene.updateMatrixWorld(true);
  light.shadow.updateMatrices(light);
  const shadowCamera = light.shadow.camera;
  const visibleCorners = [
    new THREE.Vector3(-50, 0, -10),
    new THREE.Vector3(-50, 0, 10),
    new THREE.Vector3(50, 0, -10),
    new THREE.Vector3(50, 0, 10),
  ];

  visibleCorners.forEach((corner) => {
    const projected = corner.clone().project(shadowCamera);
    expect(projected.x).toBeGreaterThanOrEqual(-1);
    expect(projected.x).toBeLessThanOrEqual(1);
    expect(projected.y).toBeGreaterThanOrEqual(-1);
    expect(projected.y).toBeLessThanOrEqual(1);
    expect(projected.z).toBeGreaterThanOrEqual(-1);
    expect(projected.z).toBeLessThanOrEqual(1);
  });

  controller.destroy();
});

it('disposes shadow resources when flow-scene initialization fails', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return {
      disconnect: vi.fn(),
      observe: vi.fn(() => {
        throw new Error('shadow-scene initialization failed');
      }),
    };
  }));
  const disposeGeometry = vi.spyOn(THREE.PlaneGeometry.prototype, 'dispose');
  const disposeMaterial = vi.spyOn(THREE.ShadowMaterial.prototype, 'dispose');

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
    cssLayer: document.createElement('div'),
    paths: [],
  })).toThrow('shadow-scene initialization failed');

  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
});

it('leaves the shared beam flare for scene-level cleanup', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  const flareTexture = new THREE.CanvasTexture(document.createElement('canvas'));
  const disposeFlareTexture = vi.spyOn(flareTexture, 'dispose');
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(flareTexture);
  const path = { id: 'flare-route', points: [[0, 0.5], [1, 0.5]] } as const;
  const controller = createFlowLayer3DScene({
    beam: {
      beamColor: '#449c40',
      beamHighlightColor: '#c9ebc7',
      beamWidth: 1,
      enabled: true,
      glowIntensity: 1,
      trailLength: 0.38,
    },
    beamSource: { slots: 2, next: () => null },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    cssLayer: document.createElement('div'),
    paths: [path],
  });

  controller.destroy();

  expect(disposeFlareTexture).toHaveBeenCalledOnce();
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
    cssLayer: document.createElement('div'),
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
    cssLayer: document.createElement('div'),
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
    cssLayer: document.createElement('div'),
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
    cssLayer: document.createElement('div'),
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
    cssLayer: document.createElement('div'),
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
    cssLayer: document.createElement('div'),
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

it('builds connectors for an initially square viewport', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  const connectors: FlowLayer3DObjects = {
    connectors: [],
    destroy: vi.fn(),
    group: new THREE.Group(),
  };
  vi.mocked(createFlowLayer3DObjects).mockReturnValueOnce(connectors);
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { value: 320 },
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
    cssLayer: document.createElement('div'),
    paths: [],
  });

  expect(createFlowLayer3DObjects).toHaveBeenCalledOnce();

  controller.destroy();
});

it('shares one CSS3D scene, rebuilds nodes for every viewport-size change, and preserves beam slots', () => {
  const animationFrames: FrameRequestCallback[] = [];
  let resize: (() => void) | undefined;
  const disconnect = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver(callback: () => void) {
    resize = callback;
    return { disconnect, observe: vi.fn() };
  }));

  const nodeCssElement = document.createElement('div');
  const nodeCssObject = new CSS3DObject(nodeCssElement);
  const createNodesGroup = (cssObject?: CSS3DObject): FlowLayer3DNodes => {
    const group = new THREE.Group();
    if (cssObject) group.add(cssObject);
    return { destroy: vi.fn(), group, nodes: [] };
  };
  const firstNodes = createNodesGroup(nodeCssObject);
  const secondNodes = createNodesGroup();
  const thirdNodes = createNodesGroup();
  vi.mocked(createFlowLayer3DNodes)
    .mockReturnValueOnce(firstNodes)
    .mockReturnValueOnce(secondNodes)
    .mockReturnValueOnce(thirdNodes);
  const createConnectorGroup = (): FlowLayer3DObjects => ({
    connectors: [],
    destroy: vi.fn(),
    group: new THREE.Group(),
  });
  const firstConnectors = createConnectorGroup();
  const secondConnectors = createConnectorGroup();
  vi.mocked(createFlowLayer3DObjects)
    .mockReturnValueOnce(firstConnectors)
    .mockReturnValueOnce(secondConnectors);
  vi.mocked(createBeam3DFlareTexture).mockReturnValueOnce(
    new THREE.CanvasTexture(document.createElement('canvas')),
  );
  const removeCssRenderer = vi.spyOn(cssRenderer.domElement, 'remove');
  let width = 320;
  let height = 640;
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { get: () => height },
    clientWidth: { get: () => width },
  });
  const cssLayer = document.createElement('div');
  const path = { id: 'route', points: [[0, 0.5], [1, 0.5]] } as const;
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
      next: () => ({ delayMs: 0, durationMs: 1000, id: 'active', path }),
    },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container,
    cssLayer,
    nodeStyle: {
      assetBasePath: '/assets/nodes',
      frontGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
      mode: 'dark',
      nodeCornerRadius: 12,
      outlineOpacity: 0.5,
      outlineWidth: 1,
      progressBarHeight: 8,
      progressMode: 'outline',
      progressPadding: 2,
      sideXGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
      sideZGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
    },
    nodes: [{
      cardDepth: 40,
      height: 12,
      icon: 'server.svg',
      iconColor: '#f3f5ef',
      iconOpacity: 1,
      id: 'server',
      position: [0.2, 0.5],
      shape: 'square',
      tier: 2,
      width: 48,
    }],
    paths: [path],
  });

  expect(CSS3DRenderer).toHaveBeenCalledOnce();
  expect(cssLayer).toContainElement(cssRenderer.domElement);
  expect(renderer.setSize).toHaveBeenCalledWith(320, 640, false);
  expect(cssRenderer.setSize).toHaveBeenCalledWith(320, 640);
  expect(nodeCssElement.style.pointerEvents).toBe('none');

  const firstFrame = animationFrames.shift();
  if (!firstFrame) throw new Error('Expected the first animation frame.');
  firstFrame(1000);
  expect(cssRenderer.render).toHaveBeenCalledWith(...renderer.render.mock.calls[0]!);

  width = 400;
  height = 800;
  resize?.();
  expect(createFlowLayer3DNodes).toHaveBeenCalledTimes(2);
  expect(createFlowLayer3DObjects).toHaveBeenCalledTimes(1);
  expect(firstNodes.destroy).toHaveBeenCalledOnce();

  const beam = vi.mocked(createBeam3DObject).mock.results[0]?.value;
  if (!beam) throw new Error('Expected one active beam slot.');
  const setPath = vi.spyOn(beam, 'setPath');
  width = 640;
  resize?.();
  expect(createFlowLayer3DNodes).toHaveBeenCalledTimes(3);
  expect(createFlowLayer3DObjects).toHaveBeenCalledTimes(2);
  expect(firstConnectors.destroy).toHaveBeenCalledOnce();
  expect(setPath).toHaveBeenCalledOnce();
  expect(createBeam3DObject).toHaveBeenCalledOnce();

  controller.destroy();

  expect(removeCssRenderer).toHaveBeenCalledOnce();
  expect(thirdNodes.destroy).toHaveBeenCalledOnce();
  expect(secondConnectors.destroy).toHaveBeenCalledOnce();
  expect(disposeNode3DGradientTextures).toHaveBeenCalledWith(renderer);
  expect(disconnect).toHaveBeenCalledOnce();
  expect(renderer.dispose).toHaveBeenCalledOnce();
});

it('tears down once and reports a post-mount node rebuild failure from ResizeObserver', () => {
  let resize: (() => void) | undefined;
  const cancelAnimationFrame = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 17));
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver(callback: () => void) {
    resize = callback;
    return { disconnect, observe: vi.fn() };
  }));

  const firstNodes: FlowLayer3DNodes = {
    destroy: vi.fn(),
    group: new THREE.Group(),
    nodes: [],
  };
  vi.mocked(createFlowLayer3DNodes)
    .mockReturnValueOnce(firstNodes)
    .mockImplementationOnce(() => {
      throw new Error('resize node rebuild failed');
    });
  const connectors: FlowLayer3DObjects = {
    connectors: [],
    destroy: vi.fn(),
    group: new THREE.Group(),
  };
  vi.mocked(createFlowLayer3DObjects).mockReturnValueOnce(connectors);
  const onError = vi.fn();
  const removeCssRenderer = vi.spyOn(cssRenderer.domElement, 'remove');
  let width = 320;
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { value: 640 },
    clientWidth: { get: () => width },
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
    cssLayer: document.createElement('div'),
    nodes: [{
      cardDepth: 48,
      height: 10,
      icon: 'server.svg',
      iconColor: '#1d281d',
      iconOpacity: 1,
      id: 'server',
      position: [0.2, 0.5],
      shape: 'square',
      tier: 1,
      width: 48,
    }],
    nodeStyle: {
      assetBasePath: '/assets/nodes',
      frontGradient: { angle: 117, end: '#052f24', mid: '#03492b', start: '#066b43' },
      mode: 'dark',
      nodeCornerRadius: 10,
      outlineOpacity: 0,
      outlineWidth: 1,
      progressBarHeight: 15,
      progressMode: 'outline',
      progressPadding: 1,
      sideXGradient: { angle: 360, end: '#5c899b', mid: '#10402e', start: '#31775a' },
      sideZGradient: { angle: 177, end: '#0e4b81', mid: '#366480', start: '#427298' },
    },
    onError,
    paths: [],
  });

  width = 400;
  expect(() => resize?.()).not.toThrow();

  expect(onError).toHaveBeenCalledOnce();
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({
    message: 'resize node rebuild failed',
  }));
  expect(firstNodes.destroy).toHaveBeenCalledOnce();
  expect(connectors.destroy).toHaveBeenCalledOnce();
  expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(removeCssRenderer).toHaveBeenCalledOnce();
  expect(renderer.dispose).toHaveBeenCalledOnce();

  controller.destroy();

  expect(cancelAnimationFrame).toHaveBeenCalledOnce();
  expect(disconnect).toHaveBeenCalledOnce();
  expect(removeCssRenderer).toHaveBeenCalledOnce();
  expect(renderer.dispose).toHaveBeenCalledOnce();
});
