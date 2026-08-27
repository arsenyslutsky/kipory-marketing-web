import { expect, it } from 'vitest';
import { createBusinessFlowHorizontalNodes } from './nodes';

it('maps collector, relays, and terminals to the approved Node3D hierarchy', () => {
  const nodes = createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconStrokeOpacity: 0.52,
    iconSize: 40,
    strokeWidth: 1.5,
  });

  expect(nodes).toHaveLength(10);
  expect(nodes.find((node) => node.id === 'collector')).toMatchObject({
    height: 12,
    icon: 'intelligence.svg',
    position: [248 / 320, 304 / 608],
    shape: 'hexagon',
    width: 58,
  });
  const relays = nodes.filter((node) => node.id.startsWith('relay'));
  const terminals = nodes.filter((node) => node.id.startsWith('terminal'));
  expect(relays.every((node) => node.shape === 'square' && node.width === 48)).toBe(true);
  expect(terminals.every((node) => node.shape === 'rectangle' && node.width === 30)).toBe(true);
});
