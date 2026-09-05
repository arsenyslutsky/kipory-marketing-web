import { describe, expect, it } from 'vitest';

import coreMeta from './business-core-node-flow/stories/BusinessCoreNodeFlow.stories';
import flow3DMeta from './business-flow-3d/stories/BusinessFlow3D.stories';
import horizontalMeta from './business-flow-horizontal/stories/BusinessFlowHorizontal.stories';
import verticalMeta from './business-flow-vertical/stories/BusinessFlowVertical.stories';

const nodeShadowControlKeys = [
  'nodeShadowColor',
  'nodeShadowOpacity',
  'nodeShadowLightX',
  'nodeShadowLightY',
  'nodeShadowLightZ',
  'nodeShadowRadius',
  'nodeShadowBlurSamples',
  'nodeShadowBias',
  'nodeShadowNormalBias',
] as const;

describe.each([
  ['3D', flow3DMeta],
  ['vertical', verticalMeta],
  ['horizontal', horizontalMeta],
  ['core', coreMeta],
] as const)('%s flow node-shadow controls', (_name, meta) => {
  it('exposes the complete renderer tuning surface in one category', () => {
    expect(Object.keys(meta.argTypes)).toEqual(expect.arrayContaining([...nodeShadowControlKeys]));

    for (const key of nodeShadowControlKeys) {
      expect(meta.argTypes[key].table).toMatchObject({ category: 'Node Shadows' });
      expect(meta.argTypes[key].description).toEqual(expect.any(String));
    }
  });

  it('uses bounded color and numeric controls', () => {
    expect(meta.argTypes.nodeShadowColor.control).toBe('color');
    expect(meta.argTypes.nodeShadowOpacity.control).toEqual({
      type: 'range', min: 0, max: 1, step: 0.01,
    });
    expect(meta.argTypes.nodeShadowBlurSamples.control).toEqual({
      type: 'range', min: 1, max: 32, step: 1,
    });
  });
});
