import { describe, expect, it } from 'vitest';
import node3DMeta from '@/components/elements/Node3D/Node3D.stories';
import coreMeta from '@/features/business-core-node-flow/stories/BusinessCoreNodeFlow.stories';
import heroMeta from '@/features/business-flow-3d/stories/BusinessFlow3D.stories';
import horizontalMeta from '@/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories';
import verticalMeta from '@/features/business-flow-vertical/stories/BusinessFlowVertical.stories';

const gradientControls = [
  ['nodeFrontGradientAngle', 'Node Front Gradient'],
  ['nodeFrontGradientStartColor', 'Node Front Gradient'],
  ['nodeFrontGradientMidColor', 'Node Front Gradient'],
  ['nodeFrontGradientEndColor', 'Node Front Gradient'],
  ['nodeSideXGradientAngle', 'Node X-Side Gradient'],
  ['nodeSideXGradientStartColor', 'Node X-Side Gradient'],
  ['nodeSideXGradientMidColor', 'Node X-Side Gradient'],
  ['nodeSideXGradientEndColor', 'Node X-Side Gradient'],
  ['nodeSideZGradientAngle', 'Node Z-Side Gradient'],
  ['nodeSideZGradientStartColor', 'Node Z-Side Gradient'],
  ['nodeSideZGradientMidColor', 'Node Z-Side Gradient'],
  ['nodeSideZGradientEndColor', 'Node Z-Side Gradient'],
] as const;

const animationMetas = [
  ['BusinessFlowHorizontal', horizontalMeta],
  ['BusinessFlowVertical', verticalMeta],
  ['BusinessCoreNodeFlow', coreMeta],
  ['BusinessFlow3D', heroMeta],
] as const;

describe.each(animationMetas)('%s node appearance controls', (_name, meta) => {
  it('exposes the node base face as a color control', () => {
    expect(meta.argTypes.nodeBodyColor).toMatchObject({
      control: 'color',
      table: { category: 'Node Body' },
    });
  });

  it.each(gradientControls)('exposes %s under %s', (key, category) => {
    expect(meta.argTypes[key]).toMatchObject({
      table: { category },
    });
  });
});

it('exposes the base face color on the standalone Node3D primitive', () => {
  expect(node3DMeta.argTypes.bodyColor).toMatchObject({
    control: 'color',
    table: { category: 'Node Body' },
  });
});
