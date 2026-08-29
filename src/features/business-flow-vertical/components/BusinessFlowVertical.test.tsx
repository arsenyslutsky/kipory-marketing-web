import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type { FlowLayer3DNode, FlowLayer3DNodeStyle } from '@/components/elements/FlowLayer3D';
import { businessFlowVerticalHomepageProps } from '../presets';
import { BusinessFlowVertical } from './BusinessFlowVertical';

let capturedNodes: readonly FlowLayer3DNode[] | undefined;
let capturedNodeStyle: FlowLayer3DNodeStyle | undefined;

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({
    beam,
    paths,
    beamSource,
    nodes,
    nodeStyle,
    onActivityChange,
    onArrival,
    reducedMotion,
  }: {
    beam: {
      beamWidth: number;
      headGlowBlur?: number;
      headGlowOpacity?: number;
      headGlowRadius?: number;
      trailLength: number;
    };
    paths: Array<{ curve?: number }>;
    nodes?: readonly FlowLayer3DNode[];
    nodeStyle?: FlowLayer3DNodeStyle;
    onActivityChange?: (active: boolean) => void;
    beamSource: {
      slots: number;
      next: (slot: number, generation: number) => { trailLength?: number } | null;
    };
    onArrival?: (event: {
      arrival: { id: string; point: readonly [number, number]; progress: number };
      generation: number;
      runId: string;
      slot: number;
    }) => void;
    reducedMotion?: boolean;
  }) => {
    useEffect(() => {
      onActivityChange?.(true);
      return () => onActivityChange?.(false);
    }, [onActivityChange]);
    capturedNodes = nodes;
    capturedNodeStyle = nodeStyle;
    return (
      <button
        type="button"
        data-testid="flow-layer"
        data-beam-width={beam.beamWidth}
        data-curve={paths[0]?.curve}
        data-head-glow-blur={beam.headGlowBlur}
        data-head-glow-opacity={beam.headGlowOpacity}
        data-head-glow-radius={beam.headGlowRadius}
        data-paths={paths.length}
        data-reduced-motion={String(reducedMotion)}
        data-run-trail={beamSource.next(0, 0)?.trailLength}
        data-slots={beamSource.slots}
        data-style-trail={beam.trailLength}
        onClick={() => onArrival?.({
          arrival: { id: 'server', point: [0.2, 0.5], progress: 0.5 },
          generation: 3,
          runId: 'vertical-0:3',
          slot: 0,
        })}
      />
    );
  },
}));

afterEach(() => {
  capturedNodes = undefined;
  capturedNodeStyle = undefined;
  vi.unstubAllGlobals();
});

it('renders the central hierarchy and satellite documents in one shared Node3D layer', () => {
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
  expect(capturedNodes).toHaveLength(8);
  expect(capturedNodes?.slice(0, 4).every((node) => node.shape === 'square')).toBe(true);
  expect(capturedNodes?.slice(4).every((node) => node.shape === 'rectangle')).toBe(true);
  expect(capturedNodeStyle).toMatchObject({ assetBasePath: '/assets/nodes' });
  expect(document.querySelectorAll('svg')).toHaveLength(0);
  expect(screen.getByRole('list', { name: 'Central flow nodes' })).toBeInTheDocument();
  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'Server',
    'Graph',
    'Vector',
    'Intelligence',
  ]);
});

it('maps its public color to every node stroke without changing central or satellite fills', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  render(
    <BusinessFlowVertical
      auxiliaryIconFillColor="#111111"
      centralIconFillColor="#222222"
      color="#abcdef"
      numberOfNodesBottom={1}
      numberOfNodesTop={1}
    />,
  );

  expect(capturedNodes).toHaveLength(6);
  expect(capturedNodes?.every((node) => node.iconStrokeColor === '#abcdef')).toBe(true);
  expect(capturedNodes?.slice(0, 4).every((node) => node.iconColor === '#222222')).toBe(true);
  expect(capturedNodes?.slice(4).every((node) => node.iconColor === '#111111')).toBe(true);
});

it('renders homepage node processing progress as outlines', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  render(<BusinessFlowVertical {...businessFlowVerticalHomepageProps} />);

  expect(capturedNodeStyle).toMatchObject({
    progressBarHeight: 15,
    progressMaxDelay: 1800,
    progressMinDelay: 500,
    progressMode: 'outline',
  });
});

it('propagates custom node progress size, type, and delay range to the shared layer', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  render(
    <BusinessFlowVertical
      nodeProgressMaxDelay={2400}
      nodeProgressMinDelay={800}
      nodeProgressMode="bar"
      nodeProgressSize={24}
    />,
  );

  expect(capturedNodeStyle).toMatchObject({
    progressBarHeight: 24,
    progressMaxDelay: 2400,
    progressMinDelay: 800,
    progressMode: 'bar',
  });
});

it('preserves independent beam trail and head-glow controls', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  render(
    <BusinessFlowVertical
      beamHeadGlowBlur={12}
      beamHeadGlowOpacity={0.35}
      beamHeadGlowRadius={48}
      connectorWidth={2}
    />,
  );

  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-beam-width', '2.8');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-head-glow-blur', '12');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-head-glow-opacity', '0.35');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-head-glow-radius', '48');
});

it('keeps a zero trail disabled and converts legacy trail units per complete route', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  const view = render(
    <BusinessFlowVertical
      beamTrailLength={0}
      connectorRadius={0}
      numberOfNodesBottom={1}
      numberOfNodesTop={1}
    />,
  );

  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-style-trail', '0');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-run-trail', '0');

  view.rerender(
    <BusinessFlowVertical
      beamTrailLength={21}
      connectorRadius={0}
      numberOfNodesBottom={1}
      numberOfNodesTop={1}
    />,
  );

  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-style-trail', '0');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-run-trail', '0.25');
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

  fireEvent.animationEnd(burst);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
});

it('clears active bursts when beams are disabled or reduced motion activates', () => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    addEventListener: (_: 'change', listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    matches: false,
    removeEventListener: (_: 'change', listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
  } as unknown as MediaQueryList;
  vi.stubGlobal('matchMedia', vi.fn(() => query));
  const view = render(<BusinessFlowVertical />);

  fireEvent.click(screen.getByTestId('flow-layer'));
  expect(screen.getByTestId('arrival-burst')).toBeInTheDocument();
  view.rerender(<BusinessFlowVertical beamEnabled={false} />);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
  view.rerender(<BusinessFlowVertical />);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('flow-layer'));
  act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
});

it('clears bursts on source changes but retains them across unrelated rerenders', () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: false,
    removeEventListener: vi.fn(),
  })));
  const view = render(<BusinessFlowVertical />);

  fireEvent.click(screen.getByTestId('flow-layer'));
  view.rerender(<BusinessFlowVertical burstRadius={48} />);
  expect(screen.getByTestId('arrival-burst')).toBeInTheDocument();

  view.rerender(<BusinessFlowVertical burstRadius={48} beamSpeed={2} />);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('flow-layer'));
  view.rerender(<BusinessFlowVertical burstRadius={48} beamSpeed={2} numberOfNodesTop={8} />);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
});
