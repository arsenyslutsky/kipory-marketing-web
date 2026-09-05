'use client';

import { useResolvedTheme } from '@/theme/ThemeProvider';
import { heroBaseBackgroundDarkProps, heroBaseBackgroundLightProps } from './MaskedBackground.presets';
import styles from './HeroBaseBackground.module.css';

export type HeroBaseBackgroundProps = {
  colorFrom?: string;
  colorTo?: string;
  style?: 'solid' | 'linear' | 'circle';
  angle?: number;
};

/** Unmasked base surface; the illustration and masked green tint remain separate layers. */
export function HeroBaseBackground(overrides: HeroBaseBackgroundProps) {
  const theme = useResolvedTheme();
  const { colorFrom, colorTo, style, angle } = {
    ...(theme === 'light' ? heroBaseBackgroundLightProps : heroBaseBackgroundDarkProps),
    ...overrides,
  };
  const background = style === 'linear'
    ? `linear-gradient(${angle}deg, ${colorFrom}, ${colorTo})`
    : style === 'circle'
      ? `radial-gradient(circle at center, ${colorFrom}, ${colorTo})`
      : colorFrom;

  return <div aria-hidden="true" data-hero-base-background className={styles.root} style={{ background }} />;
}
