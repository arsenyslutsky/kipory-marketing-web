import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BusinessFlowHorizontal } from './BusinessFlowHorizontal';

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({ paths, beamSource }: { paths: unknown[]; beamSource: { slots: number } }) => (
    <div data-testid="flow-layer" data-paths={paths.length} data-slots={beamSource.slots} />
  ),
}));

it('renders one shared layer and retains its DOM icon composition', () => {
  render(<BusinessFlowHorizontal />);
  expect(screen.getAllByTestId('flow-layer')).toHaveLength(1);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '12');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-slots', '12');
  expect(screen.getByRole('img', { name: /Horizontal business flow/i })).toBeInTheDocument();
});
