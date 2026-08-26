import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BusinessFlowHorizontal } from './BusinessFlowHorizontal';

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({
    paths,
    beamSource,
    reducedMotion,
  }: {
    paths: unknown[];
    beamSource: { slots: number };
    reducedMotion?: boolean;
  }) => (
    <div
      data-testid="flow-layer"
      data-paths={paths.length}
      data-reduced-motion={String(reducedMotion)}
      data-slots={beamSource.slots}
    />
  ),
}));

afterEach(() => vi.unstubAllGlobals());

it('renders one shared layer and retains its DOM icon composition', () => {
  render(<BusinessFlowHorizontal />);
  expect(screen.getAllByTestId('flow-layer')).toHaveLength(1);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '12');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-slots', '12');
  expect(screen.getByRole('img', { name: /Horizontal business flow/i })).toBeInTheDocument();
});

it('passes current reduced-motion preference to the shared layer and cleans up its listener', () => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const addEventListener = vi.fn((_: 'change', listener: (event: MediaQueryListEvent) => void) => {
    listeners.add(listener);
  });
  const removeEventListener = vi.fn((_: 'change', listener: (event: MediaQueryListEvent) => void) => {
    listeners.delete(listener);
  });
  const query = { addEventListener, matches: false, removeEventListener } as unknown as MediaQueryList;
  vi.stubGlobal('matchMedia', vi.fn(() => query));

  const view = render(<BusinessFlowHorizontal />);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-reduced-motion', 'false');

  act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-reduced-motion', 'true');

  view.unmount();
  expect(removeEventListener).toHaveBeenCalledTimes(1);
  expect(listeners.size).toBe(0);
});
