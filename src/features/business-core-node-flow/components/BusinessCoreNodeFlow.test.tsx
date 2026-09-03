import { render, screen } from '@testing-library/react';
import type {
  FlowLayer3DBeamStyle,
  FlowLayer3DConnectorStyle,
  FlowLayer3DNode,
  FlowLayer3DNodeStyle,
  FlowLayer3DPath,
} from '@/components/elements/FlowLayer3D';
import { businessFlowPalettes } from '@/features/business-flow-palette';
import { ThemeProvider } from '@/theme/ThemeProvider';
import type { ResolvedTheme } from '@/theme/theme';
import { afterEach, expect, it, vi } from 'vitest';
import { BusinessCoreNodeFlow } from './BusinessCoreNodeFlow';

let capturedBeam: FlowLayer3DBeamStyle | undefined;
let capturedConnector: FlowLayer3DConnectorStyle | undefined;
let capturedNodes: readonly FlowLayer3DNode[] | undefined;
let capturedNodeStyle: FlowLayer3DNodeStyle | undefined;
let capturedPaths: readonly FlowLayer3DPath[] | undefined;
let capturedMode: ResolvedTheme | undefined;
let capturedNodeShadow: Record<string, unknown> | undefined;

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({
    beam,
    connector,
    mode,
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
    paths,
  }: {
    beam: FlowLayer3DBeamStyle;
    connector: FlowLayer3DConnectorStyle;
    mode?: ResolvedTheme;
    nodes: readonly FlowLayer3DNode[];
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
    paths: readonly FlowLayer3DPath[];
  }) => {
    capturedBeam = beam;
    capturedConnector = connector;
    capturedNodes = nodes;
    capturedNodeStyle = nodeStyle;
    capturedPaths = paths;
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
    return <div data-testid="flow-layer" />;
  },
}));

afterEach(() => {
  capturedBeam = undefined;
  capturedConnector = undefined;
  capturedNodes = undefined;
  capturedNodeStyle = undefined;
  capturedPaths = undefined;
  capturedMode = undefined;
  capturedNodeShadow = undefined;
  vi.unstubAllGlobals();
});

it('inherits the light palette from theme context', () => {
  render(
    <ThemeProvider preference="light">
      <BusinessCoreNodeFlow />
    </ThemeProvider>,
  );

  expect(capturedMode).toBe('light');
  expect(capturedNodeStyle).toMatchObject({ mode: 'light' });
  expect(capturedConnector?.color).toBe(businessFlowPalettes.light.connector);
  expect(capturedBeam?.beamColor).toBe(businessFlowPalettes.light.beam);
  expect(capturedNodes?.find((node) => node.id === 'core')).toMatchObject({
    iconColor: businessFlowPalettes.light.horizontalCentralIconFill,
    iconStrokeColor: businessFlowPalettes.light.horizontalIconStroke,
  });
});

it('falls back to the dark palette outside theme context', () => {
  render(<BusinessCoreNodeFlow />);

  expect(capturedMode).toBe('dark');
  expect(capturedNodeStyle).toMatchObject({ mode: 'dark' });
  expect(capturedConnector?.color).toBe(businessFlowPalettes.dark.connector);
});

it('passes public node-shadow parameters to the shared renderer', () => {
  render(
    <BusinessCoreNodeFlow
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
      <BusinessCoreNodeFlow mode="dark" />
    </ThemeProvider>,
  );
  expect(capturedMode).toBe('dark');
  expect(capturedNodeStyle).toMatchObject({ mode: 'dark' });
  expect(capturedConnector?.color).toBe(businessFlowPalettes.dark.connector);
});

it('renders a square radial flow with one core and the configured auxiliaries', () => {
  render(<BusinessCoreNodeFlow numberOfAuxiliaryConnections={8} size="36rem" />);

  const illustration = screen.getByRole('img', {
    name: 'Business core node flow with 8 outward auxiliary connections and visible auxiliary nodes',
  });
  expect(illustration.style.getPropertyValue('--camera-size')).toBe('36rem');
  expect(capturedNodes).toHaveLength(9);
  expect(capturedNodes?.find((node) => node.id === 'core')).toMatchObject({
    position: [0.5, 0.5],
    shape: 'hexagon',
  });
  expect(capturedPaths).toHaveLength(8);
  expect(capturedPaths?.every((path) => path.fading)).toBe(true);
});

it('keeps radial connections and beams when auxiliary nodes are hidden', () => {
  render(
    <BusinessCoreNodeFlow
      maxConcurrentBeams={12}
      numberOfAuxiliaryConnections={12}
      showAuxiliaryNodes={false}
    />,
  );

  expect(capturedNodes).toHaveLength(1);
  expect(capturedPaths).toHaveLength(12);
  expect(screen.getByRole('img', {
    name: 'Business core node flow with 12 outward auxiliary connections and hidden auxiliary nodes',
  })).toBeInTheDocument();
});

it('propagates public connector and beam styling to the shared flow layer', () => {
  render(
    <BusinessCoreNodeFlow
      beamColor="#123456"
      beamEnabled={false}
      beamHeadGlowBlur={4}
      beamHeadGlowOpacity={0.7}
      beamHeadGlowRadius={18}
      beamHighlightColor="#abcdef"
      connectorColor="#345678"
      connectorOpacity={0.44}
      connectorWidth={2.5}
    />,
  );

  expect(capturedConnector).toEqual({
    color: '#345678',
    opacity: 0.44,
    stroke: 'dashed',
    width: 2.5,
  });
  expect(capturedBeam).toMatchObject({
    beamColor: '#123456',
    beamHighlightColor: '#abcdef',
    enabled: false,
    headGlowBlur: 4,
    headGlowOpacity: 0.7,
    headGlowRadius: 18,
  });
});

it('applies separate core and auxiliary icon selections', () => {
  render(
    <BusinessCoreNodeFlow
      auxiliaryIcon="vector"
      centralIcon="server"
      numberOfAuxiliaryConnections={3}
    />,
  );

  expect(capturedNodes?.find((node) => node.id === 'core')?.icon).toBe('server.svg');
  expect(capturedNodes?.filter((node) => node.id.startsWith('auxiliary-')).map((node) => node.icon)).toEqual([
    'vector.svg',
    'vector.svg',
    'vector.svg',
  ]);
});
