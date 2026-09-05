import type { MaskedBackgroundProps } from './MaskedBackground';
import type { HeroBaseBackgroundProps } from './HeroBaseBackground';

type BackgroundSettings = Omit<MaskedBackgroundProps, 'variant' | 'className' | 'maskSize'>;

export const heroBaseBackgroundDarkProps = {
  colorFrom: '#0a0c0b',
  colorTo: '#0a0c0b',
  style: 'solid',
  angle: 180,
} satisfies Required<HeroBaseBackgroundProps>;

export const heroBaseBackgroundLightProps = {
  colorFrom: '#f3f5ef',
  colorTo: '#f3f5ef',
  style: 'solid',
  angle: 180,
} satisfies Required<HeroBaseBackgroundProps>;

// Each story saves only its corresponding section's visual settings.
export const heroBackgroundHomepageProps = {
  maskWidth: 186,
  maskHeight: 115,
  invert: true,
  maskShape: 'ellipsis',
  maskOpacity: 1,
  maskCenterX: 39,
  maskCenterY: 28,
} satisfies BackgroundSettings;

export const pillarsBackgroundHomepageProps = {
  maskWidth: 125,
  maskHeight: 290,
  invert: false,
  maskShape: 'ellipsis',
  maskOpacity: 1,
  maskCenterX: 93,
  maskCenterY: 50,
  gridSize: 12,
  gridOpacity: 0.4,
} satisfies BackgroundSettings;

export const deliveryBackgroundHomepageProps = {
  maskWidth: 125,
  maskHeight: 290,
  invert: true,
  maskShape: 'ellipsis',
  maskOpacity: 1,
  maskCenterX: 93,
  maskCenterY: 50,
  gridSize: 12,
  gridOpacity: 0.49,
} satisfies BackgroundSettings;
