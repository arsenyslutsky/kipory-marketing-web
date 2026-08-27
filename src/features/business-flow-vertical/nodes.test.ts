import { expect, it } from 'vitest';
import {
  createBusinessFlowVerticalNodes,
  createBusinessFlowVerticalSatellites,
} from './nodes';

it('creates medium central squares and small document satellites', () => {
  const satellites = createBusinessFlowVerticalSatellites(2, 2, 1);
  const nodes = createBusinessFlowVerticalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconFillMode: 'gradient',
    centralIconStrokeOpacity: 0.52,
    gradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
    iconSize: 40,
    satellites,
    strokeWidth: 1.5,
  });

  expect(satellites.map(({ x, y }) => [x, y])).toEqual([[8, 18], [92, 18], [8, 82], [92, 82]]);
  expect(nodes).toHaveLength(8);
  expect(nodes.slice(0, 4).every((node) => node.shape === 'square' && node.width === 48)).toBe(true);
  expect(nodes.slice(4).every((node) => node.shape === 'rectangle' && node.width === 30)).toBe(true);
  expect(nodes[0]).toMatchObject({ icon: 'server.svg', position: [0.2, 0.5] });
});
