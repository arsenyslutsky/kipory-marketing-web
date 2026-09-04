import { describe, expect, it } from 'vitest';

import {
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
} from '../presets';
import verticalMeta from './BusinessFlowVertical.stories';
import * as verticalStories from './BusinessFlowVertical.stories';

describe('BusinessFlowVertical current-app stories', () => {
  it('keeps Foundation unpinned so it follows the active Storybook theme', () => {
    expect(verticalMeta).not.toHaveProperty('args');
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

  it('exposes the icon opacity and outline controls required by the landing-page treatment', () => {
    for (const key of ['auxiliaryIconOpacity', 'centralIconOpacity'] as const) {
      expect(verticalMeta.argTypes[key]).toMatchObject({
        control: { type: 'range', min: 0, max: 1, step: 0.01 },
      });
    }
    expect(verticalMeta.argTypes.outlineOpacity).toMatchObject({
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
    });
    expect(verticalMeta.argTypes.outlineWidth).toMatchObject({
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
    });
  });

  it('exposes the complete beam body and saved trail treatment', () => {
    expect(verticalMeta.argTypes.beamWidth).toMatchObject({
      control: { type: 'range', min: 0.1, max: 4, step: 0.1 },
      table: { category: 'Beams' },
    });
    expect(verticalMeta.argTypes.beamGlowIntensity).toMatchObject({
      control: { type: 'range', min: 0, max: 3, step: 0.05 },
      table: { category: 'Beams' },
    });
    expect(verticalMeta.argTypes.beamTrailLength).toMatchObject({
      control: { type: 'range', min: 0, max: 320, step: 1 },
      table: { category: 'Beams' },
    });
  });

  it('labels the shared trail setting in CSS pixels', () => {
    expect(verticalMeta.argTypes.beamTrailLength.description).toBe(
      'Length of the glowing trail behind each beam, measured along its connector path in CSS pixels. Use 0 for an orb only.',
    );
  });
});
