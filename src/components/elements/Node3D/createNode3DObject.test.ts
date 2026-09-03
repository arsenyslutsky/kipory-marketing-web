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
  'overrides the active %s progress fill without changing its theme track',
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
      expect(track.style.backgroundColor).toBe('rgba(24, 24, 24, 0.18)');
    } else {
      const [track, fill] = progressContainer.querySelectorAll('svg > *');
      expect(fill?.getAttribute('stroke')).toBe('#123456');
      expect(track?.getAttribute('stroke')).toBe(defaultColors.light.effects.nodeProgressTrack);
    }

    disposeNode3DGradientTextures(renderer);
  },
);
