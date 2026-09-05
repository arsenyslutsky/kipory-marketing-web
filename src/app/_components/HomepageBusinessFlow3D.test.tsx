import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
  homepageFlow,
  type BusinessFlow3DProps,
} from '@/features/business-flow-3d';
import { HomepageBusinessFlow3D } from './HomepageBusinessFlow3D';

const mocks = vi.hoisted(() => ({
  mode: 'light' as 'light' | 'dark',
  renderFlow: vi.fn<(props: BusinessFlow3DProps) => null>(() => null),
}));

vi.mock('@/features/business-flow-3d', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/business-flow-3d')>()),
  BusinessFlow3D: mocks.renderFlow,
}));
vi.mock('@/theme/ThemeProvider', () => ({
  useResolvedTheme: () => mocks.mode,
}));

beforeEach(() => mocks.renderFlow.mockClear());

it.each([
  ['light', businessFlow3DHomepageLightProps],
  ['dark', businessFlow3DHomepageDarkProps],
] as const)('passes the shared homepage flow through the %s preset', (mode, preset) => {
  mocks.mode = mode;
  render(<HomepageBusinessFlow3D />);

  expect(mocks.renderFlow).toHaveBeenCalledTimes(1);
  expect(mocks.renderFlow.mock.calls[0]?.[0]).toEqual({
    ...preset,
    flow: homepageFlow,
    mode,
  });
});
