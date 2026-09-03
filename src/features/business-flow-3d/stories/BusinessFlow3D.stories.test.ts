import { describe, expect, it } from 'vitest';
import { businessFlow3DHomepageProps } from '../presets';
import * as stories from './BusinessFlow3D.stories';

describe('BusinessFlow3D current-app stories', () => {
  it('offers explicit dark and light variants of the shared app preset', () => {
    expect(stories.CurrentNextjsApp).toMatchObject({
      name: 'Current App (Dark)',
      args: { ...businessFlow3DHomepageProps, mode: 'dark' },
    });
    expect(stories.CurrentAppLight).toMatchObject({
      name: 'Current App (Light)',
      args: { ...businessFlow3DHomepageProps, mode: 'light' },
    });
  });

  it('keeps homepage-preset metadata on both variants', () => {
    const homepagePreset = { keys: Object.keys(businessFlow3DHomepageProps) };

    expect(stories.CurrentNextjsApp.parameters).toEqual({ homepagePreset });
    expect(stories.CurrentAppLight.parameters).toEqual({ homepagePreset });
  });
});
