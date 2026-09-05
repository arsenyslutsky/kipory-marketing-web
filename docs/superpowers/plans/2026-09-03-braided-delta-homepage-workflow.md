# Braided Delta Homepage Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero's dense rectangular workflow with the approved 24-node Braided Delta while keeping the diagram clear of the left-side copy and identical in topology across the website, Storybook, and mobile fallbacks.

**Architecture:** Add one immutable-by-convention `homepageFlow` configuration inside the `business-flow-3d` feature and keep `defaultFlow` untouched for general-purpose stories. The homepage and both Current App stories import the same flow object; existing renderer routing, node-edge anchors, continuation rules, theme materials, runtime lifecycle, and responsive fallback component remain unchanged. Spatial preset values that currently differ only because of homepage overrides are normalized so Storybook is a faithful scene fixture.

**Tech Stack:** Next.js 16.3.2 App Router, React 19.2.8 Client Components, TypeScript 5.9, Three.js 0.185.1, Storybook 10.5.10, Vitest 4.1.11, CSS Modules, PNG fallback assets.

**Spec:** `docs/superpowers/specs/2026-09-03-braided-delta-homepage-workflow-design.md`

## Global Constraints

- Keep the graph at exactly 24 unique nodes, 25 valid internal edges, and the tier cadence `1, 2, 3, 4, 3, 4, 4, 3`.
- Use logical columns `0, 3.3, 6.6, 9.9, 13.2` and tier Z coordinates `-5, -0.7, 3.2, 7.4, 11, 15.2, 19, 23.4` exactly.
- Use straight connector runs or rounded 90-degree turns only; do not add diagonal routing or corrective micro-jogs.
- Keep `records` as the only early leaf and `publish`, `govern`, and `stream` as the only terminal-tier outputs.
- Keep all active desktop geometry at least 100px to the right of the rendered hero lead at widths of 1200px and above, and at least 64px away at 901–1199px.
- Do not change homepage copy, calls to action, protocol icons, section order, reusable `defaultFlow`, public `BusinessFlow3DProps`, renderer resource behavior, or hero/canvas height.
- Preserve the existing `840px`, `1014px`, and `780px` fixed visual heights so vertical viewport resizing does not rescale the scene.
- Light and dark modes use the same flow object and spatial camera/emitter values; existing palette, material, shadow, connector, and progress differences remain theme-specific.
- Preserve the existing mobile fallback source names and intrinsic sizes; replace only the six hero PNG contents.
- Keep the Client Component boundary at `HomepageBusinessFlow3D`; the new flow module is serializable static data and must not add `use client`.
- Add no dependency and do not modify the Storybook preset-saving protocol; `flow` remains outside the saved primitive visual-preset keys.

---

### Task 1: Extract and validate the shared Braided Delta flow

**Files:**
- Create: `src/features/business-flow-3d/homepageFlow.ts`
- Create: `src/features/business-flow-3d/homepageFlow.test.ts`
- Modify: `src/features/business-flow-3d/index.ts`

**Interfaces:**
- Consumes: existing `FlowConfig` and `FlowNodeConfig` from `src/features/business-flow-3d/types.ts`.
- Produces: `export const homepageFlow: FlowConfig` with root `core`, 24 nodes, 25 internal edges, no variants, and no dependency on `defaultFlow`.
- Preserves: `defaultFlow` and all existing general-purpose consumers.

- [ ] **Step 1: Write the failing topology contract test**

Create `src/features/business-flow-3d/homepageFlow.test.ts` with explicit assertions for identity, counts, tiers, coordinates, branches, joins, leaves, and cycles:

```ts
import { describe, expect, it } from 'vitest';
import { homepageFlow } from './homepageFlow';

const expectedBranches = {
  core: ['vault', 'library'],
  vault: ['metrics', 'stack'],
  library: ['secure'],
  metrics: ['records'],
  stack: ['graph'],
  secure: ['profile', 'labels'],
  graph: ['pipeline'],
  profile: ['policy'],
  labels: ['schedule'],
  pipeline: ['build', 'release'],
  policy: ['access'],
  schedule: ['events'],
  build: ['deploy'],
  release: ['identity'],
  access: ['identity', 'signals'],
  events: ['routes'],
  deploy: ['publish'],
  identity: ['govern'],
  signals: ['govern'],
  routes: ['stream'],
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
    expect(homepageFlow.nodes).toHaveLength(24);
    expect(new Set(ids).size).toBe(24);
    expect(Object.keys(homepageFlow.branches).every((id) => ids.includes(id))).toBe(true);
    expect(edges).toHaveLength(25);
    expect(edges.every((id) => ids.includes(id))).toBe(true);
    expect(homepageFlow.branches).toEqual(expectedBranches);
    expect(homepageFlow.variants).toBeUndefined();
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

    expect(tierCounts).toEqual([1, 2, 3, 4, 3, 4, 4, 3]);
    expect(tierZ).toEqual([[-5], [-0.7], [3.2], [7.4], [11], [15.2], [19], [23.4]]);
    expect(columns).toEqual([0, 3.3, 6.6, 9.9, 13.2]);
  });

  it('keeps the approved node-size hierarchy', () => {
    const byId = Object.fromEntries(homepageFlow.nodes.map((node) => [node.id, node]));

    expect(byId.core?.size).toEqual([4.3, 2.2]);
    ['vault', 'library'].forEach((id) => expect(byId[id]?.size).toEqual([3.2, 1.8]));
    ['metrics', 'stack', 'secure'].forEach((id) => expect(byId[id]?.size).toEqual([2.6, 1.5]));
    homepageFlow.nodes
      .filter((node) => node.tier >= 3)
      .forEach((node) => expect(node.size).toEqual([2.15, 1.25]));
  });

  it('keeps one early leaf, two rejoins, and three final outputs', () => {
    const ids = homepageFlow.nodes.map(({ id }) => id);
    const inbound = Object.values(homepageFlow.branches).flat().reduce<Record<string, number>>(
      (counts, id) => ({ ...counts, [id]: (counts[id] ?? 0) + 1 }),
      {},
    );
    const leaves = ids.filter((id) => !(homepageFlow.branches[id]?.length));
    const earlyLeaves = homepageFlow.nodes
      .filter((node) => node.tier < 7 && leaves.includes(node.id))
      .map(({ id }) => id);
    const finalOutputs = homepageFlow.nodes
      .filter((node) => node.tier === 7 && leaves.includes(node.id))
      .map(({ id }) => id);

    expect(earlyLeaves).toEqual(['records']);
    expect(finalOutputs).toEqual(['publish', 'govern', 'stream']);
    expect(inbound.identity).toBe(2);
    expect(inbound.govern).toBe(2);
    expect(Object.entries(inbound).filter(([, count]) => count > 1).map(([id]) => id)).toEqual([
      'identity',
      'govern',
    ]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `npm test -- src/features/business-flow-3d/homepageFlow.test.ts`

Expected: FAIL because `./homepageFlow` does not exist.

- [ ] **Step 3: Add the complete static flow configuration**

Create `src/features/business-flow-3d/homepageFlow.ts`. Keep it independent of `defaultFlow` so removed default nodes and branches cannot leak back into the homepage:

```ts
import type { FlowConfig, FlowNodeConfig } from './types';

const nodes = [
  { id: 'core', position: [0, -5], label: 'CORE', svg: 'hexagon_default.svg', size: [4.3, 2.2], tier: 0, shape: 'hexagon' },
  { id: 'vault', position: [0, -0.7], label: 'VAULT', svg: 'triangle_default.svg', size: [3.2, 1.8], tier: 1, shape: 'triangle' },
  { id: 'library', position: [6.6, -0.7], label: 'LIBRARY', svg: 'square_default.svg', size: [3.2, 1.8], tier: 1, shape: 'square' },
  { id: 'metrics', position: [0, 3.2], label: 'METRICS', svg: 'hexagon_default.svg', size: [2.6, 1.5], tier: 2, shape: 'hexagon' },
  { id: 'stack', position: [3.3, 3.2], label: 'STACK', svg: 'triangle_default.svg', size: [2.6, 1.5], tier: 2, shape: 'triangle' },
  { id: 'secure', position: [9.9, 3.2], label: 'SECURE', svg: 'triangle_default.svg', size: [2.6, 1.5], tier: 2, shape: 'triangle' },
  { id: 'records', position: [0, 7.4], label: 'RECORDS', svg: 'square_default.svg', size: [2.15, 1.25], tier: 3, shape: 'square' },
  { id: 'graph', position: [3.3, 7.4], label: 'GRAPH', svg: 'triangle_default.svg', size: [2.15, 1.25], tier: 3, shape: 'triangle' },
  { id: 'profile', position: [6.6, 7.4], label: 'PROFILE', svg: 'square_default.svg', size: [2.15, 1.25], tier: 3, shape: 'square' },
  { id: 'labels', position: [13.2, 7.4], label: 'LABELS', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 3, shape: 'circle' },
  { id: 'pipeline', position: [3.3, 11], label: 'PIPELINE', svg: 'square_default.svg', size: [2.15, 1.25], tier: 4, shape: 'square' },
  { id: 'policy', position: [6.6, 11], label: 'POLICY', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 4, shape: 'rectangle' },
  { id: 'schedule', position: [13.2, 11], label: 'SCHEDULE', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 4, shape: 'hexagon' },
  { id: 'build', position: [0, 15.2], label: 'BUILD', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 5, shape: 'rectangle' },
  { id: 'release', position: [3.3, 15.2], label: 'RELEASE', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 5, shape: 'hexagon' },
  { id: 'access', position: [6.6, 15.2], label: 'ACCESS', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 5, shape: 'circle' },
  { id: 'events', position: [13.2, 15.2], label: 'EVENTS', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 5, shape: 'rectangle' },
  { id: 'deploy', position: [0, 19], label: 'DEPLOY', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 6, shape: 'circle' },
  { id: 'identity', position: [3.3, 19], label: 'IDENTITY', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 6, shape: 'hexagon' },
  { id: 'signals', position: [9.9, 19], label: 'SIGNALS', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 6, shape: 'rectangle' },
  { id: 'routes', position: [13.2, 19], label: 'ROUTES', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 6, shape: 'hexagon' },
  { id: 'publish', position: [0, 23.4], label: 'PUBLISH', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'rectangle' },
  { id: 'govern', position: [6.6, 23.4], label: 'GOVERN', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'circle' },
  { id: 'stream', position: [13.2, 23.4], label: 'STREAM', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'rectangle' },
] satisfies FlowNodeConfig[];

export const homepageFlow = {
  root: 'core',
  nodes,
  branches: {
    core: ['vault', 'library'],
    vault: ['metrics', 'stack'],
    library: ['secure'],
    metrics: ['records'],
    stack: ['graph'],
    secure: ['profile', 'labels'],
    graph: ['pipeline'],
    profile: ['policy'],
    labels: ['schedule'],
    pipeline: ['build', 'release'],
    policy: ['access'],
    schedule: ['events'],
    build: ['deploy'],
    release: ['identity'],
    access: ['identity', 'signals'],
    events: ['routes'],
    deploy: ['publish'],
    identity: ['govern'],
    signals: ['govern'],
    routes: ['stream'],
  },
} satisfies FlowConfig;
```

- [ ] **Step 4: Export the shared flow from the feature boundary**

Add this named export to `src/features/business-flow-3d/index.ts`:

```ts
export { homepageFlow } from './homepageFlow';
```

- [ ] **Step 5: Run the topology and renderer-routing tests**

Run: `npm test -- src/features/business-flow-3d/homepageFlow.test.ts src/features/business-flow-3d/scene/createSignalFlowScene.test.ts`

Expected: PASS with 24 nodes, 25 edges, exact coordinates, one early leaf, two rejoins, and all existing connector/beam routing regressions green.

- [ ] **Step 6: Commit the shared flow**

```bash
git add src/features/business-flow-3d/homepageFlow.ts src/features/business-flow-3d/homepageFlow.test.ts src/features/business-flow-3d/index.ts
git commit -m "feat: add braided delta homepage flow"
```

---

### Task 2: Make the homepage and Current App stories use one scene contract

**Files:**
- Create: `src/app/_components/HomepageBusinessFlow3D.test.tsx`
- Modify: `src/app/_components/HomepageBusinessFlow3D.tsx`
- Modify: `src/features/business-flow-3d/presets.ts`
- Modify: `src/features/business-flow-3d/stories/BusinessFlow3D.stories.tsx`
- Modify: `src/features/business-flow-3d/stories/BusinessFlow3D.stories.test.ts`
- Modify: `src/features/homepage-illustration-presets.contract.test.ts`

**Interfaces:**
- Consumes: `homepageFlow` from the feature barrel and the existing light/dark homepage visual presets.
- Produces: homepage, `Current App (Dark)`, and `Current App (Light)` render the same `homepageFlow` object.
- Produces: shared spatial values `cameraTargetOffsetY: -3`, `emitterX: 3`, and `emitterY: -3.5` in both visual presets.
- Preserves: theme-specific colors, node material differences, shadows, connector treatment, progress treatment, and the light story's existing 500px crop decorator.

- [ ] **Step 1: Write failing consumer-parity tests**

In `BusinessFlow3D.stories.test.ts`, import `homepageFlow` and change the two story expectations to:

```ts
expect(stories.CurrentNextjsApp.args).toEqual({
  ...businessFlow3DHomepageDarkProps,
  flow: homepageFlow,
  mode: 'dark',
});
expect(stories.CurrentAppLight.args).toEqual({
  ...businessFlow3DHomepageLightProps,
  flow: homepageFlow,
  mode: 'light',
});
expect(stories.CurrentNextjsApp.args?.flow).toBe(stories.CurrentAppLight.args?.flow);
```

Replace the old camera-offset assertion with:

```ts
it('keeps spatial placement identical across the current-app themes', () => {
  const spatialKeys = [
    'cameraPitch',
    'cameraYaw',
    'cameraZoom',
    'cameraTargetOffsetY',
    'emitterX',
    'emitterY',
    'perspectiveEffect',
    'nodeScale',
  ] as const;

  spatialKeys.forEach((key) => {
    expect(stories.CurrentAppLight.args?.[key]).toBe(stories.CurrentNextjsApp.args?.[key]);
  });
});
```

Add `src/app/_components/HomepageBusinessFlow3D.test.tsx`. Mock only the renderer component and resolved-theme hook, render both modes, and assert the exact flow identity and corresponding preset:

```tsx
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
  homepageFlow,
} from '@/features/business-flow-3d';
import { HomepageBusinessFlow3D } from './HomepageBusinessFlow3D';

const mocks = vi.hoisted(() => ({
  mode: 'light' as 'light' | 'dark',
  renderFlow: vi.fn(() => null),
}));

vi.mock('@/features/business-flow-3d', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/business-flow-3d')>()),
  BusinessFlow3D: mocks.renderFlow,
}));
vi.mock('@/theme/ThemeProvider', () => ({
  useResolvedTheme: () => mocks.mode,
}));

beforeEach(() => mocks.renderFlow.mockClear());

it.each([
  ['light', businessFlow3DHomepageLightProps],
  ['dark', businessFlow3DHomepageDarkProps],
] as const)('passes the shared homepage flow through the %s preset', (mode, preset) => {
  mocks.mode = mode;
  render(<HomepageBusinessFlow3D />);

  expect(mocks.renderFlow).toHaveBeenCalledTimes(1);
  expect(mocks.renderFlow.mock.calls[0]?.[0]).toEqual({
    ...preset,
    flow: homepageFlow,
    mode,
  });
});
```

In `homepage-illustration-presets.contract.test.ts`, update the expected 3D preset values and add the same eight-key spatial equality assertion. The exact common values are:

```ts
expect(businessFlow3DHomepageDarkProps).toMatchObject({
  cameraTargetOffsetY: -3,
  emitterX: 3,
  emitterY: -3.5,
});
expect(businessFlow3DHomepageLightProps).toMatchObject({
  cameraTargetOffsetY: -3,
  emitterX: 3,
  emitterY: -3.5,
});
```

In that file's exact `expected` object, add `cameraTargetOffsetY: -3` and change `emitterY` from `-8` to `-3.5`. In the light expected object, remove the now-redundant `cameraTargetOffsetY: -3` and `emitterX: 1` overrides so those values are inherited from the common expected object.

- [ ] **Step 2: Run the consumer tests and verify they fail**

Run: `npm test -- src/app/_components/HomepageBusinessFlow3D.test.tsx src/features/business-flow-3d/stories/BusinessFlow3D.stories.test.ts src/features/homepage-illustration-presets.contract.test.ts`

Expected: FAIL because the homepage still owns an inline extension, the stories still omit `homepageFlow`, and the two presets do not yet share all spatial values.

- [ ] **Step 3: Replace the inline homepage extension with the shared object**

Reduce `HomepageBusinessFlow3D.tsx` to the existing Client Component boundary plus the shared import:

```tsx
'use client';

import {
  BusinessFlow3D,
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
  homepageFlow,
} from '@/features/business-flow-3d';
import { useResolvedTheme } from '@/theme/ThemeProvider';

export function HomepageBusinessFlow3D() {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlow3DHomepageLightProps
    : businessFlow3DHomepageDarkProps;

  return <BusinessFlow3D {...preset} flow={homepageFlow} mode={mode} />;
}
```

Delete `homepageExtensionNodes`, the inline `homepageFlow`, and the now-unused `defaultFlow`, `FlowConfig`, and `FlowNodeConfig` imports.

- [ ] **Step 4: Normalize the spatial preset values**

In both existing object literals in `presets.ts`, set these properties directly:

```text
  cameraTargetOffsetY: -3,
  emitterX: 3,
  emitterY: -3.5,
```

Do not introduce a shared object or spread because Storybook's preset source writer requires each saved preset to remain an object literal containing property assignments. Keep every other existing property unchanged. This preserves the current landing-page light placement except for the approved rightward shift, preserves the existing homepage Y override, and makes dark/light Storybook geometry use the same camera and emitter contract.

- [ ] **Step 5: Pass `homepageFlow` to both Current App stories**

Import `homepageFlow` and add it after each preset spread:

```ts
export const CurrentNextjsApp: Story = {
  name: 'Current App (Dark)',
  args: {
    ...businessFlow3DHomepageDarkProps,
    flow: homepageFlow,
    mode: 'dark',
  },
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlow3DHomepageDarkProps) },
  },
};
```

```tsx
export const CurrentAppLight: Story = {
  name: 'Current App (Light)',
  decorators: [
    (Story) => (
      <div style={{ height: 500, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ...businessFlow3DHomepageLightProps,
    flow: homepageFlow,
    mode: 'light',
  },
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlow3DHomepageLightProps) },
  },
};
```

Do not add `flow` to `homepagePreset.keys`; the Save to Next.js control continues to persist only literal visual-preset properties.

- [ ] **Step 6: Run focused tests and production type checking**

Run: `npm test -- src/app/_components/HomepageBusinessFlow3D.test.tsx src/features/business-flow-3d/homepageFlow.test.ts src/features/business-flow-3d/stories/BusinessFlow3D.stories.test.ts src/features/homepage-illustration-presets.contract.test.ts src/features/business-flow-3d/scene/createSignalFlowScene.test.ts`

Run: `npm run typecheck`

Expected: PASS. The homepage and both stories share object identity for topology, both theme presets share spatial camera/emitter values, and existing connector/beam tests stay green.

- [ ] **Step 7: Commit scene integration**

```bash
git add src/app/_components/HomepageBusinessFlow3D.tsx src/app/_components/HomepageBusinessFlow3D.test.tsx src/features/business-flow-3d/presets.ts src/features/business-flow-3d/stories/BusinessFlow3D.stories.tsx src/features/business-flow-3d/stories/BusinessFlow3D.stories.test.ts src/features/homepage-illustration-presets.contract.test.ts
git commit -m "feat: use braided delta in homepage flow"
```

---

### Task 3: Verify composition and replace the mobile hero fallbacks

**Files:**
- Replace: `public/images/workflows/mobile/hero-flow.png`
- Replace: `public/images/workflows/mobile/hero-flow@2x.png`
- Replace: `public/images/workflows/mobile/hero-flow@3x.png`
- Replace: `public/images/workflows/mobile/hero-flow-light.png`
- Replace: `public/images/workflows/mobile/hero-flow-light@2x.png`
- Replace: `public/images/workflows/mobile/hero-flow-light@3x.png`

**Interfaces:**
- Consumes: the two Current App Storybook stories with `homepageFlow`, the existing `MobileWorkflowFallback` density naming contract, and the fixed 390×780 mobile hero target.
- Produces: six real dark/light Braided Delta raster fallbacks at 1x, 2x, and 3x.
- Preserves: `HomepageHero.tsx`, fallback source names, intrinsic dimensions, theme switching, and desktop/mobile breakpoint behavior.

- [ ] **Step 1: Start the app and Storybook from the worktree**

Run the existing scripts in separate terminals:

```bash
npm run dev -- --port 3001
npm run storybook -- --port 6006
```

Wait until the homepage and both Storybook stories report `data-flow-state="ready"` before inspecting or capturing.

- [ ] **Step 2: Verify the desktop composition in light and dark modes**

Use the in-app browser at `http://localhost:3001/`. Check 1440×900 and 1920×1080 in both explicit theme modes.

For each desktop viewport:

1. Record `document.querySelector('[class*="heroLead"]')!.getBoundingClientRect().right`.
2. Record the smallest left edge from the visible node-face SVGs under `[data-hero-workflow]`.
3. Require the node-face gap to be at least 120px, leaving 20px conservative allowance for the node body and shadow so the complete active-geometry gap is at least 100px.
4. Inspect the screenshot for connector turns, glows, packets, and shadows entering the copy region; none may do so.
5. Confirm the final three nodes end near the hero crop and no long node-free connector field remains below them.

At 1024×768 require at least 64px between the hero lead and node-face field, no high-contrast activity over title/lead/actions/protocols, and no node cropping that removes `core`, `identity`, `govern`, `records`, or any of the three outputs.

Compare the homepage with:

- `http://localhost:6006/?path=/story/animated-illustrations-businessflow3d--current-nextjs-app`
- `http://localhost:6006/?path=/story/animated-illustrations-businessflow3d--current-app-light`

Require the same 24 nodes, branch placement, two rejoins, early leaf, and three output positions. Storybook's outer host crop may differ, but the scene topology and camera/emitter geometry must not.

- [ ] **Step 3: Verify route behavior on the real scene**

Observe at least one full emission cycle in each theme and confirm:

- all paths use straight segments or rounded orthogonal corners;
- no connector crosses above or through a node;
- no short corrective horizontal jog appears on a visually vertical branch;
- a route selecting `records` ends inside that node;
- only `publish`, `govern`, and `stream` continue toward the terminal boundary;
- vertical viewport resizing does not change the diagram scale.

- [ ] **Step 4: Capture dark and light 3x mobile hero fallbacks from the matching Current App story**

For each theme, reset Storybook controls to the story defaults, use browser device emulation at 390×780 CSS pixels with device scale factor 3, disable reduced motion only long enough to choose a representative active route, then freeze on a frame with one visible active beam. For the light story only, temporarily change its rendered 500px preview wrapper to 780px in browser state for the capture; do not change the story source or committed host crop. Capture the preview iframe at 1170×2340 physical pixels. Keep the root, `records`, both rejoins, and all three outputs visible; do not include Storybook chrome.

Write the dark capture to `public/images/workflows/mobile/hero-flow@3x.png` and the light capture to `public/images/workflows/mobile/hero-flow-light@3x.png`.

- [ ] **Step 5: Derive the 1x and 2x assets without changing aspect ratio**

```bash
sips -z 1560 780 public/images/workflows/mobile/hero-flow@3x.png --out public/images/workflows/mobile/hero-flow@2x.png
sips -z 780 390 public/images/workflows/mobile/hero-flow@3x.png --out public/images/workflows/mobile/hero-flow.png
sips -z 1560 780 public/images/workflows/mobile/hero-flow-light@3x.png --out public/images/workflows/mobile/hero-flow-light@2x.png
sips -z 780 390 public/images/workflows/mobile/hero-flow-light@3x.png --out public/images/workflows/mobile/hero-flow-light.png
```

- [ ] **Step 6: Verify all six raster dimensions and mobile rendering**

Run:

```bash
sips -g pixelWidth -g pixelHeight \
  public/images/workflows/mobile/hero-flow.png \
  public/images/workflows/mobile/hero-flow@2x.png \
  public/images/workflows/mobile/hero-flow@3x.png \
  public/images/workflows/mobile/hero-flow-light.png \
  public/images/workflows/mobile/hero-flow-light@2x.png \
  public/images/workflows/mobile/hero-flow-light@3x.png
```

Expected dimensions, in order: 390×780, 780×1560, 1170×2340 for dark and the same three dimensions for light.

At 390×844 on the homepage, confirm the browser selects the matching theme family, the copy remains readable, the image does not shift layout, and the fallback contains the same Braided Delta topology without mounting WebGL.

Run: `npm test -- src/components/media/MobileWorkflowFallback.test.tsx src/app/page.test.tsx`

Expected: PASS with the existing source names, image-set families, intrinsic dimensions, and mobile no-WebGL contract unchanged.

- [ ] **Step 7: Commit the regenerated fallbacks**

```bash
git add public/images/workflows/mobile/hero-flow.png public/images/workflows/mobile/hero-flow@2x.png public/images/workflows/mobile/hero-flow@3x.png public/images/workflows/mobile/hero-flow-light.png public/images/workflows/mobile/hero-flow-light@2x.png public/images/workflows/mobile/hero-flow-light@3x.png
git commit -m "feat: refresh braided delta mobile fallbacks"
```

---

### Task 4: Run the complete regression and visual gate

**Files:**
- Verify only; fix failures in the owning file and add a focused regression test before rerunning the gate.

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a clean, production-buildable branch with verified website/Storybook parity and no push.

- [ ] **Step 1: Run focused workflow and homepage tests**

```bash
npm test -- \
  src/features/business-flow-3d/homepageFlow.test.ts \
  src/app/_components/HomepageBusinessFlow3D.test.tsx \
  src/features/business-flow-3d/stories/BusinessFlow3D.stories.test.ts \
  src/features/business-flow-3d/scene/createSignalFlowScene.test.ts \
  src/features/homepage-illustration-presets.contract.test.ts \
  src/components/media/MobileWorkflowFallback.test.tsx \
  src/app/page.test.tsx \
  src/app/hero-visual-sizing.contract.test.ts
```

Expected: PASS with zero failed tests.

- [ ] **Step 2: Run the full automated project gate**

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run build-storybook
```

Expected: every command exits 0. The Next.js and Storybook production builds complete without missing client boundaries, asset paths, or WebGL initialization errors.

- [ ] **Step 3: Run design and whitespace checks**

```bash
node /Users/arsenys/.codex/skills/impeccable/scripts/detect.mjs \
  src/app/_components/HomepageBusinessFlow3D.tsx \
  src/features/business-flow-3d/homepageFlow.ts \
  src/features/business-flow-3d/stories/BusinessFlow3D.stories.tsx
git diff --check
```

Expected: no blocking Impeccable findings in changed UI files and no whitespace errors.

- [ ] **Step 4: Repeat the bounded screenshot matrix**

Capture and compare:

- homepage light/dark at 1440×900 and 1920×1080;
- homepage light/dark at 1024×768;
- homepage light/dark mobile fallbacks at 390×844;
- Current App Dark and Current App Light stories at their existing host frames.

Apply every acceptance criterion from the spec: 100px/64px content clearance, 24 nodes, eight tiers, two rejoins, one early leaf, three output continuations, no diagonal or jagged routing, bottom-aligned crop, fixed vertical scale, and light/dark topology parity.

- [ ] **Step 5: Review the final diff and repository state**

```bash
git status --short
git diff --stat HEAD~3..HEAD
git log -3 --oneline
```

Expected: only the planned TypeScript/tests and six hero fallback rasters differ across the three implementation commits. Keep the branch local; do not push.
