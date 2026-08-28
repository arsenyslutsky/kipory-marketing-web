import { describe, expect, it } from 'vitest';

import {
  createHomepagePresetCapabilityRequest,
  createHomepagePresetSaveRequest,
  filterHomepagePresetArgs,
  isHomepagePresetStoryId,
} from './homepagePresetContract';

describe('homepage preset contract', () => {
  it.each([
    'animated-illustrations-businessflow3d--current-nextjs-app',
    'animated-illustrations-businessflowvertical--current-nextjs-app',
    'animated-illustrations-businessflowhorizontal--current-nextjs-app',
    'ui-glowlink--current-nextjs-app',
  ])('accepts the supported story %s', (storyId) => {
    expect(isHomepagePresetStoryId(storyId)).toBe(true);
  });

  it('rejects foundation and prefix-only story IDs', () => {
    expect(
      isHomepagePresetStoryId('animated-illustrations-businessflowhorizontal--foundation'),
    ).toBe(false);
    expect(
      isHomepagePresetStoryId(
        'animated-illustrations-businessflowhorizontal--current-nextjs-app-extra',
      ),
    ).toBe(false);
  });

  it('keeps enabled current args and removes disabled or functional args', () => {
    expect(
      filterHomepagePresetArgs(
        { speed: 1.4, color: '#fff', renderLabel: () => 'x', hidden: true },
        { speed: {}, color: {}, renderLabel: {}, hidden: { table: { disable: true } } },
        ['speed', 'color', 'renderLabel', 'hidden'],
      ),
    ).toEqual({ speed: 1.4, color: '#fff' });
  });

  it('keeps only keys registered by the current homepage preset story', () => {
    expect(
      filterHomepagePresetArgs(
        { mode: 'dark', connectorOpacity: 0.62, assetBasePath: '/assets/nodes' },
        { mode: {}, connectorOpacity: {}, assetBasePath: {} },
        ['mode', 'connectorOpacity'],
      ),
    ).toEqual({ mode: 'dark', connectorOpacity: 0.62 });
  });

  it('builds a same-origin capability request', () => {
    expect(createHomepagePresetCapabilityRequest()).toEqual({
      url: '/__kipory/homepage-presets',
      init: { method: 'GET' },
    });
  });

  it('builds a same-origin JSON save request with the required custom header', () => {
    const request = createHomepagePresetSaveRequest(
      'animated-illustrations-businessflowhorizontal--current-nextjs-app',
      { connectorOpacity: 0.22 },
    );

    expect(request.url).toBe('/__kipory/homepage-presets');
    expect(request.init).toMatchObject({ method: 'POST' });
    expect(request.init.headers).toEqual({
      'Content-Type': 'application/json',
      'X-Kipory-Storybook-Save': '1',
    });
    expect(request.init.body).toBe(
      JSON.stringify({
        storyId: 'animated-illustrations-businessflowhorizontal--current-nextjs-app',
        args: { connectorOpacity: 0.22 },
      }),
    );
  });
});
