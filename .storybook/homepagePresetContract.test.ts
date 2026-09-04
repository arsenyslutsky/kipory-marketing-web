import { describe, expect, it } from 'vitest';
import {
  businessCoreNodeFlowContactProps,
  businessCoreNodeFlowWaitlistProps,
} from '../src/features/business-core-node-flow/presets';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
} from '../src/features/business-flow-3d/presets';
import {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from '../src/features/business-flow-horizontal/presets';
import {
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
} from '../src/features/business-flow-vertical/presets';

import {
  createHomepagePresetCapabilityRequest,
  createHomepagePresetSaveRequest,
  filterHomepagePresetArgs,
  isHomepagePresetStoryId,
} from './homepagePresetContract';

describe('homepage preset contract', () => {
  it('keeps non-flat illustration presets structural while registering the tuned light 3D palette', () => {
    const presets: ReadonlyArray<Record<string, unknown>> = [
      businessFlow3DHomepageDarkProps,
      businessCoreNodeFlowContactProps,
      businessCoreNodeFlowWaitlistProps,
    ];
    const themeDerivedKeys = [
      'auxiliaryIconFillColor',
      'beamColor',
      'beamHighlightColor',
      'centralIconFillColor',
      'color',
      'connectorColor',
      'gradientEndColor',
      'gradientMidColor',
      'gradientStartColor',
      'gridColor',
      'mode',
      'nodeFrontGradientEndColor',
      'nodeFrontGradientMidColor',
      'nodeFrontGradientStartColor',
      'nodeSideXGradientEndColor',
      'nodeSideXGradientMidColor',
      'nodeSideXGradientStartColor',
      'nodeSideZGradientEndColor',
      'nodeSideZGradientMidColor',
      'nodeSideZGradientStartColor',
    ];

    presets.forEach((preset) => {
      themeDerivedKeys.forEach((key) => expect(preset).not.toHaveProperty(key));
    });

    expect(businessFlow3DHomepageLightProps).toMatchObject({
      nodeFrontGradientEndColor: '#449c40',
      nodeFrontGradientMidColor: '#449c40',
      nodeFrontGradientStartColor: '#98c496',
      nodeSideXGradientEndColor: '#449c40',
      nodeSideXGradientMidColor: '#449c40',
      nodeSideXGradientStartColor: '#449c40',
      nodeSideZGradientEndColor: '#449c40',
      nodeSideZGradientMidColor: '#449c40',
      nodeSideZGradientStartColor: '#449c40',
    });
  });

  it('keeps structural homepage controls registered after removing theme-derived args', () => {
    [businessFlow3DHomepageDarkProps, businessFlow3DHomepageLightProps].forEach((preset) => {
      expect(Object.keys(preset)).toEqual(expect.arrayContaining([
        'cameraPitch',
        'cameraYaw',
        'cameraZoom',
        'connectorOpacity',
        'gridOpacity',
        'maxEmitDelay',
        'nodeDepth',
        'pathCurve',
        'resolutionScale',
        'speed',
      ]));
    });
    [businessFlowHorizontalHomepageDarkProps, businessFlowHorizontalHomepageLightProps]
      .forEach((preset) => expect(Object.keys(preset)).toEqual(expect.arrayContaining([
      'beamSpeed',
      'connectorOpacity',
      'height',
      'numberOfNodesLeft',
      'numberOfNodesRight',
      'resolutionScale',
      'width',
    ])));
    [businessFlowVerticalHomepageDarkProps, businessFlowVerticalHomepageLightProps]
      .forEach((preset) => expect(Object.keys(preset)).toEqual(expect.arrayContaining([
      'auxiliaryNodeSpacing',
      'beamSpeed',
      'connectorOpacity',
      'height',
      'numberOfNodesBottom',
      'numberOfNodesTop',
      'resolutionScale',
      'width',
    ])));
    [businessCoreNodeFlowContactProps, businessCoreNodeFlowWaitlistProps].forEach((preset) => {
      expect(Object.keys(preset)).toEqual(expect.arrayContaining([
        'beamSpeed',
        'connectorOpacity',
        'numberOfAuxiliaryConnections',
        'resolutionScale',
        'showAuxiliaryNodes',
        'size',
      ]));
    });
  });

  it('registers complete theme-specific node shadow and outline presets for the flat workflows', () => {
    const nodeShadowKeys = [
      'nodeShadowBias',
      'nodeShadowBlurSamples',
      'nodeShadowColor',
      'nodeShadowLightX',
      'nodeShadowLightY',
      'nodeShadowLightZ',
      'nodeShadowNormalBias',
      'nodeShadowOpacity',
      'nodeShadowRadius',
    ] as const;

    for (const preset of [
      businessFlowHorizontalHomepageDarkProps,
      businessFlowHorizontalHomepageLightProps,
      businessFlowVerticalHomepageDarkProps,
      businessFlowVerticalHomepageLightProps,
    ]) {
      for (const key of nodeShadowKeys) expect(preset).toHaveProperty(key);
    }

    expect(businessFlowHorizontalHomepageDarkProps).toMatchObject({
      outlineOpacity: 0,
      outlineWidth: 1,
      nodeShadowOpacity: 0.5,
    });
    expect(businessFlowHorizontalHomepageLightProps).toMatchObject({
      outlineOpacity: 0.3,
      outlineWidth: 1.25,
      nodeShadowOpacity: 0.38,
    });
    expect(businessFlowVerticalHomepageDarkProps).toMatchObject({ nodeShadowOpacity: 0.5 });
    expect(businessFlowVerticalHomepageLightProps).toMatchObject({ nodeShadowOpacity: 0.38 });
  });

  it.each([
    'animated-illustrations-businessflow3d--current-nextjs-app',
    'animated-illustrations-businessflow3d--current-app-light',
    'animated-illustrations-businessflowvertical--current-nextjs-app',
    'animated-illustrations-businessflowhorizontal--current-nextjs-app',
    'animated-illustrations-businesscorenodeflow--current-nextjs-app',
    'animated-illustrations-businesscorenodeflow--current-nextjs-app-2',
    'ui-glowlink--current-nextjs-app',
    'marketing-sitecontainer--current-nextjs-app',
    'marketing-section--current-nextjs-app',
    'marketing-splitlayout--current-nextjs-app',
    'marketing-pagehero--current-nextjs-app',
    'marketing-sectionheader--current-nextjs-app',
    'marketing-numberedrow--current-nextjs-app',
    'marketing-formfield--current-nextjs-app',
    'icons-protocoliconlist--current-nextjs-app',
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
