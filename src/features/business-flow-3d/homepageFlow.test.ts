import { describe, expect, it } from 'vitest';
import { homepageFlow } from './homepageFlow';
import type { FlowConfig } from './types';

const expectedBranches = {
  core: ['vault', 'library'],
  vault: ['graph', 'stack'],
  library: ['secure'],
  stack: ['graph'],
  secure: ['profile', 'labels'],
  graph: ['pipeline', 'profile'],
  profile: ['policy'],
  labels: ['schedule', 'policy'],
  pipeline: ['build', 'release'],
  policy: ['access', 'events'],
  schedule: ['events'],
  build: ['deploy'],
  release: ['identity'],
  access: ['identity', 'signals'],
  events: ['routes'],
  deploy: ['publish'],
  identity: ['govern'],
  signals: ['govern', 'routes'],
  routes: ['stream'],
  publish: ['govern'],
  govern: ['stream'],
} as const;

function hasCycle(root: string, branches: Record<string, string[]>) {
  const active = new Set<string>();
  const complete = new Set<string>();
  const visit = (id: string): boolean => {
    if (active.has(id)) return true;
    if (complete.has(id)) return false;
    active.add(id);
    const cyclic = (branches[id] ?? []).some(visit);
    active.delete(id);
    complete.add(id);
    return cyclic;
  };
  return visit(root);
}

describe('homepageFlow', () => {
  it('defines the approved Braided Delta node and edge contract', () => {
    const ids = homepageFlow.nodes.map(({ id }) => id);
    const edges = Object.values(homepageFlow.branches).flat();

    expect(homepageFlow.root).toBe('core');
    expect(homepageFlow.nodes).toHaveLength(22);
    expect(new Set(ids).size).toBe(22);
    expect(Object.keys(homepageFlow.branches).every((id) => ids.includes(id))).toBe(true);
    expect(edges).toHaveLength(30);
    expect(edges.every((id) => ids.includes(id))).toBe(true);
    expect(homepageFlow.branches).toEqual(expectedBranches);
    expect((homepageFlow as FlowConfig).variants).toBeUndefined();
    expect(hasCycle(homepageFlow.root, homepageFlow.branches)).toBe(false);
  });

  it('uses the exact tier cadence and shared logical columns', () => {
    const tierCounts = Array.from({ length: 8 }, (_, tier) => (
      homepageFlow.nodes.filter((node) => node.tier === tier).length
    ));
    const tierZ = Array.from({ length: 8 }, (_, tier) => (
      [...new Set(homepageFlow.nodes.filter((node) => node.tier === tier).map((node) => node.position[1]))]
    ));
    const columns = [...new Set(homepageFlow.nodes.map((node) => node.position[0]))].sort((a, b) => a - b);

    expect(tierCounts).toEqual([1, 2, 2, 3, 3, 4, 4, 3]);
    expect(tierZ).toEqual([[-5], [-0.7], [3.2], [7.4], [11], [15.2], [19], [23.4]]);
    expect(columns).toEqual([0, 3.3, 6.6, 9.9, 13.2]);
  });

  it('keeps the approved node-size hierarchy', () => {
    const byId = Object.fromEntries(homepageFlow.nodes.map((node) => [node.id, node]));

    expect(byId.core?.size).toEqual([4.3, 2.2]);
    ['vault', 'library'].forEach((id) => expect(byId[id]?.size).toEqual([3.2, 1.8]));
    ['stack', 'secure'].forEach((id) => expect(byId[id]?.size).toEqual([2.6, 1.5]));
    homepageFlow.nodes
      .filter((node) => node.tier >= 3)
      .forEach((node) => expect(node.size).toEqual([2.15, 1.25]));
  });

  it('places publish one logical column right of deploy on the terminal row', () => {
    const byId = Object.fromEntries(homepageFlow.nodes.map((node) => [node.id, node]));

    expect(byId.deploy?.position).toEqual([0, 19]);
    expect(byId.publish?.position).toEqual([3.3, 23.4]);
  });

  it('joins the bottom row into a single terminal route with the added middle branch', () => {
    const ids = homepageFlow.nodes.map(({ id }) => id);
    const branches: Record<string, string[]> = homepageFlow.branches;
    const inbound = Object.values(homepageFlow.branches).flat().reduce<Record<string, number>>(
      (counts, id) => ({ ...counts, [id]: (counts[id] ?? 0) + 1 }),
      {},
    );
    const leaves = ids.filter((id) => !(branches[id]?.length));
    const earlyLeaves = homepageFlow.nodes
      .filter((node) => node.tier < 7 && leaves.includes(node.id))
      .map(({ id }) => id);
    const finalOutputs = homepageFlow.nodes
      .filter((node) => node.tier === 7 && leaves.includes(node.id))
      .map(({ id }) => id);

    expect(earlyLeaves).toEqual([]);
    expect(finalOutputs).toEqual(['stream']);
    expect(inbound.profile).toBe(2);
    expect(inbound.identity).toBe(2);
    expect(inbound.govern).toBe(3);
    expect(Object.entries(inbound).filter(([, count]) => count > 1).map(([id]) => id)).toEqual([
      'graph',
      'profile',
      'policy',
      'events',
      'identity',
      'routes',
      'govern',
      'stream',
    ]);
  });
});
