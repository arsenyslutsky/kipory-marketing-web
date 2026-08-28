import type { GlowLinkVisualProps } from './GlowLink';

export const glowLinkHomepageProps = {
  glowActive: false,
  glowBlur: 5,
  glowColor: 'var(--accent)',
  glowDuration: 3.8,
  glowEdgeColor: 'var(--accent-dark)',
  glowEdgeDuration: 3.6,
  glowHoverOpacity: 1,
  glowIdleOpacity: 0.13,
  glowSpread: 6,
} satisfies GlowLinkVisualProps;
