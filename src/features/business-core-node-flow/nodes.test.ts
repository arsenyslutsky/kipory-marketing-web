import { expect, it } from 'vitest';
import {
  createBusinessCoreNodeFlowLayoutNodes,
  createBusinessCoreNodeFlowNodes,
} from './nodes';

it('distributes auxiliary nodes evenly around one centered core', () => {
  const layout = createBusinessCoreNodeFlowLayoutNodes(4, true);

  expect(layout).toEqual([
    { id: 'core', icon: 'intelligence', kind: 'core', x: 50, y: 50 },
    { id: 'auxiliary-1', icon: 'download', kind: 'auxiliary', x: 50, y: 18 },
    { id: 'auxiliary-2', icon: 'profile', kind: 'auxiliary', x: 82, y: 50 },
    { id: 'auxiliary-3', icon: 'profile-alt', kind: 'auxiliary', x: 50, y: 82 },
    { id: 'auxiliary-4', icon: 'download', kind: 'auxiliary', x: 18, y: 50 },
  ]);
});

it('keeps every connection while hiding only the auxiliary nodes', () => {
  expect(createBusinessCoreNodeFlowLayoutNodes(7, false)).toEqual([
    { id: 'core', icon: 'intelligence', kind: 'core', x: 50, y: 50 },
  ]);
});

it('applies independently selected core and auxiliary icons', () => {
  const layout = createBusinessCoreNodeFlowLayoutNodes(3, true, 'server', 'graph');

  expect(layout.find((node) => node.id === 'core')?.icon).toBe('server');
  expect(layout.filter((node) => node.kind === 'auxiliary').map((node) => node.icon)).toEqual([
    'graph',
    'graph',
    'graph',
  ]);
});

it('preserves the rotating auxiliary icon pattern through the mixed option', () => {
  const layout = createBusinessCoreNodeFlowLayoutNodes(4, true, 'intelligence', 'mixed');

  expect(layout.filter((node) => node.kind === 'auxiliary').map((node) => node.icon)).toEqual([
    'download',
    'profile',
    'profile-alt',
    'download',
  ]);
});

it('normalizes fractional, negative, and oversized auxiliary counts', () => {
  expect(createBusinessCoreNodeFlowLayoutNodes(3.9, true)).toHaveLength(4);
  expect(createBusinessCoreNodeFlowLayoutNodes(-2, true)).toHaveLength(1);
  expect(createBusinessCoreNodeFlowLayoutNodes(99, true)).toHaveLength(25);
});

it('maps the core and auxiliaries to the horizontal-flow Node3D hierarchy', () => {
  const nodes = createBusinessCoreNodeFlowNodes({
    auxiliaryIconColor: '#0b270e',
    centralIconColor: '#1b4e13',
    centralIconStrokeOpacity: 1,
    iconSize: 40,
    iconStrokeColor: '#9fb996',
    layoutNodes: createBusinessCoreNodeFlowLayoutNodes(4, true),
    strokeWidth: 2.25,
  });

  expect(nodes.find((node) => node.id === 'core')).toMatchObject({
    icon: 'intelligence.svg',
    position: [0.5, 0.5],
    shape: 'hexagon',
    tier: 0,
    width: 58,
  });
  expect(nodes.filter((node) => node.id.startsWith('auxiliary-'))).toHaveLength(4);
  expect(nodes.filter((node) => node.id.startsWith('auxiliary-')).every((node) => (
    node.shape === 'rectangle' && node.tier === 2 && node.iconOpacity === 0.72
  ))).toBe(true);
});
