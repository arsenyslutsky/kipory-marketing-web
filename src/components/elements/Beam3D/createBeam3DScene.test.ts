import { afterEach, beforeEach, expect, it, vi } from 'vitest';

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

vi.mock('three/addons/controls/OrbitControls.js', () => ({
  OrbitControls: vi.fn(function MockOrbitControls() {
    return {
      dispose: vi.fn(),
      target: { copy: vi.fn() },
      update: vi.fn(),
    };
  }),
}));

vi.mock('./createBeam3DObject', async () => {
  const THREE = await import('three');
  return {
    createBeam3DFlareTexture: vi.fn(() => new THREE.Texture()),
    createBeam3DObject: vi.fn(() => ({
      group: new THREE.Group(),
      setVisible: vi.fn(),
      update: vi.fn(),
    })),
  };
});

import { businessFlowPalettes } from '@/features/business-flow-palette';
import {
  createBeam3DFlareTexture,
  createBeam3DObject,
} from './createBeam3DObject';
import { createBeam3DScene } from './createBeam3DScene';
import type { Beam3DMode, Beam3DSceneOptions } from './types';

const darkFlareStops = ['#000001', '#000002', '#000003', '#000004', '#000005'] as const;
const lightFlareStops = ['#fffff1', '#fffff2', '#fffff3', '#fffff4', '#fffff5'] as const;
const originalDarkFlareStops = [...businessFlowPalettes.dark.flareStops];
const originalLightFlareStops = [...businessFlowPalettes.light.flareStops];

function replaceFlareStops(target: readonly string[], source: readonly string[]) {
  source.forEach((stop, index) => {
    (target as string[])[index] = stop;
  });
}

function sceneOptions(mode: Beam3DMode): Beam3DSceneOptions {
  return {
    beamColor: '#449c40',
    beamWidth: 1,
    cameraPitch: 33.19,
    cameraYaw: 0,
    cameraZoom: 1,
    delayBeforeDissapear: 0,
    direction: 'forward',
    elements: {
      canvas: document.createElement('canvas'),
      container: document.createElement('div'),
    },
    flareColor: '#ffffff',
    glowIntensity: 1,
    highlightColor: '#c9ebc7',
    interactive: false,
    mode,
    packetColor: '#ffffff',
    packetCoreShape: 'circle',
    packetCoreSize: 1,
    packetHaloBlur: 0,
    packetHaloColor: '#449c40',
    packetHaloSize: 1,
    packetShadow: 0,
    packetVisible: true,
    path: {
      interpolation: 'linear',
      points: [[0, 0, 0], [1, 0, 0]],
    },
    perspectiveEffect: 75,
    playing: false,
    progress: 0.5,
    softness: 0.05,
    speed: 1,
    startFade: 0,
    style: 'ribbon',
    trailLength: 0.38,
    visibility: 1,
  };
}

beforeEach(() => {
  replaceFlareStops(businessFlowPalettes.dark.flareStops, darkFlareStops);
  replaceFlareStops(businessFlowPalettes.light.flareStops, lightFlareStops);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
});

afterEach(() => {
  replaceFlareStops(businessFlowPalettes.dark.flareStops, originalDarkFlareStops);
  replaceFlareStops(businessFlowPalettes.light.flareStops, originalLightFlareStops);
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it.each([
  ['dark', darkFlareStops],
  ['light', lightFlareStops],
] as const)('uses the %s palette flare stops throughout scene construction', (mode, flareStops) => {
  const controller = createBeam3DScene(sceneOptions(mode));

  expect(createBeam3DFlareTexture).toHaveBeenCalledWith(flareStops);
  expect(createBeam3DObject).toHaveBeenCalledWith(expect.objectContaining({
    colors: expect.objectContaining({ flareStops }),
    mode,
  }));

  controller.destroy();
});
