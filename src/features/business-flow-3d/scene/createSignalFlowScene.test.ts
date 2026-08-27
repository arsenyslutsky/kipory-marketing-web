import { afterEach, expect, it, vi } from 'vitest';

const renderer = vi.hoisted(() => ({
  capabilities: { getMaxAnisotropy: vi.fn(() => 1) },
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  shadowMap: { enabled: false, type: undefined },
  toneMapping: undefined,
  toneMappingExposure: 1,
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

import * as THREE from 'three';
import { defaultColors } from '../config';
import { createSignalFlowScene } from './createSignalFlowScene';
import { getNode3DGradientTexture } from '@/components/elements/Node3D/node3DGradientTextureCache';

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
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
    showContinuationConnectors: false,
    pathCurve: 0,
    outlineOpacity: 0,
    outlineWidth: 0,
    nodeScale: 1,
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
