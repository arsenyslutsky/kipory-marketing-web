# Shared Node3D Horizontal and Vertical Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every horizontal and vertical business-flow node through the shared Node3D object factory while preserving one orthographic rendering lifecycle, existing flow behavior, public props, and accessibility.

**Architecture:** Extend FlowLayer3D with serializable normalized node descriptors, a dedicated Node3D object composer, and one CSS3DRenderer sharing its scene and camera. Each feature supplies role-based descriptors from its existing layout data; FlowLayer3D resolves them against the measured viewport, owns all renderer resources, and shows a DOM fallback if scene creation fails.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript 5.9, Three.js 0.185.1, CSS3DRenderer, Vitest 4.1.11, Testing Library, Storybook 10.5.10.

**Spec:** `docs/superpowers/specs/2026-08-27-node3d-horizontal-vertical-flows-design.md`

## Global Constraints

- Read `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, and `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` before editing client components.
- Keep `BusinessFlowHorizontal`, `BusinessFlowVertical`, and `FlowLayer3D` as Client Components; all new descriptor props must be serializable plain data.
- Use exactly one WebGL canvas, one CSS3DRenderer, one orthographic camera, one ResizeObserver, and one animation loop per illustration.
- Construct visible nodes only through `createNode3DObject`; construct connectors and beams through their existing shared factories.
- Keep both illustrations orthographic and top-down. Do not add controls, camera tilt, idle float, hover behavior, or progress animation.
- Preserve existing route topology, beam scheduling, continuation fading, DOM arrival bursts, reduced-motion behavior, grid styling, dimensions, public props, and call sites.
- Preserve the seven existing business icons and the selected role hierarchy.
- Keep BusinessFlow3D behavior unchanged.
- Follow red-green-refactor for every production change and commit after each independently passing task.

---

## File Structure

New shared files have one responsibility each:

- `src/components/elements/Node3D/styleNode3DIconSvg.ts`: apply solid/gradient fill and stroke controls to an inlined SVG face.
- `src/components/elements/Node3D/node3DGradientTextureCache.ts`: own renderer-scoped gradient textures and their final disposal.
- `src/components/elements/FlowLayer3D/resolveFlowLayer3DNode.ts`: validate and map normalized node descriptors into world-space Node3D options.
- `src/components/elements/FlowLayer3D/createFlowLayer3DNodes.ts`: compose Node3D objects for one measured frame.
- `src/components/elements/FlowLayer3D/disposeFlowLayer3DObjectResources.ts`: dispose replaceable scene objects without prematurely disposing renderer-owned Node3D textures.
- `src/features/business-flow-horizontal/nodes.ts`: horizontal layout data and role-to-Node3D mapping.
- `src/features/business-flow-vertical/nodes.ts`: vertical central/satellite layout data and role-to-Node3D mapping.

Existing components remain responsible for public prop resolution and orchestration. Existing Pillar icon components remain exported for compatibility but stop rendering in the two migrated illustrations.

---

### Task 1: Business Icon Assets and Node3D Icon Presentation

**Files:**
- Create: `public/assets/nodes/server.svg`
- Create: `public/assets/nodes/graph.svg`
- Create: `public/assets/nodes/vector.svg`
- Create: `public/assets/nodes/intelligence.svg`
- Create: `public/assets/nodes/download.svg`
- Create: `public/assets/nodes/profile.svg`
- Create: `public/assets/nodes/profile-alt.svg`
- Create: `src/components/elements/Node3D/styleNode3DIconSvg.ts`
- Test: `src/components/elements/Node3D/styleNode3DIconSvg.test.ts`
- Modify: `src/components/elements/Node3D/types.ts`
- Modify: `src/components/elements/Node3D/createNode3DObject.ts`
- Modify: `src/components/elements/Node3D/createNode3DScene.ts`
- Modify: `src/components/elements/Node3D/Node3D.tsx`
- Modify: `src/components/elements/Node3D/Node3D.stories.tsx`
- Modify: `src/components/elements/Node3D/index.ts`

**Interfaces:**
- Consumes: the exact path data and view boxes currently defined in `PillarIcon.tsx` and `PillarSurroundingIcon.tsx`.
- Produces:

```ts
export type Node3DIconFillMode = 'solid' | 'gradient';

export type Node3DResolvedGradient = {
  angle: number;
  end: string;
  mid: string;
  start: string;
};

export type Node3DIconStyle = {
  color: string;
  fillMode: Node3DIconFillMode;
  gradient?: Node3DResolvedGradient;
  strokeOpacity: number;
  strokeWidth?: number;
};

export function styleNode3DIconSvg(
  svg: SVGSVGElement,
  style: Node3DIconStyle,
  gradientId: string,
): void;
```

- Adds optional `iconColor`, `iconStrokeOpacity`, and `iconStrokeWidth` to `Node3DProps` without changing existing defaults.
- Adds optional `iconColor`, `iconFillMode`, `iconGradient`, `iconStrokeOpacity`, and `iconStrokeWidth` to `CreateNode3DObjectOptions`.
- Moves `Node3DResolvedGradient` and `Node3DIconFillMode` to `types.ts`, re-exports both from `Node3D/index.ts`, and re-exports `Node3DResolvedGradient` from `createNode3DObject.ts` so the existing direct BusinessFlow3D type import remains source-compatible.

- [ ] **Step 1: Write the failing SVG styling tests**

Create `styleNode3DIconSvg.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { styleNode3DIconSvg } from './styleNode3DIconSvg';

function parse(markup: string) {
  return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement as unknown as SVGSVGElement;
}

describe('styleNode3DIconSvg', () => {
  it('applies solid fill and stroke controls without filling stroke-only paths', () => {
    const svg = parse('<svg xmlns="http://www.w3.org/2000/svg"><path id="filled" fill="#000" stroke="#000"/><path id="line" fill="none" stroke="#000"/></svg>');
    styleNode3DIconSvg(svg, {
      color: '#123456',
      fillMode: 'solid',
      strokeOpacity: 0.4,
      strokeWidth: 2.5,
    }, 'icon-gradient');

    expect(svg.querySelector('#filled')).toHaveAttribute('fill', '#123456');
    expect(svg.querySelector('#line')).toHaveAttribute('fill', 'none');
    expect(svg.querySelectorAll('[stroke]')[0]).toHaveAttribute('stroke', '#123456');
    expect(svg.querySelectorAll('[stroke]')[0]).toHaveAttribute('stroke-opacity', '0.4');
    expect(svg.querySelectorAll('[stroke]')[0]).toHaveAttribute('stroke-width', '2.5');
  });

  it('injects one gradient and uses it only for non-none fills', () => {
    const svg = parse('<svg xmlns="http://www.w3.org/2000/svg"><path id="filled" fill="#000"/><path id="line" fill="none"/></svg>');
    styleNode3DIconSvg(svg, {
      color: '#fff',
      fillMode: 'gradient',
      gradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
      strokeOpacity: 1,
    }, 'node-a-gradient');

    expect(svg.querySelectorAll('linearGradient')).toHaveLength(1);
    expect(svg.querySelector('#filled')).toHaveAttribute('fill', 'url(#node-a-gradient)');
    expect(svg.querySelector('#line')).toHaveAttribute('fill', 'none');
    expect([...svg.querySelectorAll('stop')].map((stop) => stop.getAttribute('stop-color')))
      .toEqual(['#066b43', '#03492b', '#052f24']);
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm test -- src/components/elements/Node3D/styleNode3DIconSvg.test.ts
```

Expected: FAIL because `styleNode3DIconSvg.ts` does not exist.

- [ ] **Step 3: Implement the pure SVG styling helper**

Implement the helper as follows. This inserts a `<defs><linearGradient>` with stops at `0`, `0.48`, and `1`, applies fill/stroke controls only where the source attribute is not `none`, clamps stroke opacity to `[0, 1]`, and ignores a non-finite or negative stroke width.

```ts
const SVG_NS = 'http://www.w3.org/2000/svg';

function gradientEndpoints(angle: number) {
  const radians = angle * Math.PI / 180;
  const x = Math.cos(radians) * 50;
  const y = Math.sin(radians) * 50;
  return { x1: `${50 - x}%`, y1: `${50 - y}%`, x2: `${50 + x}%`, y2: `${50 + y}%` };
}

export function styleNode3DIconSvg(svg: SVGSVGElement, style: Node3DIconStyle, gradientId: string) {
  let fill = style.color;
  if (style.fillMode === 'gradient' && style.gradient) {
    const defs = svg.querySelector('defs') ?? document.createElementNS(SVG_NS, 'defs');
    if (!defs.parentNode) svg.prepend(defs);
    const gradient = document.createElementNS(SVG_NS, 'linearGradient');
    gradient.id = gradientId;
    Object.entries(gradientEndpoints(style.gradient.angle)).forEach(([name, value]) => {
      gradient.setAttribute(name, value);
    });
    [
      ['0', style.gradient.start],
      ['0.48', style.gradient.mid],
      ['1', style.gradient.end],
    ].forEach(([offset, color]) => {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      gradient.append(stop);
    });
    defs.append(gradient);
    fill = `url(#${gradientId})`;
  }

  const strokeOpacity = Math.min(1, Math.max(0, style.strokeOpacity));
  svg.querySelectorAll<SVGElement>('[fill]').forEach((element) => {
    if (element.getAttribute('fill') !== 'none') element.setAttribute('fill', fill);
  });
  svg.querySelectorAll<SVGElement>('[stroke]').forEach((element) => {
    if (element.getAttribute('stroke') === 'none') return;
    element.setAttribute('stroke', style.color);
    element.setAttribute('stroke-opacity', String(strokeOpacity));
    if (style.strokeWidth !== undefined && Number.isFinite(style.strokeWidth) && style.strokeWidth >= 0) {
      element.setAttribute('stroke-width', String(style.strokeWidth));
    }
  });
}
```

- [ ] **Step 4: Add the seven SVG assets**

Create each file as a standalone `<svg xmlns="http://www.w3.org/2000/svg">` using the exact existing view box and path data:

| Asset | Source |
| --- | --- |
| `server.svg` | `iconPaths.server` in `PillarIcon.tsx`, viewBox `0 0 80 80` |
| `graph.svg` | `iconPaths.graph`, viewBox `0 0 80 80` |
| `vector.svg` | `iconPaths.vector`, viewBox `0 0 80 80` |
| `intelligence.svg` | `iconPaths.intelligence`, viewBox `0 0 80 80` |
| `download.svg` | the download branch in `PillarSurroundingIcon.tsx`, viewBox `0 0 12 14` |
| `profile.svg` | `profilePaths`, viewBox `0 0 12 14` |
| `profile-alt.svg` | `profilePaths`, viewBox `0 0 12 14`, preserving the current identical artwork |

Keep every source `fill="none"`, stroke-linecap, and stroke-linejoin distinction so `styleNode3DIconSvg` can preserve stroke-only artwork.

- [ ] **Step 5: Wire icon controls into Node3D**

Add these optional props:

```ts
iconColor?: string;
iconStrokeOpacity?: number;
iconStrokeWidth?: number;
```

In `createNode3DObject`, resolve defaults from `theme.scene.icon`, `1`, and `undefined`. Use the resolved icon color for the initial CSS-mask `backgroundColor` and the inlined SVG `color`. Replace the current inline fill/stroke rewrite in `nodeFaceObject` with:

```ts
styleNode3DIconSvg(svg, {
  color: iconColor ?? palette.icon,
  fillMode: iconFillMode ?? 'solid',
  gradient: iconGradient,
  strokeOpacity: iconStrokeOpacity ?? 1,
  strokeWidth: iconStrokeWidth,
}, `${id}-icon-gradient`);
```

Forward the three public props through `Node3D.tsx` and `createNode3DScene.ts`. Leave BusinessFlow3D calls unchanged by keeping all new factory fields optional. Add Storybook controls under the Icon category.

- [ ] **Step 6: Run focused tests and type checking**

Run:

```bash
npm test -- src/components/elements/Node3D/styleNode3DIconSvg.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add public/assets/nodes src/components/elements/Node3D
git commit -m "feat: support business icons in Node3D"
```

---

### Task 2: Renderer-Owned Node3D Gradient Textures

**Files:**
- Create: `src/components/elements/Node3D/node3DGradientTextureCache.ts`
- Test: `src/components/elements/Node3D/node3DGradientTextureCache.test.ts`
- Modify: `src/components/elements/Node3D/createNode3DObject.ts`
- Modify: `src/components/elements/Node3D/createNode3DScene.ts`
- Modify: `src/components/elements/Node3D/index.ts`

**Interfaces:**
- Produces:

```ts
export function getNode3DGradientTexture(
  renderer: THREE.WebGLRenderer,
  key: string,
  create: () => THREE.CanvasTexture,
): THREE.CanvasTexture;

export function isNode3DManagedGradientTexture(texture: THREE.Texture): boolean;
export function disposeNode3DGradientTextures(renderer: THREE.WebGLRenderer): void;
```

- [ ] **Step 1: Write failing cache ownership tests**

```ts
import * as THREE from 'three';
import { expect, it, vi } from 'vitest';
import {
  disposeNode3DGradientTextures,
  getNode3DGradientTexture,
  isNode3DManagedGradientTexture,
} from './node3DGradientTextureCache';

it('reuses textures per renderer and disposes them only at renderer teardown', () => {
  const rendererA = {} as THREE.WebGLRenderer;
  const rendererB = {} as THREE.WebGLRenderer;
  const textureA = new THREE.CanvasTexture(document.createElement('canvas'));
  const textureB = new THREE.CanvasTexture(document.createElement('canvas'));
  vi.spyOn(textureA, 'dispose');
  vi.spyOn(textureB, 'dispose');

  expect(getNode3DGradientTexture(rendererA, 'green', () => textureA)).toBe(textureA);
  expect(getNode3DGradientTexture(rendererA, 'green', () => textureB)).toBe(textureA);
  expect(getNode3DGradientTexture(rendererB, 'green', () => textureB)).toBe(textureB);
  expect(isNode3DManagedGradientTexture(textureA)).toBe(true);

  disposeNode3DGradientTextures(rendererA);
  expect(textureA.dispose).toHaveBeenCalledOnce();
  expect(textureB.dispose).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/components/elements/Node3D/node3DGradientTextureCache.test.ts
```

Expected: FAIL because the cache module does not exist.

- [ ] **Step 3: Implement the renderer-scoped cache**

Use one `WeakMap<THREE.WebGLRenderer, Map<string, THREE.CanvasTexture>>` and one `WeakSet<THREE.Texture>`. `disposeNode3DGradientTextures` must dispose every texture in the renderer map, clear it, and delete the renderer key; repeated disposal is a no-op.

- [ ] **Step 4: Move gradient cache ownership out of `createNode3DObject`**

Replace the file-local cache with `getNode3DGradientTexture`. In `createNode3DScene` resource traversal, skip textures for which `isNode3DManagedGradientTexture` returns true, then call `disposeNode3DGradientTextures(renderer)` exactly once before `renderer.dispose()`.

- [ ] **Step 5: Verify GREEN and the standalone Node3D lifecycle**

Run:

```bash
npm test -- src/components/elements/Node3D
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/elements/Node3D
git commit -m "fix: own Node3D textures by renderer"
```

---

### Task 3: Serializable FlowLayer3D Node Model and Resolution

**Files:**
- Modify: `src/components/elements/FlowLayer3D/types.ts`
- Create: `src/components/elements/FlowLayer3D/resolveFlowLayer3DNode.ts`
- Test: `src/components/elements/FlowLayer3D/resolveFlowLayer3DNode.test.ts`
- Modify: `src/components/elements/FlowLayer3D/index.ts`

**Interfaces:**
- Consumes: `Node3DMode`, `Node3DProgressMode`, `Node3DResolvedGradient`, and `Node3DShape`.
- Produces:

```ts
export type FlowLayer3DNode = {
  cardDepth: number; // CSS pixels
  glowIntensity?: number;
  height: number; // CSS pixels
  icon: string;
  iconColor: string;
  iconFillMode?: Node3DIconFillMode;
  iconGradient?: Node3DResolvedGradient;
  iconOpacity: number;
  iconStrokeOpacity?: number;
  iconStrokeWidth?: number;
  id: string;
  position: FlowLayer3DPoint;
  progress?: number;
  scale?: number;
  shape: Node3DShape;
  tier: number;
  width: number; // CSS pixels
};

export type FlowLayer3DNodeStyle = {
  assetBasePath: string;
  frontGradient: Node3DResolvedGradient;
  mode: Node3DMode;
  nodeCornerRadius: number;
  outlineOpacity: number;
  outlineWidth: number;
  progressBarHeight: number;
  progressMode: Node3DProgressMode;
  progressPadding: number;
  sideXGradient: Node3DResolvedGradient;
  sideZGradient: Node3DResolvedGradient;
};

export type FlowLayer3DNodeFrame = {
  aspectRatio: number;
  viewportHeight: number;
  worldHeight?: number;
};

export type ResolvedFlowLayer3DNode = Omit<FlowLayer3DNode, 'position' | 'width' | 'cardDepth' | 'height'> & {
  cardDepth: number;
  height: number;
  position: readonly [x: number, z: number];
  width: number;
};

export function resolveFlowLayer3DNode(
  node: FlowLayer3DNode,
  frame: FlowLayer3DNodeFrame,
): ResolvedFlowLayer3DNode | null;
```

- [ ] **Step 1: Write failing resolution tests**

```ts
import { expect, it } from 'vitest';
import { resolveFlowLayer3DNode } from './resolveFlowLayer3DNode';

const node = {
  cardDepth: 40,
  height: 12,
  icon: 'server.svg',
  iconColor: '#fff',
  iconOpacity: 0.8,
  id: 'server',
  position: [0.2, 0.5],
  shape: 'square',
  tier: 1,
  width: 48,
} as const;

it('maps normalized position and CSS-pixel dimensions into world units', () => {
  expect(resolveFlowLayer3DNode(node, {
    aspectRatio: 0.5,
    viewportHeight: 640,
    worldHeight: 20,
  })).toMatchObject({
    cardDepth: 1.25,
    height: 0.375,
    position: [-3, 0],
    width: 1.5,
  });
});

it('rejects non-finite positions and non-positive dimensions', () => {
  expect(resolveFlowLayer3DNode({ ...node, width: 0 }, {
    aspectRatio: 1, viewportHeight: 640,
  })).toBeNull();
  expect(resolveFlowLayer3DNode({ ...node, position: [Number.NaN, 0.5] }, {
    aspectRatio: 1, viewportHeight: 640,
  })).toBeNull();
});
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D/resolveFlowLayer3DNode.test.ts
```

Expected: FAIL because the resolver and node types do not exist.

- [ ] **Step 3: Implement the model and resolver**

Convert CSS pixels with:

```ts
const pixelsToWorld = worldHeight / Math.max(viewportHeight, 1);
const [x, , z] = normalizedPointToWorld(node.position, { aspectRatio, worldHeight });
return {
  ...node,
  cardDepth: node.cardDepth * pixelsToWorld,
  height: node.height * pixelsToWorld,
  position: [x, z],
  width: node.width * pixelsToWorld,
};
```

Reject non-finite positions, dimensions, scale, tier, or a `viewportHeight <= 0`. Clamp only presentation values in `createNode3DObject`; do not silently move node positions.

- [ ] **Step 4: Export the new public types and resolver**

Update `FlowLayer3D/index.ts` to export `resolveFlowLayer3DNode` plus `FlowLayer3DNode`, `FlowLayer3DNodeFrame`, `FlowLayer3DNodeStyle`, and `ResolvedFlowLayer3DNode`.

- [ ] **Step 5: Verify GREEN**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D/resolveFlowLayer3DNode.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/elements/FlowLayer3D
git commit -m "feat: add normalized FlowLayer3D nodes"
```

---

### Task 4: Shared Node3D Object Composition and Safe Disposal

**Files:**
- Create: `src/components/elements/FlowLayer3D/disposeFlowLayer3DObjectResources.ts`
- Test: `src/components/elements/FlowLayer3D/disposeFlowLayer3DObjectResources.test.ts`
- Create: `src/components/elements/FlowLayer3D/createFlowLayer3DNodes.ts`
- Test: `src/components/elements/FlowLayer3D/createFlowLayer3DNodes.test.ts`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DObjects.ts`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts`
- Modify: `src/components/elements/FlowLayer3D/index.ts`

**Interfaces:**
- Consumes: `resolveFlowLayer3DNode`, `createNode3DObject`, `defaultColors`, and `isNode3DManagedGradientTexture`.
- Produces:

```ts
export function disposeFlowLayer3DObjectResources(root: THREE.Object3D): void;

export type FlowLayer3DNodes = {
  destroy: () => void;
  group: THREE.Group;
  nodes: THREE.Group[];
};

export function createFlowLayer3DNodes(options: {
  aspectRatio: number;
  nodeStyle: FlowLayer3DNodeStyle;
  nodes: readonly FlowLayer3DNode[];
  renderer: THREE.WebGLRenderer;
  viewportHeight: number;
  worldHeight?: number;
}): FlowLayer3DNodes;
```

- [ ] **Step 1: Write the failing disposal test**

Build a group containing a mesh with one ordinary `THREE.Texture`, one texture returned from `getNode3DGradientTexture`, and one `CSS3DObject` with an attached element. Assert `disposeFlowLayer3DObjectResources` disposes geometry, material, and the ordinary texture, leaves the renderer-managed gradient texture for final renderer teardown, and removes the CSS3D element.

- [ ] **Step 2: Write the failing node-composition test**

Mock `createNode3DObject` and assert that one valid descriptor creates one child with:

```ts
expect(createNode3DObject).toHaveBeenCalledWith(expect.objectContaining({
  assetBasePath: '/assets/nodes',
  cardDepth: 1.25,
  fogEnabled: false,
  height: 0.375,
  icon: 'server.svg',
  iconColor: '#f3f5ef',
  id: 'server',
  isDark: true,
  isVariant2: true,
  position: [-3, 0],
  progressMode: 'outline',
  renderer,
  shape: 'square',
  width: 1.5,
}));
```

Include one invalid descriptor and assert it is skipped. Call `destroy()` and assert the group is empty.

- [ ] **Step 3: Verify RED**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D/disposeFlowLayer3DObjectResources.test.ts src/components/elements/FlowLayer3D/createFlowLayer3DNodes.test.ts
```

Expected: FAIL because both modules do not exist.

- [ ] **Step 4: Implement safe shared disposal**

Move the existing geometry/material/texture traversal from `createFlowLayer3DObjects.ts` and `createFlowLayer3DScene.ts` into the new helper. Before disposing a texture, check `isNode3DManagedGradientTexture(texture)` and skip it when true. When traversal reaches a `CSS3DObject`, call `object.element.remove()` so aspect-ratio rebuilds do not retain detached node faces until the next frame.

- [ ] **Step 5: Implement `createFlowLayer3DNodes`**

Resolve the theme with `defaultColors[nodeStyle.mode]`, resolve every node with the measured frame, and call `createNode3DObject` with:

```ts
{
  ...nodeOptions,
  assetBasePath: nodeStyle.assetBasePath,
  fogEnabled: false,
  frontGradient: nodeStyle.frontGradient,
  initialGlowIntensity: glowIntensity ?? 0,
  initialProgress: progress,
  isDark: nodeStyle.mode === 'dark',
  isVariant2: true,
  nodeCornerRadius: nodeStyle.nodeCornerRadius,
  outlineOpacity: nodeStyle.outlineOpacity,
  outlineWidth: nodeStyle.outlineWidth,
  progressBarHeight: nodeStyle.progressBarHeight,
  progressMode: nodeStyle.progressMode,
  progressPadding: nodeStyle.progressPadding,
  renderer,
  scale,
  sideXGradient: nodeStyle.sideXGradient,
  sideZGradient: nodeStyle.sideZGradient,
  theme,
}
```

Before this call, destructure the presentation-only aliases so the object literal contains no excess properties:

```ts
const { glowIntensity, progress, scale = 1, ...nodeOptions } = resolvedNode;
```

When a descriptor resolves to `null`, skip it and emit `console.warn('Skipping invalid FlowLayer3D node:', node.id)` only when `process.env.NODE_ENV !== 'production'`.

Catch construction errors, dispose and clear already-created nodes, then rethrow. `destroy()` is idempotent.

- [ ] **Step 6: Replace duplicated disposal and export the composer**

Use `disposeFlowLayer3DObjectResources` in connector and beam cleanup. Export `createFlowLayer3DNodes` and `FlowLayer3DNodes` from the barrel.

- [ ] **Step 7: Verify GREEN and existing flow objects**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D/createFlowLayer3DNodes.test.ts src/components/elements/FlowLayer3D/createFlowLayer3DObjects.test.ts src/components/elements/FlowLayer3D/disposeFlowLayer3DObjectResources.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/elements/FlowLayer3D
git commit -m "feat: compose Node3D objects in flow layers"
```

---

### Task 5: One CSS3D Scene Lifecycle and DOM Fallback

**Files:**
- Modify: `src/components/elements/FlowLayer3D/types.ts`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.tsx`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.module.css`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts`

**Interfaces:**
- Extends `FlowLayer3DProps` with serializable optional fields:

```ts
nodes?: readonly FlowLayer3DNode[];
nodeStyle?: FlowLayer3DNodeStyle;
```

- Extends `FlowLayer3DSceneOptions` with:

```ts
cssLayer: HTMLElement;
```

- [ ] **Step 1: Write the failing component lifecycle and fallback tests**

Extend the existing `createFlowLayer3DScene` mock to capture options. Render FlowLayer3D with one node and assert:

```ts
expect(container.querySelectorAll('canvas')).toHaveLength(1);
expect(container.querySelectorAll('[data-flow-layer-css3d]')).toHaveLength(1);
expect(createFlowLayer3DScene).toHaveBeenCalledWith(expect.objectContaining({
  cssLayer: expect.any(HTMLElement),
  nodes: [expect.objectContaining({ id: 'server' })],
}));
```

Then make `createFlowLayer3DScene` throw `new Error('WebGL unavailable')` and assert a `data-testid="flow-layer-node-fallback"` element appears at `left: 20%`, `top: 50%`, with width/height derived from the node's CSS-pixel dimensions. Rerender with valid props and assert the error fallback clears.

- [ ] **Step 2: Write the failing scene CSS3D and rebuild tests**

Mock `CSS3DRenderer` with spies for `render`, `setSize`, and `domElement.remove`. Mock `createFlowLayer3DNodes` to return two successive disposable groups. Assert:

- CSS3DRenderer is created exactly once;
- its DOM element is appended to `cssLayer`;
- `setSize(320, 640)` runs with the WebGL resize;
- WebGL and CSS3D render with the exact same scene and camera;
- a height-only resize rebuilds nodes to preserve CSS-pixel size;
- an aspect-ratio resize rebuilds nodes and connectors and updates active beam paths without replacing beam slots; and
- destroy removes the CSS renderer element, destroys the current node group, disposes Node3D renderer textures, and disposes WebGL exactly once.

- [ ] **Step 3: Verify RED**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts
```

Expected: FAIL because FlowLayer3D does not expose nodes, a CSS3D layer, or fallback rendering.

- [ ] **Step 4: Add the CSS3D layer and fallback markup**

In `FlowLayer3D.tsx`, add `cssLayerRef`, pass it to scene creation, and preserve the current error-catching effect. Render:

```tsx
<div ref={containerRef} aria-hidden="true" className={rootClassName}>
  <canvas ref={canvasRef} className={styles.canvas} />
  <div ref={cssLayerRef} className={styles.cssLayer} data-flow-layer-css3d />
  {error && (
    <div className={styles.fallbackLayer} data-testid="flow-layer-node-fallback">
      {nodes.map((node) => (
        <span
          className={styles.fallbackNode}
          key={node.id}
          style={{
            '--flow-node-aspect': String(node.width / node.cardDepth),
            '--flow-node-color': node.iconColor,
            '--flow-node-height': `${node.cardDepth}px`,
            '--flow-node-icon': `url("${(nodeStyle?.assetBasePath ?? '/assets/nodes').replace(/\/$/, '')}/${node.icon}")`,
            '--flow-node-width': `${node.width}px`,
            '--flow-node-x': `${node.position[0] * 100}%`,
            '--flow-node-y': `${node.position[1] * 100}%`,
          } as CSSProperties}
        />
      ))}
    </div>
  )}
</div>
```

Set `.fallbackNode` width and height from `--flow-node-width` and `--flow-node-height`, use CSS mask properties for the icon, and use absolute normalized positioning. Keep fallback pointer-inert and decorative.

- [ ] **Step 5: Integrate CSS3DRenderer and Node3D groups into the scene**

Create and mount one CSS3DRenderer. Track `nodeObjects`, measured width/height, and aspect ratio separately. Rebuild nodes when viewport width or height changes; rebuild connectors and active beam paths only when aspect ratio changes. Call `cssRenderer.render(scene, camera)` immediately after WebGL render.

On final destroy, dispose current node/connector/beam objects, call `disposeNode3DGradientTextures(renderer)`, remove the CSS renderer DOM element, and then dispose WebGL. Preserve the existing constructor failure cleanup guarantee.

- [ ] **Step 6: Update CSS stacking**

Use one shared absolute root. Set canvas and CSS3D layers to the same scene z-index, put fallback above them, keep all layers pointer-inert, and ensure the feature-level burst layers can remain above FlowLayer3D.

- [ ] **Step 7: Verify GREEN and all FlowLayer3D regressions**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D
npm run typecheck
npm run lint
```

Expected: PASS with no React act warnings, WebGL warnings, or leaked DOM nodes.

- [ ] **Step 8: Commit**

```bash
git add src/components/elements/FlowLayer3D
git commit -m "feat: render Node3D in shared flow scenes"
```

---

### Task 6: Horizontal Role Hierarchy Migration

**Files:**
- Create: `src/features/business-flow-horizontal/nodes.ts`
- Test: `src/features/business-flow-horizontal/nodes.test.ts`
- Modify: `src/features/business-flow-horizontal/routes.ts`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.module.css`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`

**Interfaces:**
- Produces:

```ts
export type BusinessFlowHorizontalLayoutNode = {
  delay: number;
  icon: 'download' | 'profile' | 'profile-alt' | 'server' | 'graph' | 'vector' | 'intelligence';
  id: string;
  kind: 'collector' | 'relay' | 'terminal';
  x: number;
  y: number;
};

export const businessFlowHorizontalLayoutNodes: readonly BusinessFlowHorizontalLayoutNode[];

export function createBusinessFlowHorizontalNodes(options: {
  auxiliaryIconColor: string;
  centralIconColor: string;
  centralIconStrokeOpacity: number;
  iconSize: number;
  strokeWidth: number;
}): readonly FlowLayer3DNode[];
```

- [ ] **Step 1: Write failing role-mapping tests**

```ts
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
```

- [ ] **Step 2: Extend the failing component test**

Capture `nodes` and `nodeStyle` in the FlowLayer3D mock. Assert one shared layer receives 10 nodes, the collector is a hexagon, no `PillarIcon`/`PillarSurroundingIcon` SVGs render, and the existing figure label remains.

- [ ] **Step 3: Verify RED**

Run:

```bash
npm test -- src/features/business-flow-horizontal/nodes.test.ts src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx
```

Expected: FAIL because `nodes.ts` does not exist and the component still renders its SVG icon layer.

- [ ] **Step 4: Extract horizontal layout data and implement node descriptors**

Move the current ten-node array verbatim into `nodes.ts`. Use these role dimensions at `iconSize = 40` and scale linearly for other values:

| Role | Shape | Width | Card depth | Extrusion height | Tier |
| --- | --- | ---: | ---: | ---: | ---: |
| collector | hexagon | 58px | 48px | 12px | 0 |
| relay | square | 48px | 40px | 10px | 1 |
| terminal | rectangle | 30px | 34px | 8px | 2 |

Set icon filenames to `${icon}.svg`, central colors/strokes for collector/relays, auxiliary color for terminals, `iconOpacity: 1`, and no progress or glow.

Export a `businessFlowHorizontalLayoutNodeById` record. In `routes.ts`, add:

```ts
function nodePoint(id: BusinessFlowHorizontalLayoutNode['id']) {
  const node = businessFlowHorizontalLayoutNodeById[id];
  return point(node.x, node.y);
}
```

Replace route endpoints that currently repeat collector, relay, or terminal coordinates with `nodePoint('collector')`, `nodePoint('relay-1')`, `nodePoint('relay-2')`, `nodePoint('relay-3')`, and `nodePoint('terminal-1')` through `nodePoint('terminal-6')` as appropriate. Leave every intermediate point and timing value unchanged. This makes route endpoints and node centers share one source of truth.

- [ ] **Step 5: Pass horizontal nodes and style into FlowLayer3D**

Memoize descriptors from the existing public props. Pass the Node3D default gradients:

```ts
const nodeStyle = useMemo<FlowLayer3DNodeStyle>(() => ({
  assetBasePath: '/assets/nodes',
  frontGradient: { angle: 117, start: '#066b43', mid: '#03492b', end: '#052f24' },
  mode: 'dark',
  nodeCornerRadius: 10,
  outlineOpacity: 0,
  outlineWidth: 1,
  progressBarHeight: 15,
  progressMode: 'outline',
  progressPadding: 1,
  sideXGradient: { angle: 360, start: '#31775a', mid: '#10402e', end: '#5c899b' },
  sideZGradient: { angle: 177, start: '#427298', mid: '#366480', end: '#0e4b81' },
}), []);
```

Remove Pillar icon imports and the visible `iconLayer`. Keep the burst layer unchanged.

- [ ] **Step 6: Remove obsolete horizontal icon CSS**

Delete `.iconLayer`, `.iconNode`, `.pillarIcon`, `.collectorNode .pillarIcon`, `.surroundingIcon`, and their reduced-motion filter rule. Keep flow, grid, and burst stacking unchanged; FlowLayer3D now owns both WebGL and CSS3D visuals beneath `.burstLayer`.

- [ ] **Step 7: Verify GREEN and route regression**

Run:

```bash
npm test -- src/features/business-flow-horizontal
npm run typecheck
npm run lint
```

Expected: PASS; route count stays 12 and beam slots stay 12.

- [ ] **Step 8: Commit**

```bash
git add src/features/business-flow-horizontal
git commit -m "refactor: reuse Node3D in horizontal flow"
```

---

### Task 7: Vertical Role Hierarchy Migration

**Files:**
- Create: `src/features/business-flow-vertical/nodes.ts`
- Test: `src/features/business-flow-vertical/nodes.test.ts`
- Modify: `src/features/business-flow-vertical/routes.ts`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.tsx`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.module.css`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`

**Interfaces:**
- Produces:

```ts
export type BusinessFlowVerticalSatellite = {
  name: PillarSurroundingIconName;
  x: number;
  y: number;
};

export const businessFlowVerticalCentralNodes: readonly {
  id: PillarIconName;
  label: string;
  point: PillarPoint;
}[];

export function createBusinessFlowVerticalSatellites(
  topCount: number,
  bottomCount: number,
  spacing: number,
): readonly BusinessFlowVerticalSatellite[];

export function createBusinessFlowVerticalNodes(options: {
  auxiliaryIconColor: string;
  centralIconColor: string;
  centralIconFillMode: PillarIconFillMode;
  centralIconStrokeOpacity: number;
  gradient: Node3DResolvedGradient;
  iconSize: number;
  satellites: readonly BusinessFlowVerticalSatellite[];
  strokeWidth: number;
}): readonly FlowLayer3DNode[];
```

- [ ] **Step 1: Write failing vertical layout and role tests**

```ts
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
```

- [ ] **Step 2: Extend failing vertical component tests**

Capture nodes in the FlowLayer3D mock. For two top and two bottom nodes, assert eight node descriptors, eleven paths, one shared layer, no visible Pillar SVG artwork, and four visually hidden central semantic list items named Server, Graph, Vector, and Intelligence. Keep all current burst and beam-control assertions.

- [ ] **Step 3: Verify RED**

Run:

```bash
npm test -- src/features/business-flow-vertical/nodes.test.ts src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx
```

Expected: FAIL because `nodes.ts` does not exist and the visible SVG layers remain.

- [ ] **Step 4: Extract the vertical layout source of truth**

Move `rowPoint`, surrounding icon cycling, and central point/order data into `nodes.ts`. Export central nodes with points `[20, 50]`, `[40, 50]`, `[60, 50]`, and `[80, 50]`. Update `routes.ts` to import the same points and central order; do not change traversal, arrival, timing, continuation, or fading algorithms.

- [ ] **Step 5: Implement vertical node descriptors**

Use these dimensions at `iconSize = 40`, scaling linearly:

| Role | Shape | Width | Card depth | Extrusion height | Tier |
| --- | --- | ---: | ---: | ---: | ---: |
| central pillar | square | 48px | 40px | 10px | 1 |
| satellite | rectangle | 30px | 34px | 8px | 2 |

Central icons use `iconFillMode: centralIconFillMode === 'gradient' ? 'gradient' : 'solid'`, the supplied icon gradient, central color, stroke opacity, and stroke width. Satellites use solid auxiliary color and `strokeWidth / 4`, preserving the current relative stroke treatment.

- [ ] **Step 6: Migrate the component and preserve semantics**

Memoize satellites once, derive `satellitePoints`, routes, beam source, and Node3D descriptors from that same value, and pass `nodes` plus `nodeStyle` to FlowLayer3D. Use the supplied front gradient and the same Node3D side gradients as the horizontal flow.

Remove the visible `.composition` and `.surroundingLayer`. Replace them with:

```tsx
<ul className={styles.semanticList} aria-label="Central flow nodes">
  {businessFlowVerticalCentralNodes.map(({ id, label }) => (
    <li key={id}>{label}</li>
  ))}
</ul>
```

Implement `.semanticList` with the established visually-hidden pattern: absolute 1px box, clipped, overflow hidden, and white-space nowrap. Keep the section label and burst layer.

- [ ] **Step 7: Remove obsolete vertical icon CSS**

Delete `.composition`, `.surroundingLayer`, `.grid`, `.card`, `.icon`, `.surroundingIcon`, their nth-child positions, and the icon filter behavior. Retain root, grid background, FlowLayer3D, burst, reduced-motion, and responsive rules.

- [ ] **Step 8: Verify GREEN and all vertical regressions**

Run:

```bash
npm test -- src/features/business-flow-vertical
npm run typecheck
npm run lint
```

Expected: PASS; dynamic path counts, beam trail conversion, arrival bursts, and reduced-motion cleanup remain unchanged.

- [ ] **Step 9: Commit**

```bash
git add src/features/business-flow-vertical
git commit -m "refactor: reuse Node3D in vertical flow"
```

---

### Task 8: Full Regression and Visual Verification

**Files:**
- Modify only if verification finds an in-scope defect: files already listed in Tasks 1–7.

**Interfaces:**
- Consumes: completed Node3D, FlowLayer3D, horizontal, and vertical implementations.
- Produces: verified production and Storybook builds with no known acceptance-criteria gaps.

- [ ] **Step 1: Run focused tests**

```bash
npm test -- src/components/elements/Node3D src/components/elements/FlowLayer3D src/features/business-flow-horizontal src/features/business-flow-vertical
```

Expected: PASS with no warnings.

- [ ] **Step 2: Run the complete automated suite**

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run build-storybook
```

Expected: every command exits `0`.

- [ ] **Step 3: Inspect the horizontal Storybook story**

Open `/?path=/story/animated-illustrations-businessflowhorizontal--foundation` at its default size and a narrow viewport. Confirm:

- one collector hexagon, three relay squares, and six document nodes;
- all business icons are crisp and correctly colored;
- node centers match connector endpoints;
- beams enter and terminate at the matching nodes;
- bursts stay aligned above nodes;
- no duplicated SVG icon layer is visible; and
- browser console contains no WebGL, CSS3D, asset, React, or disposal errors.

- [ ] **Step 4: Inspect the vertical Storybook story**

Open `/?path=/story/animated-illustrations-businessflowvertical--foundation` at its default size and a narrow viewport. Confirm:

- four central squares and the configured top/bottom document nodes;
- all seven icon types appear where expected;
- dynamic node counts and spacing controls remain aligned with routes;
- continuation connectors, beams, and bursts stay aligned;
- reduced motion leaves static nodes/connectors visible; and
- browser console contains no WebGL, CSS3D, asset, React, or disposal errors.

- [ ] **Step 5: Run Storybook accessibility checks**

Run the a11y panel for both stories. Confirm no new violations, no duplicate visible/icon announcements, the horizontal figure label remains, and the vertical central semantic list exposes four items.

- [ ] **Step 6: Exercise failure cleanup**

Use the existing FlowLayer3D component test that forces scene construction to throw and the scene test that unmounts after resize. Confirm the fallback is visible, observers disconnect, animation frames cancel, CSS3D DOM is removed, renderer-owned textures dispose once, and WebGL disposes once.

- [ ] **Step 7: Review the final diff**

```bash
git status --short
git diff --check HEAD~7..HEAD
git diff --stat HEAD~7..HEAD
```

Confirm only the approved Node3D reuse, tests, assets, and related documentation changed. Do not add `.superpowers/` visual-companion artifacts.

- [ ] **Step 8: Commit verification fixes only when verification changed files**

If verification changed an in-scope implementation file, rerun the failing command and stage only the changed files from this explicit scope:

```bash
git add public/assets/nodes \
  src/components/elements/Node3D \
  src/components/elements/FlowLayer3D \
  src/features/business-flow-horizontal \
  src/features/business-flow-vertical
git commit -m "fix: complete Node3D flow verification"
```

If no fixes were needed, do not create an empty commit.
