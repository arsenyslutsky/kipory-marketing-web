import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from '../presets';
import { businessFlowHorizontalPaths } from '../routes';
import horizontalMeta from './BusinessFlowHorizontal.stories';
import * as horizontalStories from './BusinessFlowHorizontal.stories';

describe('BusinessFlowHorizontal Storybook preview', () => {
  it('keeps Foundation unpinned so it follows the active Storybook theme', () => {
    expect(horizontalMeta).not.toHaveProperty('args');
    expect(horizontalStories.Foundation.args).toBeUndefined();
    expect(horizontalStories.Foundation.globals).toBeUndefined();
    expect(horizontalStories.Foundation.parameters?.homepagePreset).toBeUndefined();
  });

  it('offers complete theme-pinned landing-page variants', () => {
    expect(horizontalStories.CurrentNextjsApp.name).toBe('Current App (Dark)');
    expect(horizontalStories.CurrentNextjsApp.globals).toEqual({ theme: 'dark' });
    expect(horizontalStories.CurrentNextjsApp.args).toEqual({
      ...businessFlowHorizontalHomepageDarkProps,
      mode: 'dark',
    });
    expect(horizontalStories.CurrentNextjsApp.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageDarkProps) },
    });

    expect(horizontalStories.CurrentAppLight.name).toBe('Current App (Light)');
    expect(horizontalStories.CurrentAppLight.globals).toEqual({ theme: 'light' });
    expect(horizontalStories.CurrentAppLight.args).toEqual({
      ...businessFlowHorizontalHomepageLightProps,
      mode: 'light',
    });
    expect(horizontalStories.CurrentAppLight.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageLightProps) },
    });
  });

  it('offers theme-safe mode and outline controls under Nodes', () => {
    expect(horizontalMeta.argTypes.mode).toEqual({ table: { disable: true } });
    expect(horizontalMeta.argTypes.outlineOpacity).toMatchObject({
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Nodes' },
    });
    expect(horizontalMeta.argTypes.outlineWidth).toMatchObject({
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
      table: { category: 'Nodes' },
    });
  });

  it('offers bounded controls for left and right node counts', () => {
    expect(horizontalMeta.argTypes.numberOfNodesLeft).toMatchObject({
      control: { type: 'range', min: 0, max: 12, step: 1 },
      table: { category: 'Auxiliary Nodes' },
    });
    expect(horizontalMeta.argTypes.numberOfNodesRight).toMatchObject({
      control: { type: 'range', min: 0, max: 12, step: 1 },
      table: { category: 'Auxiliary Nodes' },
    });
  });

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
