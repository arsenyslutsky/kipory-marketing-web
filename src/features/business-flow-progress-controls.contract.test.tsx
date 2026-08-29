import { describe, expect, it } from 'vitest';

import horizontalMeta from './business-flow-horizontal/stories/BusinessFlowHorizontal.stories';
import { businessFlowHorizontalHomepageProps } from './business-flow-horizontal/presets';
import verticalMeta from './business-flow-vertical/stories/BusinessFlowVertical.stories';
import { businessFlowVerticalHomepageProps } from './business-flow-vertical/presets';

const progressControlKeys = [
  'nodeProgressMode',
  'nodeProgressSize',
  'nodeProgressMinDelay',
  'nodeProgressMaxDelay',
];

describe.each([
  ['horizontal', horizontalMeta, businessFlowHorizontalHomepageProps],
  ['vertical', verticalMeta, businessFlowVerticalHomepageProps],
] as const)('%s flow progress controls', (_name, meta, homepageProps) => {
  it('exposes size, type, and processing delay controls', () => {
    expect(Object.keys(meta.argTypes)).toEqual(expect.arrayContaining(progressControlKeys));
  });

  it('persists the approved homepage progress defaults', () => {
    expect(homepageProps).toMatchObject({
      nodeProgressMaxDelay: 1800,
      nodeProgressMinDelay: 500,
      nodeProgressMode: 'outline',
      nodeProgressSize: 15,
    });
  });
});
