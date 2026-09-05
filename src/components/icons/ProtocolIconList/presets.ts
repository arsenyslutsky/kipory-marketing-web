import type { ProtocolIconListProps } from './ProtocolIconList';

export const protocolIconListHomepageProps = {
  comingSoonFrom: 4,
  comingSoonOnNextLine: false,
  comingSoonRowGap: 49,
  comingSoonTitleColor: 'var(--signal-copy)',
  comingSoonTitleOpacity: 1,
  comingSoonLogosOpacity: 0.9,
  comingSoonLineFadeLength: 0.7,
  size: 23,
  title: 'Connect & Deliver',
  logoOpacity: 0.6,
  textOpacity: 0.5,
  scaleOfComingSoonItems: 0.9,
  scaleOfSpaceLogos: 0.5,
  scaleOfSpaceItems: 0.5,
  variants: ['rest', 'sse', 'jsonata', 'mcp', 'webhook', 'graphql'],
} satisfies Partial<ProtocolIconListProps>;
