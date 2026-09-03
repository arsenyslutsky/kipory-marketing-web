import { afterEach, expect, it, vi } from 'vitest';

const renderer = vi.hoisted(() => ({
  capabilities: { getMaxAnisotropy: vi.fn(() => 1) },
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  shadowMap: { autoUpdate: true, enabled: false, needsUpdate: false, type: undefined },
  toneMapping: undefined,
  toneMappingExposure: 1,
}));

const cssRenderer = vi.hoisted(() => ({
  domElement: document.createElement('div'),
  render: vi.fn(),
  setSize: vi.fn(),
}));

const flowPathCaptures = vi.hoisted(() => ({
  beam: [] as number[][],
  connector: [] as number[][],
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

vi.mock('@/components/elements/Connector3D/createConnector3DObject', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/elements/Connector3D/createConnector3DObject')>();
  return {
    ...actual,
    createConnector3DObject: (options: Parameters<typeof actual.createConnector3DObject>[0]) => {
      flowPathCaptures.connector.push(options.path.points.map((point) => point.y));
      return actual.createConnector3DObject(options);
    },
    createFadingConnector3DObject: (options: Parameters<typeof actual.createFadingConnector3DObject>[0]) => {
      flowPathCaptures.connector.push(options.path.points.map((point) => point.y));
      return actual.createFadingConnector3DObject(options);
    },
  };
});

vi.mock('@/components/elements/Beam3D/createBeam3DObject', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/elements/Beam3D/createBeam3DObject')>();
  return {
    ...actual,
    createBeam3DObject: (options: Parameters<typeof actual.createBeam3DObject>[0]) => {
      const beam = actual.createBeam3DObject(options);
      const setPath = beam.setPath;
      beam.setPath = (path) => {
        flowPathCaptures.beam.push(path.points.map((point) => point.y));
        setPath(path);
      };
      return beam;
    },
  };
});

import * as THREE from 'three';
import { defaultColors } from '../config';
import { createSignalFlowScene } from './createSignalFlowScene';
import { getNode3DGradientTexture } from '@/components/elements/Node3D/node3DGradientTextureCache';

afterEach(() => {
  flowPathCaptures.beam.length = 0;
  flowPathCaptures.connector.length = 0;
  renderer.shadowMap.autoUpdate = true;
  renderer.shadowMap.needsUpdate = false;
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  { connectorElevation: 0, nodeScale: 1, safeConnectorHeight: 0.11 },
  { connectorElevation: 1.5, nodeScale: 1, safeConnectorHeight: 0.258 },
  { connectorElevation: 1.5, nodeScale: 3, safeConnectorHeight: 0.038 },
])('keeps connector paths and travelling beams below $nodeScale× node bodies', ({
  connectorElevation,
  nodeScale,
  safeConnectorHeight,
}) => {
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
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    connectorElevation,
    connectorOpacity: 1,
    connectorWidth: 2,
    nodeScale,
    showContinuationConnectors: true,
  });

  animationFrames.shift()?.(1000);

  expect(flowPathCaptures.connector.length).toBeGreaterThan(0);
  expect(flowPathCaptures.beam.length).toBeGreaterThan(0);
  // Reserve 0.012 for floating motion and 0.02 for depth separation.
  expect(flowPathCaptures.connector.flat().every(
    (height) => Math.abs(height - safeConnectorHeight) < 0.000001,
  )).toBe(true);
  expect(flowPathCaptures.beam.flat().every(
    (height) => Math.abs(height - safeConnectorHeight) < 0.000001,
  )).toBe(true);
  controller.destroy();
});

it('waits for activation and uses a scaled WebGL target with layout-sized CSS3D', () => {
  const animationFrames: FrameRequestCallback[] = [];
  const cancelAnimationFrame = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    active: false,
    resolutionScale: 0.7,
  });

  expect(requestAnimationFrame).not.toHaveBeenCalled();
  expect(renderer.setSize).toHaveBeenCalledWith(672, 448, false);
  expect(cssRenderer.setSize).toHaveBeenCalledWith(960, 640);
  expect(renderer.shadowMap.autoUpdate).toBe(false);
  expect(renderer.shadowMap.needsUpdate).toBe(true);

  controller.setActive(true);
  animationFrames.shift()?.(1000);
  expect(renderer.render).toHaveBeenCalledOnce();
  expect(renderer.shadowMap.needsUpdate).toBe(false);
  controller.setActive(false);
  expect(cancelAnimationFrame).toHaveBeenCalled();
  controller.destroy();
});

it('uses the light theme major-grid color for the central grid emphasis', () => {
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
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    gridOpacity: 0.2,
    gridMaskRadius: 800,
    theme: {
      ...defaultColors.light,
      scene: {
        ...defaultColors.light.scene,
        gridMajor: '#123456',
      },
    },
  });

  animationFrames.shift()?.(1000);
  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  let gridMaterial: THREE.ShaderMaterial | undefined;
  scene?.traverse((object) => {
    if (
      object instanceof THREE.LineSegments
      && object.material instanceof THREE.ShaderMaterial
      && object.material.uniforms.uMaskColor
    ) {
      gridMaterial = object.material;
    }
  });

  expect(gridMaterial?.uniforms.uMaskColor.value.getHexString()).toBe('123456');
  controller.destroy();
});

function createSceneOptions() {
  const flow = {
    root: 'root',
    nodes: [
      { id: 'root', position: [0, 0] as [number, number], label: 'Root', size: [2, 1] as [number, number], tier: 0, shape: 'rectangle' as const, svg: 'root.svg' },
      { id: 'leaf', position: [0, 3] as [number, number], label: 'Leaf', size: [2, 1] as [number, number], tier: 1, shape: 'rectangle' as const, svg: 'leaf.svg' },
    ],
    branches: { root: ['leaf'] },
  };
  const theme = defaultColors.light;
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { value: 640 },
    clientWidth: { value: 960 },
  });

  return {
    variant: 'variant-2' as const,
    mode: 'light' as const,
    flow,
    theme,
    assetBasePath: '/assets/nodes',
    interactive: false,
    gridOpacity: 0,
    fogEnabled: true,
    gridDensity: 30,
    gridMaskRadius: 0,
    gridMaskBlur: 0,
    connectorOpacity: 0,
    connectorStroke: 'solid' as const,
    connectorWidth: 0,
    connectorElevation: 0,
    showContinuationConnectors: false,
    pathCurve: 0,
    outlineOpacity: 0,
    outlineWidth: 0,
    nodeScale: 1,
    nodeElevation: 0,
    nodeDepth: 12,
    nodeDepthRandom: 0,
    nodeShape: 'rectangle' as const,
    nodeCornerRadius: 10,
    nodeIconOpacity: 0.9,
    nodeFrontGradientAngle: 32,
    nodeSideXGradientAngle: 18,
    nodeSideZGradientAngle: 18,
    perspectiveEffect: 0,
    cameraPitch: 45,
    cameraZoom: 1,
    emitterX: 0.45,
    emitterY: -4.25,
    minDelay: 0,
    maxDelay: 0,
    speed: 1,
    nodeProgressMode: 'bar' as const,
    progressPadding: 1,
    progressBarHeight: 8,
    concurrentBeams: 1,
    minEmitDelay: 0,
    maxEmitDelay: 0,
    reducedMotion: true,
    elements: {
      canvas: document.createElement('canvas'),
      container,
      cssLayer: document.createElement('div'),
    },
  };
}

it('applies configurable node-shadow parameters to the light and catcher', () => {
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
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    nodeShadowBias: -0.001,
    nodeShadowBlurSamples: 11,
    nodeShadowColor: '#123456',
    nodeShadowLightX: -4,
    nodeShadowLightY: 9,
    nodeShadowLightZ: 3,
    nodeShadowNormalBias: 0.04,
    nodeShadowOpacity: 0.37,
    nodeShadowRadius: 6,
  });

  animationFrames.shift()?.(1000);
  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  const light = scene?.children.find((object): object is THREE.DirectionalLight => (
    object instanceof THREE.DirectionalLight
  ));
  const catcher = scene?.children.find((object): object is THREE.Mesh => (
    object instanceof THREE.Mesh && object.material instanceof THREE.ShadowMaterial
  ));
  if (!light || !catcher || !(catcher.material instanceof THREE.ShadowMaterial)) {
    throw new Error('Expected a configurable node-shadow light and catcher.');
  }

  expect(light.position.toArray()).toEqual([-4, 9, 3]);
  expect(light.shadow.bias).toBe(-0.001);
  expect(light.shadow.normalBias).toBe(0.04);
  expect(light.shadow.radius).toBe(6);
  expect(light.shadow.blurSamples).toBe(11);
  expect(catcher.material.color.getHexString()).toBe('123456');
  expect(catcher.material.opacity).toBe(0.37);
  controller.destroy();
});

it('finalizes managed gradient textures through BusinessFlow renderer teardown', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene(createSceneOptions());
  const replacement = new THREE.CanvasTexture(document.createElement('canvas'));
  const gradientKey = [
    32,
    defaultColors.light.scene.cardHighlight,
    defaultColors.light.scene.card,
    defaultColors.light.scene.cardShadow,
  ].join('|');
  const originalTexture = getNode3DGradientTexture(renderer as unknown as THREE.WebGLRenderer, gradientKey, () => replacement);
  const disposeTexture = vi.spyOn(originalTexture, 'dispose');

  controller.destroy();

  expect(disposeTexture).toHaveBeenCalledOnce();
  expect(getNode3DGradientTexture(
    renderer as unknown as THREE.WebGLRenderer,
    gradientKey,
    () => replacement,
  )).toBe(replacement);
  expect(renderer.dispose).toHaveBeenCalledOnce();
});

it('reports readiness once after the first WebGL and CSS3D frame completes', () => {
  const animationFrames: FrameRequestCallback[] = [];
  const onReady = vi.fn();
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D);

  const controller = createSignalFlowScene({
    ...createSceneOptions(),
    onReady,
  });

  expect(onReady).not.toHaveBeenCalled();
  animationFrames.shift()?.(1000);
  expect(renderer.render).toHaveBeenCalledOnce();
  expect(cssRenderer.render).toHaveBeenCalledOnce();
  expect(onReady).toHaveBeenCalledOnce();

  animationFrames.shift()?.(1016);
  expect(onReady).toHaveBeenCalledOnce();
  controller.destroy();
});
