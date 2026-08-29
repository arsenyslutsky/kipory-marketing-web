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
