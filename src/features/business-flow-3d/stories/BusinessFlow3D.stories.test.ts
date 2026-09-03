import { describe, expect, it } from 'vitest';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
} from '../presets';
import meta, * as stories from './BusinessFlow3D.stories';

describe('BusinessFlow3D current-app stories', () => {
  it('offers explicit dark and light variants with independent app presets', () => {
    expect(stories.CurrentNextjsApp).toMatchObject({
      name: 'Current App (Dark)',
      args: { ...businessFlow3DHomepageDarkProps, mode: 'dark' },
    });
    expect(stories.CurrentAppLight).toMatchObject({
      name: 'Current App (Light)',
      args: { ...businessFlow3DHomepageLightProps, mode: 'light' },
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
