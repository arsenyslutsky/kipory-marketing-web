import { render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { FlowLayer3D } from './FlowLayer3D';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';

vi.mock('./createFlowLayer3DScene', () => ({ createFlowLayer3DScene: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

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
