import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  businessCoreNodeFlowContactProps,
  businessCoreNodeFlowWaitlistProps,
} from './business-core-node-flow/presets';
import { defaultColors } from './business-flow-3d/config';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
} from './business-flow-3d/presets';
import {
  CurrentAppLight as businessFlow3DCurrentAppLight,
  CurrentNextjsApp as businessFlow3DCurrentAppDark,
} from './business-flow-3d/stories/BusinessFlow3D.stories';
import { businessFlowHorizontalHomepageProps } from './business-flow-horizontal/presets';
import { CurrentNextjsApp as businessFlowHorizontalCurrentApp } from './business-flow-horizontal/stories/BusinessFlowHorizontal.stories';
import { businessFlowVerticalHomepageProps } from './business-flow-vertical/presets';
import { CurrentNextjsApp as businessFlowVerticalCurrentApp } from './business-flow-vertical/stories/BusinessFlowVertical.stories';

const cases = [
  {
    feature: 'business-flow-3d',
    preset: 'businessFlow3DHomepageDarkProps',
    presetValue: businessFlow3DHomepageDarkProps,
    story: 'BusinessFlow3D',
    storyArgs: businessFlow3DCurrentAppDark.args ?? {},
  },
  {
    feature: 'business-flow-3d',
    preset: 'businessFlow3DHomepageLightProps',
    presetValue: businessFlow3DHomepageLightProps,
    story: 'BusinessFlow3D',
    storyArgs: businessFlow3DCurrentAppLight.args ?? {},
  },
  {
    feature: 'business-flow-vertical',
    preset: 'businessFlowVerticalHomepageProps',
    presetValue: businessFlowVerticalHomepageProps,
    story: 'BusinessFlowVertical',
    storyArgs: businessFlowVerticalCurrentApp.args ?? {},
  },
  {
    feature: 'business-flow-horizontal',
    preset: 'businessFlowHorizontalHomepageProps',
    presetValue: businessFlowHorizontalHomepageProps,
    story: 'BusinessFlowHorizontal',
    storyArgs: businessFlowHorizontalCurrentApp.args ?? {},
  },
] as const;

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
] as const;

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function compositeHex(foreground: string, background: string, alpha: number) {
  const channels = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const foregroundChannels = channels(foreground);
  const backgroundChannels = channels(background);
  return foregroundChannels.map((channel, index) => (
    Math.round(channel * alpha + backgroundChannels[index]! * (1 - alpha))
  ));
}

function contrastRatio(foreground: number[], background: number[]) {
  const luminance = (channels: number[]) => channels
    .map((channel) => channel / 255)
    .map((channel) => (channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0);
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

describe('homepage illustration preset contract', () => {
  it('keeps shared website flow presets structural while the light 3D variant owns its tuned palette', () => {
    const presets: ReadonlyArray<Record<string, unknown>> = [
      businessFlow3DHomepageDarkProps,
      businessFlowHorizontalHomepageProps,
      businessFlowVerticalHomepageProps,
      businessCoreNodeFlowContactProps,
      businessCoreNodeFlowWaitlistProps,
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

  it('preserves the hero camera, topology, opacity, timing, and runtime preset values', () => {
    const expected = {
      activityStrategy: 'visible',
      cameraPitch: 33.19,
      cameraYaw: 0.35,
      cameraZoom: 1.1,
      cameraTargetOffsetY: -3,
      concurrentBeams: 10,
      connectorOpacity: 0.62,
      connectorStroke: 'dashed',
      connectorWidth: 1.25,
      emitterX: 3,
      emitterY: -3.5,
      fogEnabled: true,
      gridDensity: 8,
      gridMaskBlur: 480,
      gridMaskRadius: 1200,
      gridOpacity: 0.1,
      interactive: false,
      loadStrategy: 'eager',
      maxDelay: 800,
      maxEmitDelay: 500,
      minDelay: 200,
      minEmitDelay: 150,
      nodeCornerRadius: 10,
      nodeDepth: 20,
      nodeDepthRandom: 42,
      nodeFrontGradientAngle: 117,
      nodeIconOpacity: 0.5,
      nodeProgressMode: 'outline',
      nodeScale: 0.7,
      nodeShape: 'custom',
      nodeSideXGradientAngle: 360,
      nodeSideZGradientAngle: 177,
      outlineOpacity: 0,
      outlineWidth: 1,
      pathCurve: 86,
      perspectiveEffect: 75,
      progressBarHeight: 15,
      progressBarOpacity: 1,
      progressPadding: 1,
      resolutionScale: 'display',
      scrollRange: 700,
      scrollTilt: 41.81,
      showContinuationConnectors: true,
      showInterface: false,
      speed: 0.8,
    };

    expect(businessFlow3DHomepageDarkProps).toEqual(expected);
    expect(businessFlow3DHomepageLightProps).toEqual({
      ...expected,
      connectorElevation: 2,
      connectorStroke: 'solid',
      iconStrokeColor: '#ffffff',
      nodeFrontGradientEndColor: '#449c40',
      nodeFrontGradientMidColor: '#449c40',
      nodeFrontGradientStartColor: '#98c496',
      nodeCornerRadius: 0,
      nodeDepthRandom: 0,
      nodeIconOpacity: 0.9,
      nodeShadowLightX: 0,
      nodeShadowLightZ: 16.5,
      nodeShadowRadius: 8,
      nodeSideXGradientEndColor: '#449c40',
      nodeSideXGradientMidColor: '#449c40',
      nodeSideXGradientStartColor: '#449c40',
      nodeSideZGradientEndColor: '#449c40',
      nodeSideZGradientMidColor: '#449c40',
      nodeSideZGradientStartColor: '#449c40',
      outlineOpacity: 0.3,
      outlineWidth: 1.25,
      pathCurve: 100,
      progressBarHeight: 10,
    });

    expect(businessFlow3DHomepageDarkProps).toMatchObject({
      cameraTargetOffsetY: -3,
      emitterX: 3,
      emitterY: -3.5,
    });
    expect(businessFlow3DHomepageLightProps).toMatchObject({
      cameraTargetOffsetY: -3,
      emitterX: 3,
      emitterY: -3.5,
    });

    const spatialKeys = [
      'cameraPitch',
      'cameraYaw',
      'cameraZoom',
      'cameraTargetOffsetY',
      'emitterX',
      'emitterY',
      'perspectiveEffect',
      'nodeScale',
    ] as const;

    spatialKeys.forEach((key) => {
      expect(businessFlow3DHomepageLightProps[key]).toBe(businessFlow3DHomepageDarkProps[key]);
    });
  });

  it('keeps the light hero grid perceptible at the homepage opacity', () => {
    const ground = compositeHex(
      defaultColors.light.scene.ground,
      defaultColors.light.scene.ground,
      1,
    );
    const compositedGrid = compositeHex(
      defaultColors.light.scene.gridMajor,
      defaultColors.light.scene.ground,
      businessFlow3DHomepageLightProps.gridOpacity,
    );

    expect(contrastRatio(compositedGrid, ground)).toBeGreaterThanOrEqual(1.1);
  });

  it('preserves lower-flow layout, topology, opacity, timing, and runtime preset values', () => {
    expect(businessFlowHorizontalHomepageProps).toEqual({
      activityStrategy: 'visible',
      beamEmissionRandomness: 100,
      beamEnabled: true,
      beamHeadGlowBlur: 2,
      beamHeadGlowOpacity: 1,
      beamHeadGlowRadius: 11,
      beamSpeed: 1.4,
      beamTrailLength: 135,
      burstFadeTime: 900,
      burstRadius: 24,
      burstStrength: 0.5,
      centralIconStrokeOpacity: 1,
      connectorOpacity: 0.8,
      connectorWidth: 1,
      gridDensity: 30,
      gridOpacity: 0,
      height: '50rem',
      iconSize: 44,
      loadStrategy: 'near-viewport',
      maxConcurrentBeams: 5,
      nodeProgressMaxDelay: 1800,
      nodeProgressMinDelay: 500,
      nodeProgressMode: 'outline',
      nodeProgressSize: 15,
      numberOfNodesLeft: 8,
      numberOfNodesRight: 8,
      preloadMargin: '600px 0px',
      resolutionScale: 'display',
      strokeWidth: 2.25,
      width: 'min(28.8rem, 100%)',
    });
    expect(businessFlowVerticalHomepageProps).toEqual({
      activityStrategy: 'visible',
      auxiliaryNodeSpacing: 0.6,
      beamEmissionRandomness: 100,
      beamEnabled: true,
      beamHeadGlowBlur: 32,
      beamHeadGlowOpacity: 0,
      beamHeadGlowRadius: 0,
      beamSpeed: 1.4,
      beamTrailLength: 0,
      burstFadeTime: 1700,
      burstRadius: 25,
      burstStrength: 0.5,
      centralIconFillMode: 'black',
      centralIconStrokeOpacity: 0.91,
      connectorOpacity: 0.6,
      connectorRadius: 10,
      connectorWidth: 1,
      gridDensity: 30,
      gridOpacity: 0,
      height: '45rem',
      iconSize: 40,
      loadStrategy: 'near-viewport',
      maxConcurrentBeams: 5,
      nodeProgressMaxDelay: 1800,
      nodeProgressMinDelay: 500,
      nodeProgressMode: 'outline',
      nodeProgressSize: 15,
      numberOfNodesBottom: 5,
      numberOfNodesTop: 4,
      preloadMargin: '600px 0px',
      resolutionScale: 'display',
      showContinuationConnectors: true,
      strokeWidth: 1.5,
      width: '20rem',
    });
  });

  it('preserves contact and waitlist flow structure without freezing their colors', () => {
    const expected = {
      activityStrategy: 'visible',
      auxiliaryIcon: 'mixed',
      beamEmissionRandomness: 100,
      beamEnabled: true,
      beamGlowIntensity: 1,
      beamHeadGlowBlur: 2,
      beamHeadGlowOpacity: 1,
      beamHeadGlowRadius: 11,
      beamSpeed: 1.4,
      beamTrailLength: 135,
      beamWidth: 1.4,
      burstFadeTime: 900,
      burstRadius: 24,
      burstStrength: 0.5,
      centralIcon: 'profile',
      centralIconStrokeOpacity: 1,
      connectorOpacity: 0.8,
      connectorStroke: 'dashed',
      connectorWidth: 1,
      gridDensity: 30,
      gridOpacity: 0,
      iconSize: 44,
      loadStrategy: 'near-viewport',
      maxConcurrentBeams: 6,
      nodeProgressMaxDelay: 1800,
      nodeProgressMinDelay: 500,
      nodeProgressMode: 'outline',
      nodeProgressSize: 15,
      numberOfAuxiliaryConnections: 12,
      resolutionScale: 'display',
      showAuxiliaryNodes: false,
      size: 'min(22rem, 100%)',
      strokeWidth: 0.5,
    };

    expect(businessCoreNodeFlowContactProps).toEqual(expected);
    expect(businessCoreNodeFlowWaitlistProps).toEqual(expected);
  });

  it('eagerly loads only the hero and defers both lower workflows near the viewport', () => {
    [businessFlow3DHomepageDarkProps, businessFlow3DHomepageLightProps].forEach((preset) => {
      expect(preset).toMatchObject({
        activityStrategy: 'visible',
        loadStrategy: 'eager',
        resolutionScale: 'display',
      });
    });
    [businessFlowHorizontalHomepageProps, businessFlowVerticalHomepageProps].forEach((preset) => {
      expect(preset).toMatchObject({
        activityStrategy: 'visible',
        loadStrategy: 'near-viewport',
        preloadMargin: '600px 0px',
        resolutionScale: 'display',
      });
    });
  });

  it('keeps the hero beam cadence and node progress pauses responsive', () => {
    [businessFlow3DHomepageDarkProps, businessFlow3DHomepageLightProps].forEach((preset) => {
      const speed = preset.speed;

      expect(320 / speed).toBeLessThanOrEqual(400);
      expect(preset.maxEmitDelay / speed).toBeLessThanOrEqual(625);
      expect(preset.maxDelay / speed).toBeLessThanOrEqual(1000);
    });
  });

  it('keeps the pillars section out of progress-driven document geometry', () => {
    const marketingCss = source('../app/marketing.module.css');
    const movementRule = marketingCss.match(/\.movementSection\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(movementRule).not.toContain('margin-bottom');
    expect(movementRule).not.toContain('transform:');
    expect(movementRule).not.toContain('will-change');
  });

  it('keeps the hero height override stronger than the reusable viewport height', () => {
    const marketingCss = source('../app/marketing.module.css');
    const flowCss = source('./business-flow-3d/components/BusinessFlow3D.module.css');
    const heroRule = marketingCss.match(/^(\.heroVisual\s*>\s*[^\{]+)\{([^}]*)\}/m)?.slice(1) ?? [];
    const rootRule = flowCss.match(/^(\.root[^\{]*)\{([^}]*)\}/m)?.slice(1) ?? [];
    const countClassAndAttributeSelectors = (selector = '') => (
      selector.match(/\.[\w-]+|\[[^\]]+\]/g)?.length ?? 0
    );

    expect(heroRule[1]).toMatch(/height:\s*100%/);
    expect(heroRule[1]).toMatch(/min-height:\s*0/);
    expect(rootRule[1]).toMatch(/height:\s*100dvh/);
    expect(countClassAndAttributeSelectors(heroRule[0]))
      .toBeGreaterThan(countClassAndAttributeSelectors(rootRule[0]));
  });

  it('keeps Storybook framing while bottom-aligning the desktop hero workflow clear of the copy', () => {
    const marketingCss = source('../app/marketing.module.css');
    const heroVisualRule = marketingCss.match(/\.heroVisual\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(heroVisualRule).toMatch(/inset:\s*auto\s+0\s+0/);
    expect(heroVisualRule).toMatch(/height:\s*840px/);
    expect(heroVisualRule).toMatch(
      /transform:\s*translateX\(clamp\(264px,\s*13vw,\s*284px\)\)/,
    );
    expect(heroVisualRule).not.toMatch(/scale\(/);
  });

  it('releases the CTA reveal mask after the entrance animation', () => {
    const marketingCss = source('../app/marketing.module.css');
    const actionsRevealRule = marketingCss.match(
      /\.main\[data-workflows-ready='true'\]\s+\.heroActionsReveal\s*\{([^}]*)\}/,
    )?.[1] ?? '';

    expect(actionsRevealRule).toMatch(/animation-fill-mode:\s*backwards/);
  });

  it('keeps the pillars illustration inside its split-layout visual column', () => {
    const marketingCss = source('../app/marketing.module.css');
    const visualRule = marketingCss.match(/\.capabilityVisual\s*\{([^}]*)\}/)?.[1] ?? '';
    const illustrationRule = marketingCss.match(/\.capabilityVisual\s+\.pillarsIllustration\s*\{([^}]*)\}/)?.[1] ?? '';

    expect(visualRule).toMatch(/position:\s*relative/);
    expect(illustrationRule).toMatch(/inset:\s*0/);
    expect(illustrationRule).toMatch(/width:\s*100%/);
    expect(illustrationRule).toMatch(/height:\s*100%/);
  });

  it.each(cases)('$feature exports one preset used by its website story', ({
    feature,
    preset,
    presetValue,
    story,
    storyArgs,
  }) => {
    const presetSource = source(`./${feature}/presets.ts`);
    const indexSource = source(`./${feature}/index.ts`);
    const storySource = source(`./${feature}/stories/${story}.stories.tsx`);

    expect(presetSource).toContain(`export const ${preset} =`);
    expect(indexSource).toContain(preset);
    expect(storySource).toContain(preset);
    expect(storyArgs).toMatchObject(presetValue);
  });
});
