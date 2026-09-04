import * as THREE from 'three';
import { afterEach, expect, it, vi } from 'vitest';
import { defaultColors } from '@/features/business-flow-3d/config';
import { createNode3DObject } from './createNode3DObject';
import { disposeNode3DGradientTextures } from './node3DGradientTextureCache';
import { styleNode3DIconSvg } from './styleNode3DIconSvg';

vi.mock('./styleNode3DIconSvg', () => ({
  styleNode3DIconSvg: vi.fn(),
}));

const gradient = { angle: 117, end: '#052f24', mid: '#03492b', start: '#066b43' };

afterEach(() => {
  vi.mocked(styleNode3DIconSvg).mockClear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('uses the solid fill fallback when the node icon fill mode is omitted', async () => {
  const renderer = {
    capabilities: { getMaxAnisotropy: () => 1 },
  } as THREE.WebGLRenderer;
  const context = {
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000"/></svg>',
  }));

  createNode3DObject({
    assetBasePath: '/assets/nodes',
    cardDepth: 40,
    fogEnabled: false,
    frontGradient: gradient,
    height: 10,
    icon: 'solid-fallback-test.svg',
    iconColor: '#123456',
    iconOpacity: 1,
    id: 'solid-fallback',
    isDark: true,
    isVariant2: true,
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
    position: [0, 0],
    progressBarHeight: 15,
    progressMode: 'outline',
    progressPadding: 1,
    renderer,
    scale: 1,
    shape: 'square',
    sideXGradient: gradient,
    sideZGradient: gradient,
    theme: defaultColors.dark,
    tier: 1,
    width: 48,
  });

  await vi.waitFor(() => {
    expect(styleNode3DIconSvg).toHaveBeenCalledWith(expect.any(SVGSVGElement), expect.objectContaining({
      color: '#123456',
      fillMode: 'solid',
    }), 'solid-fallback-icon-gradient');
  });

  disposeNode3DGradientTextures(renderer);
});

it.each(['bar', 'outline'] as const)(
  'overrides the active %s progress appearance without changing its theme track',
  (progressMode) => {
    const renderer = {
      capabilities: { getMaxAnisotropy: () => 1 },
    } as THREE.WebGLRenderer;
    const context = {
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000"/></svg>',
    }));

    const node = createNode3DObject({
      assetBasePath: '/assets/nodes',
      cardDepth: 40,
      fogEnabled: false,
      frontGradient: gradient,
      height: 10,
      icon: `progress-color-${progressMode}.svg`,
      iconOpacity: 1,
      id: `progress-color-${progressMode}`,
      initialProgress: 0.5,
      isDark: false,
      isVariant2: true,
      nodeCornerRadius: 10,
      outlineOpacity: 0,
      outlineWidth: 1,
      position: [0, 0],
      progressBarColor: '#123456',
      progressBarHeight: 15,
      progressBarOpacity: 0.35,
      progressMode,
      progressPadding: 1,
      renderer,
      scale: 1,
      shape: 'square',
      sideXGradient: gradient,
      sideZGradient: gradient,
      theme: defaultColors.light,
      tier: 1,
      width: 48,
    });

    const progressContainer = node.userData.nodeProgressControl.object.element as HTMLDivElement;
    if (progressMode === 'bar') {
      const track = progressContainer.firstElementChild as HTMLDivElement;
      const fill = track.firstElementChild as HTMLDivElement;
      expect(fill.style.backgroundColor).toBe('rgb(18, 52, 86)');
      expect(fill.style.opacity).toBe('0.35');
      expect(track.style.backgroundColor).toBe('rgba(24, 24, 24, 0.18)');
    } else {
      const [track, fill] = progressContainer.querySelectorAll('svg > *');
      expect(fill?.getAttribute('stroke')).toBe('#123456');
      expect((fill as SVGElement | undefined)?.style.opacity).toBe('0.35');
      expect(track?.getAttribute('stroke')).toBe(defaultColors.light.effects.nodeProgressTrack);
    }

    disposeNode3DGradientTextures(renderer);
  },
);

it('adds node elevation to both the rendered and animated base position', () => {
  const renderer = {
    capabilities: { getMaxAnisotropy: () => 1 },
  } as THREE.WebGLRenderer;
  const context = {
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000"/></svg>',
  }));

  const node = createNode3DObject({
    assetBasePath: '/assets/nodes',
    cardDepth: 40,
    fogEnabled: false,
    frontGradient: gradient,
    height: 10,
    icon: 'elevated-node.svg',
    iconOpacity: 1,
    id: 'elevated-node',
    isDark: false,
    isVariant2: true,
    nodeCornerRadius: 10,
    nodeElevation: 1.25,
    outlineOpacity: 0,
    outlineWidth: 1,
    position: [0, 0],
    progressBarHeight: 15,
    progressMode: 'bar',
    progressPadding: 1,
    renderer,
    scale: 1,
    shape: 'square',
    sideXGradient: gradient,
    sideZGradient: gradient,
    theme: defaultColors.light,
    tier: 1,
    width: 48,
  });

  expect(node.position.y).toBeCloseTo(6.57);
  expect(node.userData.baseY).toBeCloseTo(6.57);
  disposeNode3DGradientTextures(renderer);
});

it('uses the configured body color for the node base face', () => {
  const renderer = {
    capabilities: { getMaxAnisotropy: () => 1 },
  } as THREE.WebGLRenderer;
  const context = {
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000"/></svg>',
  }));

  const node = createNode3DObject({
    assetBasePath: '/assets/nodes',
    bodyColor: '#123456',
    cardDepth: 40,
    fogEnabled: false,
    frontGradient: gradient,
    height: 10,
    icon: 'body-color.svg',
    iconOpacity: 1,
    id: 'body-color',
    isDark: false,
    isVariant2: true,
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
    position: [0, 0],
    progressBarHeight: 15,
    progressMode: 'outline',
    progressPadding: 1,
    renderer,
    scale: 1,
    shape: 'square',
    sideXGradient: gradient,
    sideZGradient: gradient,
    theme: defaultColors.light,
    tier: 1,
    width: 48,
  });

  const body = node.userData.body as THREE.Mesh;
  const materials = body.material as THREE.Material[];
  expect((materials[3] as THREE.MeshStandardMaterial).color.getHexString()).toBe('123456');
  disposeNode3DGradientTextures(renderer);
});

it('keeps a radial progress outline uniformly inset when source width and depth differ', () => {
  const renderer = {
    capabilities: { getMaxAnisotropy: () => 1 },
  } as THREE.WebGLRenderer;
  const context = {
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    text: async () => '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#000"/></svg>',
  }));

  const node = createNode3DObject({
    assetBasePath: '/assets/nodes',
    cardDepth: 48,
    fogEnabled: false,
    frontGradient: gradient,
    height: 10,
    icon: 'radial-progress.svg',
    iconOpacity: 1,
    id: 'radial-progress',
    initialProgress: 0.5,
    isDark: false,
    isVariant2: true,
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
    position: [0, 0],
    progressBarHeight: 15,
    progressMode: 'outline',
    progressPadding: 1,
    renderer,
    scale: 1,
    shape: 'hexagon',
    sideXGradient: gradient,
    sideZGradient: gradient,
    theme: defaultColors.light,
    tier: 1,
    width: 58,
  });

  const progressObject = node.userData.nodeProgressControl.object as THREE.Object3D;
  expect(progressObject.scale.x).toBeCloseTo(progressObject.scale.y);
  disposeNode3DGradientTextures(renderer);
});
