import { describe, expect, it } from 'vitest';

import {
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
} from '../presets';
import verticalMeta from './BusinessFlowVertical.stories';
import * as verticalStories from './BusinessFlowVertical.stories';

describe('BusinessFlowVertical current-app stories', () => {
  it('keeps Foundation unpinned so it follows the active Storybook theme', () => {
    expect(verticalMeta.args).toBeUndefined();
    expect(verticalStories.Foundation.args).toBeUndefined();
    expect(verticalStories.Foundation.globals).toBeUndefined();
    expect(verticalStories.Foundation.parameters?.homepagePreset).toBeUndefined();
  });

  it('offers complete theme-pinned landing-page variants', () => {
    expect(verticalStories.CurrentNextjsApp.name).toBe('Current App (Dark)');
    expect(verticalStories.CurrentNextjsApp.globals).toEqual({ theme: 'dark' });
    expect(verticalStories.CurrentNextjsApp.args).toEqual({
      ...businessFlowVerticalHomepageDarkProps,
      mode: 'dark',
    });
    expect(verticalStories.CurrentNextjsApp.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlowVerticalHomepageDarkProps) },
    });

    expect(verticalStories.CurrentAppLight.name).toBe('Current App (Light)');
    expect(verticalStories.CurrentAppLight.globals).toEqual({ theme: 'light' });
    expect(verticalStories.CurrentAppLight.args).toEqual({
      ...businessFlowVerticalHomepageLightProps,
      mode: 'light',
    });
    expect(verticalStories.CurrentAppLight.parameters).toEqual({
      homepagePreset: { keys: Object.keys(businessFlowVerticalHomepageLightProps) },
    });
  });

  it('disables direct mode editing', () => {
    expect(verticalMeta.argTypes.mode).toEqual({ table: { disable: true } });
  });
});
