import { expect, it } from 'vitest';
import {
  createBusinessFlowHorizontalLayoutNodes,
  createBusinessFlowHorizontalNodes,
} from './nodes';

it('maps collector, relays, and terminals to the approved Node3D hierarchy', () => {
  const nodes = createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconStrokeOpacity: 0.52,
    iconSize: 40,
    iconStrokeColor: '#f3f5ef',
    strokeWidth: 1.5,
  });

  expect(nodes).toHaveLength(13);
  expect(nodes.find((node) => node.id === 'collector')).toMatchObject({
    height: 12,
    icon: 'intelligence.svg',
    position: [248 / 320, 304 / 608],
    shape: 'hexagon',
    width: 58,
  });
  const relays = nodes.filter((node) => node.id.startsWith('relay'));
  const terminals = nodes.filter((node) => /^(left|right)-/.test(node.id));
  expect(relays.every((node) => (
    node.shape === 'square' && node.width === 48 && node.cardDepth === node.width
  ))).toBe(true);
  expect(terminals.every((node) => node.shape === 'rectangle' && node.width === 30)).toBe(true);
});

it('preserves all business icon descriptors, including terminal stroke-width scaling', () => {
  const nodes = createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconStrokeOpacity: 0.52,
    iconSize: 40,
    iconStrokeColor: '#f3f5ef',
    strokeWidth: 1.5,
  });

  const cases = [
    ['intelligence.svg', 'collector', 'hexagon', 58, 48, 12, 0, '#1d281d', 1.5],
    ['server.svg', 'relay', 'square', 48, 48, 10, 1, '#1d281d', 1.5],
    ['graph.svg', 'relay', 'square', 48, 48, 10, 1, '#1d281d', 1.5],
    ['vector.svg', 'relay', 'square', 48, 48, 10, 1, '#1d281d', 1.5],
    ['download.svg', 'terminal', 'rectangle', 30, 34, 8, 2, '#212121', 0.375],
    ['profile.svg', 'terminal', 'rectangle', 30, 34, 8, 2, '#212121', 0.375],
    ['profile-alt.svg', 'terminal', 'rectangle', 30, 34, 8, 2, '#212121', 0.375],
  ] as const;

  cases.forEach(([icon, role, shape, width, cardDepth, height, tier, iconColor, iconStrokeWidth]) => {
    const matches = nodes.filter((node) => node.icon === icon);
    expect(matches.length, icon).toBeGreaterThan(0);
    matches.forEach((node) => {
      expect(node).toMatchObject({
        cardDepth,
        height,
        iconColor,
        iconOpacity: role === 'terminal' ? 0.72 : 1,
        iconStrokeColor: '#f3f5ef',
        iconStrokeWidth,
        shape,
        tier,
        width,
      });
      expect(role).toBe(node.id === 'collector' ? 'collector' : node.id.startsWith('relay') ? 'relay' : 'terminal');
    });
  });
});

it('retains central stroke opacity while central and terminal icons use the solid-fill default', () => {
  const nodes = createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconStrokeOpacity: 0.52,
    iconSize: 40,
    iconStrokeColor: '#f3f5ef',
    strokeWidth: 1.5,
  });
  const centralNodes = nodes.filter((node) => node.id === 'collector' || node.id.startsWith('relay'));
  const terminalNodes = nodes.filter((node) => /^(left|right)-/.test(node.id));

  expect(centralNodes).toHaveLength(4);
  expect(centralNodes.every((node) => node.iconStrokeOpacity === 0.52)).toBe(true);
  expect(centralNodes.every((node) => !('iconFillMode' in node))).toBe(true);
  expect(terminalNodes).toHaveLength(9);
  expect(terminalNodes.every((node) => !('iconStrokeOpacity' in node))).toBe(true);
  expect(terminalNodes.every((node) => !('iconFillMode' in node))).toBe(true);
});

it('restores the subdued terminal icon opacity used by the horizontal hierarchy', () => {
  const terminals = createBusinessFlowHorizontalNodes({
    auxiliaryIconColor: '#212121',
    centralIconColor: '#1d281d',
    centralIconStrokeOpacity: 0.52,
    iconSize: 40,
    iconStrokeColor: '#f3f5ef',
    strokeWidth: 1.5,
  }).filter((node) => /^(left|right)-/.test(node.id));

  expect(terminals).toHaveLength(9);
  expect(terminals.every((node) => node.iconOpacity === 0.72)).toBe(true);
});

it('normalizes fractional, negative, and oversized side counts before laying out nodes', () => {
  const nodes = createBusinessFlowHorizontalLayoutNodes(2.9, 99);
  const emptyLeftNodes = createBusinessFlowHorizontalLayoutNodes(-4, 1);

  expect(nodes.filter((node) => node.id.startsWith('left-'))).toHaveLength(2);
  expect(nodes.filter((node) => node.id.startsWith('right-'))).toHaveLength(12);
  expect(emptyLeftNodes.filter((node) => node.id.startsWith('left-'))).toHaveLength(0);
  expect(emptyLeftNodes.find((node) => node.id === 'right-1')).toMatchObject({ x: 304, y: 304 });
});
