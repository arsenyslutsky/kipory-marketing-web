import { describe, expect, it } from 'vitest';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
} from '../presets';
import meta, * as stories from './BusinessFlow3D.stories';

describe('BusinessFlow3D current-app stories', () => {
  it('offers explicit dark and light variants with independent app presets', () => {
    expect(stories.CurrentNextjsApp.name).toBe('Current App (Dark)');
    expect(stories.CurrentNextjsApp.args).toEqual({
      ...businessFlow3DHomepageDarkProps,
      mode: 'dark',
    });
    expect(stories.CurrentAppLight.name).toBe('Current App (Light)');
    expect(stories.CurrentAppLight.args).toEqual({
      ...businessFlow3DHomepageLightProps,
      mode: 'light',
    });
  });

  it('keeps homepage-preset metadata on both variants', () => {
    expect(stories.CurrentNextjsApp.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlow3DHomepageDarkProps) },
    });
    expect(stories.CurrentAppLight.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlow3DHomepageLightProps) },
    });
  });
});

it('exposes the active progress fill as a color control', () => {
  expect(meta.argTypes.progressBarColor).toMatchObject({
    control: 'color',
    description: 'Color of the active progress fill. The inactive track remains theme-derived.',
    name: 'Progress color',
    table: { category: 'Progress' },
  });
});

it('exposes independent node and connector elevation controls', () => {
  expect(meta.argTypes.nodeElevation).toMatchObject({
    control: { max: 4, min: -0.25, step: 0.05, type: 'range' },
    description: 'Additive world-space elevation applied to every node and its animated base position.',
    name: 'Node elevation',
    table: { category: 'Nodes' },
  });
  expect(meta.argTypes.connectorElevation).toMatchObject({
    control: { max: 4, min: -0.1, step: 0.05, type: 'range' },
    description: 'Requested world-space elevation shared by connectors, junctions, and travelling beams, capped below node bodies.',
    name: 'Connector elevation',
    table: { category: 'Connectors' },
  });
});
