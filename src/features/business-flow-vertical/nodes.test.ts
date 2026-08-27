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
    iconStrokeColor: '#f3f5ef',
    satellites,
    strokeWidth: 1.5,
  });

  expect(satellites.map(({ x, y }) => [x, y])).toEqual([[8, 18], [92, 18], [8, 82], [92, 82]]);
  expect(nodes).toHaveLength(8);
  expect(nodes.slice(0, 4).every((node) => node.shape === 'square' && node.width === 48)).toBe(true);
  expect(nodes.slice(4).every((node) => node.shape === 'rectangle' && node.width === 30)).toBe(true);
  expect(nodes[0]).toMatchObject({ icon: 'server.svg', position: [0.2, 0.5] });
});

it('preserves all business icon descriptors across central and satellite roles', () => {
  const nodes = createBusinessFlowVerticalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconFillMode: 'gradient',
    centralIconStrokeOpacity: 0.52,
    gradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
    iconSize: 40,
    iconStrokeColor: '#f3f5ef',
    satellites: createBusinessFlowVerticalSatellites(3, 0, 1),
    strokeWidth: 1.5,
  });

  const cases = [
    ['server.svg', 'central', 'square', 48, 40, 10, 1, '#1d281d', 1.5],
    ['graph.svg', 'central', 'square', 48, 40, 10, 1, '#1d281d', 1.5],
    ['vector.svg', 'central', 'square', 48, 40, 10, 1, '#1d281d', 1.5],
    ['intelligence.svg', 'central', 'square', 48, 40, 10, 1, '#1d281d', 1.5],
    ['download.svg', 'satellite', 'rectangle', 30, 34, 8, 2, '#212121', 0.375],
    ['profile.svg', 'satellite', 'rectangle', 30, 34, 8, 2, '#212121', 0.375],
    ['profile-alt.svg', 'satellite', 'rectangle', 30, 34, 8, 2, '#212121', 0.375],
  ] as const;

  cases.forEach(([icon, role, shape, width, cardDepth, height, tier, iconColor, iconStrokeWidth]) => {
    const node = nodes.find((candidate) => candidate.icon === icon);
    expect(node, icon).toMatchObject({
      cardDepth,
      height,
      iconColor,
      iconOpacity: role === 'central' ? 1 : 0.72,
      iconStrokeColor: '#f3f5ef',
      iconStrokeWidth,
      shape,
      tier,
      width,
    });
    if (role === 'central') {
      expect(node).toMatchObject({
        iconFillMode: 'gradient',
        iconGradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
        iconStrokeOpacity: 0.52,
      });
    } else {
      expect(node).toMatchObject({ iconFillMode: 'solid' });
    }
  });
});
