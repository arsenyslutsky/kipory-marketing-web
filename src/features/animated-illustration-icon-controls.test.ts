import { describe, expect, it } from 'vitest';

import businessCoreMeta from './business-core-node-flow/stories/BusinessCoreNodeFlow.stories';
import businessFlow3DMeta from './business-flow-3d/stories/BusinessFlow3D.stories';
import businessFlowHorizontalMeta from './business-flow-horizontal/stories/BusinessFlowHorizontal.stories';
import businessFlowVerticalMeta from './business-flow-vertical/stories/BusinessFlowVertical.stories';

const illustrationMetas = [
  ['BusinessCoreNodeFlow', businessCoreMeta],
  ['BusinessFlow3D', businessFlow3DMeta],
  ['BusinessFlowHorizontal', businessFlowHorizontalMeta],
  ['BusinessFlowVertical', businessFlowVerticalMeta],
] as const;

describe('animated illustration icon controls', () => {
  it.each(illustrationMetas)('%s exposes the same explicit icon-line color control', (_name, meta) => {
    expect(meta.argTypes.iconStrokeColor).toMatchObject({
      control: 'color',
      description: 'Color of the icon linework. Icon fills remain independently configurable.',
      name: 'Icon color',
    });
  });

  it.each([
    ['BusinessCoreNodeFlow', businessCoreMeta],
    ['BusinessFlowHorizontal', businessFlowHorizontalMeta],
    ['BusinessFlowVertical', businessFlowVerticalMeta],
  ] as const)('%s hides the ambiguous legacy color control', (_name, meta) => {
    expect(meta.argTypes.color).toMatchObject({ table: { disable: true } });
  });
});
