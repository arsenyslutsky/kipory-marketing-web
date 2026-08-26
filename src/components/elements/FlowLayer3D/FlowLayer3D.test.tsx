import { render } from '@testing-library/react';
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

it('keeps its decorative container when WebGL initialization fails', () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => {
    throw new Error('WebGL unavailable');
  });
  const view = render(<FlowLayer3D
    beam={beam}
    beamSource={beamSource}
    connector={connector}
    paths={[]}
  />);

  expect(view.container.firstElementChild).toBeInTheDocument();
  expect(diagnostic).toHaveBeenCalledWith(expect.objectContaining({ message: 'WebGL unavailable' }));
});
