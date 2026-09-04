import { describe, expect, it } from 'vitest';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
} from '@/features/business-flow-3d/presets';
import {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from '@/features/business-flow-horizontal/presets';
import {
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
} from '@/features/business-flow-vertical/presets';

const appearanceKeys = [
  'nodeBodyColor',
  'nodeFrontGradientAngle',
  'nodeFrontGradientStartColor',
  'nodeFrontGradientMidColor',
  'nodeFrontGradientEndColor',
  'nodeSideXGradientAngle',
  'nodeSideXGradientStartColor',
  'nodeSideXGradientMidColor',
  'nodeSideXGradientEndColor',
  'nodeSideZGradientAngle',
  'nodeSideZGradientStartColor',
  'nodeSideZGradientMidColor',
  'nodeSideZGradientEndColor',
] as const;

const currentAppPresets = [
  ['3D dark', businessFlow3DHomepageDarkProps],
  ['3D light', businessFlow3DHomepageLightProps],
  ['horizontal dark', businessFlowHorizontalHomepageDarkProps],
  ['horizontal light', businessFlowHorizontalHomepageLightProps],
  ['vertical dark', businessFlowVerticalHomepageDarkProps],
  ['vertical light', businessFlowVerticalHomepageLightProps],
] as const;

describe.each(currentAppPresets)('%s preset', (_name, preset) => {
  it.each(appearanceKeys)('persists %s for Save to Next.js', (key) => {
    expect(preset).toHaveProperty(key);
  });
});
