import type { ProtocolIconListProps } from './ProtocolIconList';

export const protocolIconListHomepageProps = {
  comingSoonFrom: 4,
  comingSoonGap: 10,
  comingSoonOnNextLine: true,
  comingSoonRowGap: 48,
  comingSoonTitleColor: '#449c40',
  comingSoonTitleOpacity: 0.5,
  comingSoonLogosOpacity: 0.4,
  comingSoonLineFadeLength: 0.95,
  size: 23,
  title: 'Connect & Deliver',
  logoOpacity: 0.6,
  textOpacity: 0.5,
  scaleOfComingSoonItems: 0.85,
  scaleOfSpaceLogos: 0.5,
  scaleOfSpaceItems: 0.8,
  variants: ['rest', 'sse', 'jsonata', 'mcp', 'webhook', 'graphql'],
} satisfies Partial<ProtocolIconListProps>;
