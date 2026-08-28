import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { businessFlowHorizontalPaths } from '../routes';
import horizontalMeta from './BusinessFlowHorizontal.stories';

describe('BusinessFlowHorizontal Storybook preview', () => {
  it('gives the percentage-sized illustration a full-width containing block', () => {
    expect(horizontalMeta.parameters.layout).toBe('fullscreen');

    const decorator = horizontalMeta.decorators?.[0];
    expect(decorator).toBeDefined();

    const preview = decorator?.(() => <span>Horizontal flow preview</span>);
    render(preview);

    expect(screen.getByText('Horizontal flow preview').parentElement).toHaveStyle({
      minHeight: '100vh',
      width: '100%',
    });
  });

  it('lets the trail-length control span every horizontal route', () => {
    const longestRouteLength = Math.max(...businessFlowHorizontalPaths.map((path) => (
      path.points.slice(1).reduce((length, point, index) => {
        const previousPoint = path.points[index];
        return length + Math.hypot(
          (point[0] - previousPoint[0]) * 320,
          (point[1] - previousPoint[1]) * 608,
        );
      }, 0)
    )));
    const control = horizontalMeta.argTypes.beamTrailLength.control;

    expect(control).toEqual(expect.objectContaining({ min: 0 }));
    expect(typeof control === 'object' && control?.max).toBeGreaterThanOrEqual(longestRouteLength);
  });
});
