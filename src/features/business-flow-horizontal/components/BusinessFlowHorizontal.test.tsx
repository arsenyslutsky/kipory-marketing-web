import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import type {
  FlowLayer3DBeamStyle,
  FlowLayer3DConnectorStyle,
  FlowLayer3DNode,
  FlowLayer3DNodeStyle,
} from '@/components/elements/FlowLayer3D';
import { businessFlowPalettes } from '@/features/business-flow-palette';
import { ThemeProvider } from '@/theme/ThemeProvider';
import type { ResolvedTheme } from '@/theme/theme';
import { businessFlowHorizontalHomepageDarkProps } from '../presets';
import { BusinessFlowHorizontal } from './BusinessFlowHorizontal';

let capturedNodes: readonly FlowLayer3DNode[] | undefined;
let capturedNodeStyle: FlowLayer3DNodeStyle | undefined;
let capturedBeam: FlowLayer3DBeamStyle | undefined;
let capturedConnector: FlowLayer3DConnectorStyle | undefined;
let capturedMode: ResolvedTheme | undefined;
let capturedNodeShadow: Record<string, unknown> | undefined;

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({
    beam,
    connector,
    mode,
    paths,
    beamSource,
    nodes,
    nodeShadowBias,
    nodeShadowBlurSamples,
    nodeShadowColor,
    nodeShadowLightX,
    nodeShadowLightY,
    nodeShadowLightZ,
    nodeShadowNormalBias,
    nodeShadowOpacity,
    nodeShadowRadius,
    nodeStyle,
    onActivityChange,
    onArrival,
    reducedMotion,
  }: {
    beam: FlowLayer3DBeamStyle;
    connector: FlowLayer3DConnectorStyle;
    mode?: ResolvedTheme;
    paths: unknown[];
    beamSource: {
      slots: number;
      next: (slot: number, generation: number) => {
        trailLength?: number;
        trailLengthInPixels?: number;
      } | null;
    };
    nodes?: readonly FlowLayer3DNode[];
    nodeShadowBias?: number;
    nodeShadowBlurSamples?: number;
    nodeShadowColor?: string;
    nodeShadowLightX?: number;
    nodeShadowLightY?: number;
    nodeShadowLightZ?: number;
    nodeShadowNormalBias?: number;
    nodeShadowOpacity?: number;
    nodeShadowRadius?: number;
    nodeStyle?: FlowLayer3DNodeStyle;
    onActivityChange?: (active: boolean) => void;
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
    capturedBeam = beam;
    capturedConnector = connector;
    capturedMode = mode;
    capturedNodeShadow = {
      nodeShadowBias,
      nodeShadowBlurSamples,
      nodeShadowColor,
      nodeShadowLightX,
      nodeShadowLightY,
      nodeShadowLightZ,
      nodeShadowNormalBias,
      nodeShadowOpacity,
      nodeShadowRadius,
    };
    return (
      <button
        type="button"
        data-testid="flow-layer"
        data-beam-width={beam.beamWidth}
        data-beam-glow-intensity={beam.glowIntensity}
        data-head-glow-blur={beam.headGlowBlur}
        data-head-glow-opacity={beam.headGlowOpacity}
        data-head-glow-radius={beam.headGlowRadius}
        data-paths={paths.length}
        data-reduced-motion={String(reducedMotion)}
        data-run-trail={beamSource.slots > 0 ? beamSource.next(0, 0)?.trailLength : undefined}
        data-run-trail-pixels={beamSource.slots > 0 ? beamSource.next(0, 0)?.trailLengthInPixels : undefined}
        data-slots={beamSource.slots}
        data-style-trail={beam.trailLength}
        onClick={() => onArrival?.({
          arrival: { id: 'collector', point: [0.2, 0.5], progress: 1 },
          generation: 3,
          runId: 'aux-top:3',
          slot: 0,
        })}
      />
    );
  },
}));

afterEach(() => {
  capturedNodes = undefined;
  capturedNodeStyle = undefined;
  capturedBeam = undefined;
  capturedConnector = undefined;
  capturedMode = undefined;
  capturedNodeShadow = undefined;
  vi.unstubAllGlobals();
});

it('inherits the light palette from theme context', () => {
  render(
    <ThemeProvider preference="light">
      <BusinessFlowHorizontal />
    </ThemeProvider>,
  );

  expect(capturedMode).toBe('light');
  expect(capturedNodeStyle).toMatchObject({
    mode: 'light',
    frontGradient: { angle: 117, start: '#98c496', mid: '#449c40', end: '#449c40' },
    sideXGradient: { angle: 360, start: '#449c40', mid: '#449c40', end: '#449c40' },
    sideZGradient: { angle: 177, start: '#449c40', mid: '#449c40', end: '#449c40' },
    nodeCornerRadius: 0,
    outlineOpacity: 0.3,
    outlineWidth: 1.25,
  });
  expect(capturedConnector).toMatchObject({
    color: '#449c40',
    stroke: 'solid',
  });
  expect(capturedBeam?.beamColor).toBe(businessFlowPalettes.light.beam);
  expect(capturedNodes?.find((node) => node.id === 'collector')).toMatchObject({
    iconColor: '#182019',
    iconStrokeColor: '#ffffff',
  });
  expect(capturedNodeShadow).toMatchObject({
    nodeShadowLightX: -6,
    nodeShadowLightY: 14,
    nodeShadowLightZ: -5,
    nodeShadowOpacity: 0.38,
    nodeShadowRadius: 8,
  });
});

it('lets explicit node-outline values override the active theme treatment', () => {
  render(
    <ThemeProvider preference="light">
      <BusinessFlowHorizontal outlineOpacity={0.72} outlineWidth={2.5} />
    </ThemeProvider>,
  );

  expect(capturedNodeStyle).toMatchObject({
    mode: 'light',
    outlineOpacity: 0.72,
    outlineWidth: 2.5,
  });
});

it('passes explicit node body and face gradients to the shared renderer', () => {
  render(
    <BusinessFlowHorizontal
      nodeBodyColor="#010203"
      nodeFrontGradientAngle={11}
      nodeFrontGradientStartColor="#111111"
      nodeFrontGradientMidColor="#222222"
      nodeFrontGradientEndColor="#333333"
      nodeSideXGradientAngle={22}
      nodeSideXGradientStartColor="#444444"
      nodeSideXGradientMidColor="#555555"
      nodeSideXGradientEndColor="#666666"
      nodeSideZGradientAngle={33}
      nodeSideZGradientStartColor="#777777"
      nodeSideZGradientMidColor="#888888"
      nodeSideZGradientEndColor="#999999"
    />,
  );

  expect(capturedNodeStyle).toMatchObject({
    bodyColor: '#010203',
    frontGradient: { angle: 11, start: '#111111', mid: '#222222', end: '#333333' },
    sideXGradient: { angle: 22, start: '#444444', mid: '#555555', end: '#666666' },
    sideZGradient: { angle: 33, start: '#777777', mid: '#888888', end: '#999999' },
  });
});

it('falls back to the dark palette outside theme context', () => {
  render(<BusinessFlowHorizontal />);

  expect(capturedMode).toBe('dark');
  expect(capturedNodeStyle).toMatchObject({
    mode: 'dark',
    frontGradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
    nodeCornerRadius: 10,
    outlineOpacity: 0,
    outlineWidth: 1,
  });
  expect(capturedConnector).toMatchObject({
    color: businessFlowPalettes.dark.connector,
    stroke: 'dashed',
  });
  expect(capturedNodes?.find((node) => node.id === 'collector')).toMatchObject({
    iconColor: '#f3f5ef',
    iconStrokeColor: '#f3f5ef',
  });
});

it('passes public node-shadow parameters to the shared renderer', () => {
  render(
    <BusinessFlowHorizontal
      nodeShadowBias={-0.001}
      nodeShadowBlurSamples={11}
      nodeShadowColor="#123456"
      nodeShadowLightX={-4}
      nodeShadowLightY={9}
      nodeShadowLightZ={-3}
      nodeShadowNormalBias={0.04}
      nodeShadowOpacity={0.37}
      nodeShadowRadius={6}
    />,
  );

  expect(capturedNodeShadow).toEqual({
    nodeShadowBias: -0.001,
    nodeShadowBlurSamples: 11,
    nodeShadowColor: '#123456',
    nodeShadowLightX: -4,
    nodeShadowLightY: 9,
    nodeShadowLightZ: -3,
    nodeShadowNormalBias: 0.04,
    nodeShadowOpacity: 0.37,
    nodeShadowRadius: 6,
  });
});

it('honors an explicit dark mode over light theme context', () => {
  render(
    <ThemeProvider preference="light">
      <BusinessFlowHorizontal mode="dark" />
    </ThemeProvider>,
  );
  expect(capturedMode).toBe('dark');
  expect(capturedNodeStyle).toMatchObject({ mode: 'dark' });
  expect(capturedConnector?.color).toBe(businessFlowPalettes.dark.connector);
});

it('renders one shared Node3D layer instead of DOM icon SVGs', () => {
  const { container } = render(<BusinessFlowHorizontal />);
  expect(screen.getAllByTestId('flow-layer')).toHaveLength(1);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '12');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-slots', '12');
  expect(capturedNodes).toHaveLength(13);
  expect(capturedNodes?.find((node) => node.id === 'collector')).toMatchObject({ shape: 'hexagon' });
  expect(capturedNodeStyle).toMatchObject({ assetBasePath: '/assets/nodes' });
  expect(container.querySelectorAll('svg')).toHaveLength(0);
  expect(screen.getByRole('img', { name: /Horizontal business flow/i })).toBeInTheDocument();
});

it('keeps custom left and right node counts synchronized across nodes, paths, and its description', () => {
  render(<BusinessFlowHorizontal numberOfNodesLeft={2} numberOfNodesRight={4} />);

  expect(capturedNodes?.filter((node) => node.id.startsWith('left-'))).toHaveLength(2);
  expect(capturedNodes?.filter((node) => node.id.startsWith('right-'))).toHaveLength(4);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '9');
  expect(screen.getByRole('img', {
    name: 'Horizontal business flow with 4 nodes on the right, one collector, three relays, and 2 nodes on the left',
  })).toBeInTheDocument();
});

it('uses singular node labels when either configurable side has one node', () => {
  render(<BusinessFlowHorizontal numberOfNodesLeft={1} numberOfNodesRight={1} />);

  expect(screen.getByRole('img', {
    name: 'Horizontal business flow with 1 node on the right, one collector, three relays, and 1 node on the left',
  })).toBeInTheDocument();
});

it('gives iconStrokeColor precedence for every node stroke without changing role fills', () => {
  render(
    <BusinessFlowHorizontal
      auxiliaryIconFillColor="#111111"
      centralIconFillColor="#222222"
      color="#legacy"
      iconStrokeColor="#abcdef"
    />,
  );

  expect(capturedNodes).toHaveLength(13);
  expect(capturedNodes?.every((node) => node.iconStrokeColor === '#abcdef')).toBe(true);
  expect(capturedNodes?.filter((node) => /^(left|right)-/.test(node.id)).every((node) => node.iconColor === '#111111'))
    .toBe(true);
  expect(capturedNodes?.filter((node) => !/^(left|right)-/.test(node.id)).every((node) => node.iconColor === '#222222'))
    .toBe(true);
});

it('lets callers tune auxiliary and central icon opacity independently', () => {
  render(
    <BusinessFlowHorizontal
      auxiliaryIconOpacity={0.31}
      centralIconOpacity={0.84}
    />,
  );

  expect(capturedNodes?.filter((node) => /^(left|right)-/.test(node.id)))
    .toEqual(expect.arrayContaining([
      expect.objectContaining({ iconOpacity: 0.31 }),
    ]));
  expect(capturedNodes?.filter((node) => !/^(left|right)-/.test(node.id)))
    .toEqual(expect.arrayContaining([
      expect.objectContaining({ iconOpacity: 0.84 }),
    ]));
});

it('renders homepage node processing progress as outlines', () => {
  render(<BusinessFlowHorizontal {...businessFlowHorizontalHomepageDarkProps} />);

  expect(capturedNodeStyle).toMatchObject({
    progressBarHeight: 15,
    progressMaxDelay: 1800,
    progressMinDelay: 500,
    progressMode: 'outline',
  });
});

it('propagates custom node progress size, type, and delay range to the shared layer', () => {
  render(
    <BusinessFlowHorizontal
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

it('renders the homepage illustration another twenty percent wider without exceeding its container', () => {
  render(<BusinessFlowHorizontal {...businessFlowHorizontalHomepageDarkProps} />);

  const illustration = screen.getByRole('img', { name: /Horizontal business flow/i });
  expect(illustration.style.getPropertyValue('--camera-width')).toBe('min(28.8rem, 100%)');
});

it('renders the homepage illustration tall enough to span the four-row delivery list', () => {
  render(<BusinessFlowHorizontal {...businessFlowHorizontalHomepageDarkProps} />);

  const illustration = screen.getByRole('img', { name: /Horizontal business flow/i });
  expect(illustration.style.getPropertyValue('--camera-height')).toBe('50rem');
});

it('propagates the complete homepage beam effect to the shared layer', () => {
  render(<BusinessFlowHorizontal {...businessFlowHorizontalHomepageDarkProps} />);

  const layer = screen.getByTestId('flow-layer');
  expect(layer).toHaveAttribute('data-beam-width', '1.75');
  expect(layer).toHaveAttribute('data-head-glow-blur', '2');
  expect(layer).toHaveAttribute('data-head-glow-opacity', '1');
  expect(layer).toHaveAttribute('data-head-glow-radius', '11');
  expect(layer).toHaveAttribute('data-style-trail', '0');
  expect(layer).toHaveAttribute('data-run-trail-pixels', '135');
  expect(layer).toHaveAttribute('data-slots', '5');
});

it('lets saved beam width and glow intensity override connector-derived defaults', () => {
  render(
    <BusinessFlowHorizontal
      beamGlowIntensity={2.4}
      beamWidth={3.2}
      connectorWidth={0.5}
    />,
  );

  const layer = screen.getByTestId('flow-layer');
  expect(layer).toHaveAttribute('data-beam-width', '3.2');
  expect(layer).toHaveAttribute('data-beam-glow-intensity', '2.4');
});

it('renders real arrival bursts with homepage visuals and removes completed bursts', () => {
  render(<BusinessFlowHorizontal {...businessFlowHorizontalHomepageDarkProps} />);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();

  fireEvent.click(screen.getByTestId('flow-layer'));
  const burst = screen.getByTestId('arrival-burst');
  expect(burst).toHaveStyle({ left: '20%', top: '50%' });
  expect(burst.parentElement?.style.getPropertyValue('--workflow-burst-radius')).toBe('24px');
  expect(burst.parentElement?.style.getPropertyValue('--workflow-burst-fade-time')).toBe('900ms');
  expect(burst.parentElement?.style.getPropertyValue('--workflow-burst-strength')).toBe('0.5');

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
  const view = render(<BusinessFlowHorizontal />);

  fireEvent.click(screen.getByTestId('flow-layer'));
  expect(screen.getByTestId('arrival-burst')).toBeInTheDocument();
  view.rerender(<BusinessFlowHorizontal beamEnabled={false} />);
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
  view.rerender(<BusinessFlowHorizontal />);

  fireEvent.click(screen.getByTestId('flow-layer'));
  act(() => listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent)));
  expect(screen.queryByTestId('arrival-burst')).not.toBeInTheDocument();
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
