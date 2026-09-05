import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
  type BusinessFlowHorizontalProps,
} from '@/features/business-flow-horizontal';
import { HomepageBusinessFlowHorizontal } from './HomepageBusinessFlowHorizontal';

const mocks = vi.hoisted(() => ({
  mode: 'light' as 'light' | 'dark',
  renderFlow: vi.fn<(props: BusinessFlowHorizontalProps) => null>(() => null),
}));

vi.mock('@/features/business-flow-horizontal', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/business-flow-horizontal')>()),
  BusinessFlowHorizontal: mocks.renderFlow,
}));
vi.mock('@/theme/ThemeProvider', () => ({ useResolvedTheme: () => mocks.mode }));

beforeEach(() => mocks.renderFlow.mockClear());

it.each([
  ['light', businessFlowHorizontalHomepageLightProps],
  ['dark', businessFlowHorizontalHomepageDarkProps],
] as const)('passes the %s horizontal homepage preset', (mode, preset) => {
  mocks.mode = mode;

  render(<HomepageBusinessFlowHorizontal />);

  expect(mocks.renderFlow).toHaveBeenCalledTimes(1);
  expect(mocks.renderFlow.mock.calls[0]?.[0]).toEqual({ ...preset, mode });
});
