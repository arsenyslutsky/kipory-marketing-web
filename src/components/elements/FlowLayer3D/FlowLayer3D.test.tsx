import { act, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { businessFlowHorizontalHomepageProps } from '@/features/business-flow-horizontal/presets';
import { FlowLayer3D } from './FlowLayer3D';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';

vi.mock('./createFlowLayer3DScene', () => ({ createFlowLayer3DScene: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const beam = {
  beamColor: '#449c40',
  beamHighlightColor: '#c9ebc7',
  beamWidth: 1,
  enabled: true,
  glowIntensity: 1,
  trailLength: 0.38,
};

const beamSource = { slots: 0, next: () => null };
const connector = { color: '#fff', opacity: 0.5, stroke: 'dashed' as const, width: 1.25 };
const emptyPaths: readonly [] = [];
const nodes = [{
  cardDepth: 40,
  height: 12,
  icon: 'server.svg',
  iconColor: '#f3f5ef',
  iconOpacity: 1,
  id: 'server',
  position: [0.2, 0.5] as const,
  shape: 'square' as const,
  tier: 2,
  width: 48,
}];
const productionFallbackNodes = [{
  ...nodes[0],
  cardDepth: 34,
  icon: 'download.svg',
  iconColor: businessFlowHorizontalHomepageProps.auxiliaryIconFillColor,
  iconOpacity: 0.72,
  iconStrokeColor: businessFlowHorizontalHomepageProps.color,
  id: 'terminal-1',
  shape: 'rectangle' as const,
  width: 30,
}];
const nodeStyle = {
  assetBasePath: '/assets/nodes',
  frontGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
  mode: 'dark' as const,
  nodeCornerRadius: 12,
  outlineOpacity: 0.5,
  outlineWidth: 1,
  progressBarHeight: 8,
  progressMode: 'outline' as const,
  progressPadding: 2,
  sideXGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
  sideZGradient: { angle: 0, end: '#111', mid: '#222', start: '#333' },
};

it('creates one scene and destroys it on unmount', () => {
  const destroy = vi.fn();
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={[{ id: 'a', points: [[0, 0], [1, 1]] }]}
  />);

  expect(createFlowLayer3DScene).toHaveBeenCalledTimes(1);
  expect(view.container.firstElementChild).toHaveAttribute('aria-hidden', 'true');

  view.unmount();

  expect(destroy).toHaveBeenCalledTimes(1);
});

it('mounts one shared CSS3D layer and passes serializable nodes to the scene', () => {
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn() });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={nodes}
    paths={[]}
  />);

  expect(view.container.querySelectorAll('canvas')).toHaveLength(1);
  expect(view.container.querySelectorAll('[data-flow-layer-css3d]')).toHaveLength(1);
  expect(createFlowLayer3DScene).toHaveBeenCalledWith(expect.objectContaining({
    cssLayer: expect.any(HTMLElement),
    nodes: [expect.objectContaining({ id: 'server' })],
  }));
});

it('does not recreate an omitted-node scene for an unchanged rerender', () => {
  const destroy = vi.fn();
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);

  view.rerender(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);

  expect(createFlowLayer3DScene).toHaveBeenCalledOnce();
  expect(destroy).not.toHaveBeenCalled();
});

it('does not retry a failed omitted-node scene when error state renders', async () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={emptyPaths}
  />);

  await view.findByTestId('flow-layer-node-fallback');
  await waitFor(() => {
    expect(createFlowLayer3DScene).toHaveBeenCalledOnce();
  });
  expect(diagnostic).toHaveBeenCalledOnce();
});

it('activates the fallback when the scene reports a post-mount rebuild failure', async () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  let reportSceneError: ((error: unknown) => void) | undefined;
  vi.mocked(createFlowLayer3DScene).mockImplementation((options) => {
    reportSceneError = options.onError;
    return { destroy: vi.fn() };
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={productionFallbackNodes}
    paths={[]}
  />);

  expect(view.queryByTestId('flow-layer-node-fallback')).not.toBeInTheDocument();
  expect(reportSceneError).toBeTypeOf('function');

  act(() => {
    reportSceneError?.(new Error('resize node rebuild failed'));
  });

  expect(await view.findByTestId('flow-layer-node-fallback')).toBeInTheDocument();
  expect(diagnostic).toHaveBeenCalledWith(expect.objectContaining({
    message: 'resize node rebuild failed',
  }));
});

it('renders CSS-pixel node fallbacks after a WebGL failure and clears them after recovery', async () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={nodes}
    paths={[]}
  />);

  expect(view.container.firstElementChild).toBeInTheDocument();
  expect(diagnostic).toHaveBeenCalledWith(expect.objectContaining({ message: 'WebGL unavailable' }));
  const fallback = await view.findByTestId('flow-layer-node-fallback');
  const fallbackNode = fallback.querySelector('span');
  expect(fallbackNode).toHaveStyle({
    '--flow-node-height': '40px',
    '--flow-node-width': '48px',
    '--flow-node-x': '20%',
    '--flow-node-y': '50%',
  });

  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy: vi.fn() });
  view.rerender(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={nodes}
    paths={[]}
  />);

  await waitFor(() => {
    expect(view.queryByTestId('flow-layer-node-fallback')).not.toBeInTheDocument();
  });
});

it('renders a visible fallback body and a separate contrasting icon with production colors', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    nodeStyle={nodeStyle}
    nodes={productionFallbackNodes}
    paths={[]}
  />);

  const fallback = await view.findByTestId('flow-layer-node-fallback');
  const body = fallback.querySelector<HTMLElement>('[data-flow-node-fallback-body]');
  const icon = fallback.querySelector<HTMLElement>('[data-flow-node-fallback-icon]');

  expect(body).toBeInTheDocument();
  expect(body).toHaveAttribute('data-flow-node-shape', 'rectangle');
  expect(body).toHaveStyle({
    '--flow-node-body-end': '#111',
    '--flow-node-body-mid': '#222',
    '--flow-node-body-start': '#333',
    '--flow-node-icon-color': businessFlowHorizontalHomepageProps.color,
  });
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveStyle({
    '--flow-node-icon': 'url("/assets/nodes/download.svg")',
  });
});
