import { render } from '@testing-library/react';
import { expect, it } from 'vitest';
import { businessFlowPalette } from '@/features/business-flow-palette';
import { PillarIcon } from './PillarIcon';

it('keeps its exported color props optional by rendering established dark defaults', () => {
  const view = render(<PillarIcon name="server" />);
  const stops = view.container.querySelectorAll('stop');

  expect(stops[0]).toHaveAttribute('stop-color', businessFlowPalette.frontGradient.start);
  expect(stops[1]).toHaveAttribute('stop-color', businessFlowPalette.frontGradient.mid);
  expect(stops[2]).toHaveAttribute('stop-color', businessFlowPalette.frontGradient.end);
});
