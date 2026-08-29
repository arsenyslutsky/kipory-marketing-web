import { act, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { createSignalFlowScene } from '../scene/createSignalFlowScene';
import { BusinessFlow3D } from './BusinessFlow3D';

vi.mock('../scene/createSignalFlowScene', () => ({ createSignalFlowScene: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

it('reveals the hero flow only after its first completed scene frame', () => {
  let reportReady: (() => void) | undefined;
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false }) as MediaQueryList));
  vi.mocked(createSignalFlowScene).mockImplementation((options) => {
    reportReady = options.onReady;
    return {
      destroy: vi.fn(),
      reroute: vi.fn(),
      setCameraZoom: vi.fn(),
    };
  });

  const view = render(<BusinessFlow3D showInterface={false} />);
  const flow = view.getByLabelText(/Business flow 3D/);

  expect(flow).toHaveAttribute('data-flow-state', 'loading');
  expect(view.getByTestId('flow-loader')).toBeInTheDocument();

  act(() => reportReady?.());

  expect(flow).toHaveAttribute('data-flow-state', 'ready');
});
