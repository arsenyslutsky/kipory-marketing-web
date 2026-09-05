import { render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import meta, { Hero, OurPillars, Delivery } from './MaskedBackground.stories';
import * as backgroundStories from './MaskedBackground.stories';
import { filterHomepagePresetArgs, isHomepagePresetStoryId } from '../../../.storybook/homepagePresetContract';

beforeEach(() => {
  // Exercise the production mobile fallback: jsdom has no WebGL renderer.
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
});

afterEach(() => vi.unstubAllGlobals());

it.each([
  ['HeroLight', 'hero-light', Hero],
  ['OurPillarsLight', 'our-pillars-light', OurPillars],
  ['DeliveryLight', 'delivery-light', Delivery],
] as const)('provides %s with a pinned light theme and the matching section save controls', (exportName, slug, darkStory) => {
  const lightStory = (backgroundStories as unknown as Record<string, typeof Hero>)[exportName];
  expect(lightStory).toBeDefined();
  expect(darkStory.globals).toEqual({ theme: 'dark' });
  expect(lightStory.globals).toEqual({ theme: 'light' });
  expect(isHomepagePresetStoryId(`marketing-masked-background--${slug}`)).toBe(true);
  expect(lightStory.parameters?.homepagePreset).toEqual(darkStory.parameters?.homepagePreset);
  if (exportName === 'HeroLight') {
    expect(lightStory.args).toEqual({ ...darkStory.args, colorFrom: '#f3f5ef', colorTo: '#f3f5ef' });
  } else {
    expect(lightStory.args).toEqual(darkStory.args);
  }
});

it('removes the variant selector from controls', () => {
  expect(meta.argTypes.variant).toMatchObject({ table: { disable: true } });
});

it.each([
  ['hero', 'hero', Hero, ['maskWidth', 'maskHeight', 'invert', 'maskShape', 'maskOpacity', 'maskCenterX', 'maskCenterY', 'colorFrom', 'colorTo', 'style', 'angle']],
  ['pillars', 'our-pillars', OurPillars, ['maskWidth', 'maskHeight', 'invert', 'maskShape', 'maskOpacity', 'maskCenterX', 'maskCenterY', 'gridSize', 'gridOpacity']],
  ['delivery', 'delivery', Delivery, ['maskWidth', 'maskHeight', 'invert', 'maskShape', 'maskOpacity', 'maskCenterX', 'maskCenterY', 'gridSize', 'gridOpacity']],
] as const)('locks %s to its story and registers only its editable save controls', (variant, slug, story, keys) => {
  expect(isHomepagePresetStoryId(`marketing-masked-background--${slug}`)).toBe(true);
  expect(story.parameters?.homepagePreset?.keys).toEqual(keys);
  const args = { ...meta.args, ...story.args, variant: 'delivery' as const, maskSize: 120, maskWidth: 500, maskHeight: 50, invert: false, maskShape: 'ellipsis' as const, maskOpacity: 0, maskCenterX: 0, maskCenterY: 100 };
  const renderStory = story.render ?? meta.render;
  const { container } = render(renderStory(args, {} as never));
  expect(container.querySelector('[data-masked-background]')).toHaveAttribute('data-masked-background', variant);
  const saved = filterHomepagePresetArgs(args, { ...meta.argTypes, ...story.argTypes }, keys);
  if (variant === 'hero') expect(saved).toMatchObject({ colorFrom: '#0a0c0b', style: 'solid', angle: 180 });
  expect(saved).not.toHaveProperty('maskSize');
  expect(saved).toMatchObject({ maskWidth: 500, maskHeight: 50 });
  expect(saved).toHaveProperty('invert', false);
  expect(saved).toMatchObject({ maskShape: 'ellipsis', maskOpacity: 0, maskCenterX: 0, maskCenterY: 100 });
  expect(saved).not.toHaveProperty('variant');
});

it('shows angle only for a linear hero base', () => {
  expect(Hero.argTypes?.angle?.if).toEqual({ arg: 'style', eq: 'linear' });
  expect(Hero.argTypes?.style?.options).toEqual(['solid', 'linear', 'circle']);
});

it.each([
  ['hero', Hero],
  ['pillars', OurPillars],
  ['delivery', Delivery],
] as const)('previews the real %s background variant in Storybook', (variant, story) => {
  const { container } = render(meta.render({ ...meta.args, ...story.args }));
  const background = container.querySelector('[data-masked-background]');
  expect(background).toHaveAttribute('data-masked-background', variant);
  expect(background).toHaveAttribute('aria-hidden', 'true');
  expect(container.querySelectorAll('[data-masked-background]')).toHaveLength(1);
});
