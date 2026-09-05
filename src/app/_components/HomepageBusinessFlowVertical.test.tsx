import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
  type BusinessFlowVerticalProps,
} from '@/features/business-flow-vertical';
import { HomepageBusinessFlowVertical } from './HomepageBusinessFlowVertical';

const mocks = vi.hoisted(() => ({
  mode: 'light' as 'light' | 'dark',
  renderFlow: vi.fn<(props: BusinessFlowVerticalProps) => null>(() => null),
}));

vi.mock('@/features/business-flow-vertical', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/business-flow-vertical')>()),
  BusinessFlowVertical: mocks.renderFlow,
}));
vi.mock('@/theme/ThemeProvider', () => ({ useResolvedTheme: () => mocks.mode }));

beforeEach(() => mocks.renderFlow.mockClear());

it.each([
  ['light', businessFlowVerticalHomepageLightProps],
  ['dark', businessFlowVerticalHomepageDarkProps],
] as const)('passes the %s vertical homepage preset', (mode, preset) => {
  mocks.mode = mode;

  render(<HomepageBusinessFlowVertical className="pillars" />);

  expect(mocks.renderFlow).toHaveBeenCalledTimes(1);
  expect(mocks.renderFlow.mock.calls[0]?.[0]).toEqual({
    ...preset,
    className: 'pillars',
    mode,
  });
});
