import { describe, expect, it } from 'vitest';

import meta, { CurrentNextjsApp } from './GlowLink.stories';
import { glowLinkHomepageProps } from './GlowLink.presets';

const glowKeys = [
  'glowActive',
  'glowBlur',
  'glowColor',
  'glowDuration',
  'glowEdgeColor',
  'glowEdgeDuration',
  'glowHoverOpacity',
  'glowIdleOpacity',
  'glowSpread',
] as const;

describe('GlowLink stories', () => {
  it('exposes every glow parameter as a Storybook control', () => {
    expect(Object.keys(meta.argTypes)).toEqual(expect.arrayContaining([...glowKeys]));
    expect(glowKeys).toHaveLength(9);
  });

  it('keeps the Current Next.js App story aligned with the shared homepage preset', () => {
    expect(CurrentNextjsApp.args).toEqual(glowLinkHomepageProps);
    expect(CurrentNextjsApp.parameters).toEqual({
      homepagePreset: { keys: Object.keys(glowLinkHomepageProps) },
    });
  });
});
