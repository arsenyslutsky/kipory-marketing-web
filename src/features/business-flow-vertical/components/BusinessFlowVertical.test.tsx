import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BusinessFlowVertical } from './BusinessFlowVertical';

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({
    paths,
    beamSource,
    onArrival,
    reducedMotion,
  }: {
    paths: Array<{ curve?: number }>;
    beamSource: { slots: number };
    onArrival?: (event: {
      arrival: { id: string; point: readonly [number, number]; progress: number };
      generation: number;
      runId: string;
      slot: number;
    }) => void;
    reducedMotion?: boolean;
  }) => (
    <button
      type="button"
      data-testid="flow-layer"
      data-curve={paths[0]?.curve}
      data-paths={paths.length}
      data-reduced-motion={String(reducedMotion)}
      data-slots={beamSource.slots}
      onClick={() => onArrival?.({
        arrival: { id: 'server', point: [0.2, 0.5], progress: 0.5 },
        generation: 3,
        runId: 'vertical-0:3',
        slot: 0,
      })}
    />
  ),
}));

afterEach(() => vi.unstubAllGlobals());

it('renders one shared layer while retaining central and surrounding icons', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  render(
    <BusinessFlowVertical
      numberOfNodesTop={2}
      numberOfNodesBottom={2}
      showContinuationConnectors
    />,
  );
  expect(screen.getAllByTestId('flow-layer')).toHaveLength(1);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '11');
  expect(screen.getByLabelText('Vertical business flow')).toBeInTheDocument();
  expect(screen.getAllByRole('img')).toHaveLength(4);
});

it('passes live reduced-motion preference to the shared layer and cleans up its listener', () => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const addEventListener = vi.fn((_: 'change', listener: (event: MediaQueryListEvent) => void) => {
    listeners.add(listener);
  });
  const removeEventListener = vi.fn((_: 'change', listener: (event: MediaQueryListEvent) => void) => {
    listeners.delete(listener);
  });
  const query = { addEventListener, matches: false, removeEventListener } as unknown as MediaQueryList;
  vi.stubGlobal('matchMedia', vi.fn(() => query));

  const view = render(<BusinessFlowVertical />);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-reduced-motion', 'false');

  act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-reduced-motion', 'true');

  view.unmount();
  expect(removeEventListener).toHaveBeenCalledTimes(1);
  expect(listeners.size).toBe(0);
});

it('renders arrival bursts at normalized points and removes completed bursts', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  render(<BusinessFlowVertical burstFadeTime={1000} burstRadius={24} />);

  fireEvent.click(screen.getByTestId('flow-layer'));
  const burst = screen.getByTestId('arrival-burst');
  expect(burst).toHaveStyle({ left: '20%', top: '50%' });

  fireEvent.animationEnd(burst.firstElementChild!);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
});
