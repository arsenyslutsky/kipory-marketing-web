# Shared Connector3D Flow Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make BusinessFlow3D, BusinessFlowHorizontal, and BusinessFlowVertical construct every connector through the shared Connector3D factory while preserving the horizontal and vertical top-view compositions.

**Architecture:** Add a renderer-independent normalized route model and one reusable FlowLayer3D WebGL scene per top-view illustration. FlowLayer3D maps two-dimensional layout points to an orthographic Three.js plane, creates connectors with `createConnector3DObject`, creates pulses with `createBeam3DObject`, and leaves existing DOM/SVG icons and burst overlays intact.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript 5.9, Three.js 0.185.1, Storybook 10.5.10, Vitest, Testing Library, jsdom.

**Spec:** `docs/superpowers/specs/2026-08-27-shared-connector3d-flow-layer-design.md`

## Global Constraints

- Preserve BusinessFlowHorizontal and BusinessFlowVertical public props and defaults.
- Preserve their flat orthographic top views, route topology, SVG icon artwork, responsive dimensions, CSS grids, and accessible labels.
- Use exactly one transparent WebGL canvas, renderer, resize observer, and animation loop per migrated illustration.
- Construct connectors only through `createConnector3DObject` or `createFadingConnector3DObject`.
- Construct pulses only through `createBeam3DObject`.
- Keep BusinessFlow3D behavior unchanged.
- Skip invalid paths with fewer than two distinct points without throwing.
- Leave icons visible when WebGL initialization fails and report a development-only diagnostic.
- Before editing client components, read `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`, and `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` as required by `AGENTS.md`.
- Follow red-green-refactor for every production change.

---

### Task 1: Test Harness and Normalized Flow Paths

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/components/elements/FlowLayer3D/types.ts`
- Create: `src/components/elements/FlowLayer3D/resolveFlowLayer3D.ts`
- Test: `src/components/elements/FlowLayer3D/resolveFlowLayer3D.test.ts`

**Interfaces:**
- Consumes: `FlowPath3D` and `FlowPath3DPoint` from `src/components/elements/FlowPath3D/types.ts`.
- Produces:
  - `FlowLayer3DPoint = readonly [x: number, y: number]`
  - `FlowLayer3DFrame = { aspectRatio: number; worldHeight?: number }`
  - `FlowLayer3DPath = { id: string; points: readonly FlowLayer3DPoint[]; curve?: number; fading?: boolean }`
  - `normalizedPointToWorld(point, frame): FlowPath3DPoint`
  - `resolveFlowLayer3DPath(path, frame): ResolvedFlowLayer3DPath | null`

- [ ] **Step 1: Install and configure the test harness**

Run:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
```

- [ ] **Step 2: Write the failing path tests**

```ts
import { describe, expect, it } from 'vitest';
import { normalizedPointToWorld, resolveFlowLayer3DPath } from './resolveFlowLayer3D';

describe('normalizedPointToWorld', () => {
  it('maps top-view coordinates into an aspect-correct X/Z plane', () => {
    expect(normalizedPointToWorld([0, 0], { aspectRatio: 2, worldHeight: 10 }))
      .toEqual([-10, 0, 5]);
    expect(normalizedPointToWorld([1, 1], { aspectRatio: 2, worldHeight: 10 }))
      .toEqual([10, 0, -5]);
    expect(normalizedPointToWorld([0.5, 0.5], { aspectRatio: 2, worldHeight: 10 }))
      .toEqual([0, 0, 0]);
  });
});

describe('resolveFlowLayer3DPath', () => {
  it('maps points and preserves route settings', () => {
    expect(resolveFlowLayer3DPath({
      id: 'route-a', curve: 48,
      points: [[0, 0.5], [0.5, 0.5], [0.5, 1]],
    }, { aspectRatio: 1, worldHeight: 20 })).toEqual({
      id: 'route-a',
      fading: false,
      path: {
        curve: 48,
        interpolation: 'linear',
        points: [[-10, 0, 0], [0, 0, 0], [0, 0, -10]],
      },
    });
  });

  it('returns null for fewer than two distinct points', () => {
    expect(resolveFlowLayer3DPath({ id: 'empty', points: [] }, { aspectRatio: 1 })).toBeNull();
    expect(resolveFlowLayer3DPath({
      id: 'duplicate', points: [[0.5, 0.5], [0.5, 0.5]],
    }, { aspectRatio: 1 })).toBeNull();
  });
});
```

- [ ] **Step 3: Verify RED**

Run `npm test -- src/components/elements/FlowLayer3D/resolveFlowLayer3D.test.ts`.

Expected: FAIL because the FlowLayer3D path module does not exist.

- [ ] **Step 4: Implement the minimal path model**

`types.ts` must define the listed interfaces and:

```ts
export type ResolvedFlowLayer3DPath = {
  fading: boolean;
  id: string;
  path: FlowPath3D;
};
```

`resolveFlowLayer3D.ts`:

```ts
export function normalizedPointToWorld(
  [x, y]: FlowLayer3DPoint,
  { aspectRatio, worldHeight = 20 }: FlowLayer3DFrame,
): FlowPath3DPoint {
  const worldWidth = worldHeight * Math.max(aspectRatio, 0.0001);
  return [(x - 0.5) * worldWidth, 0, (0.5 - y) * worldHeight];
}

export function resolveFlowLayer3DPath(
  route: FlowLayer3DPath,
  frame: FlowLayer3DFrame,
): ResolvedFlowLayer3DPath | null {
  const points = route.points.filter((point, index, source) => (
    index === 0 || point[0] !== source[index - 1][0] || point[1] !== source[index - 1][1]
  ));
  if (points.length < 2) return null;
  return {
    fading: route.fading ?? false,
    id: route.id,
    path: {
      curve: route.curve ?? 0,
      interpolation: 'linear',
      points: points.map((point) => normalizedPointToWorld(point, frame)),
    },
  };
}
```

- [ ] **Step 5: Verify GREEN**

Run `npm test -- src/components/elements/FlowLayer3D/resolveFlowLayer3D.test.ts`.

Expected: PASS with no warnings.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/components/elements/FlowLayer3D
git commit -m "test: add normalized flow layer path model"
```

---

### Task 2: Shared FlowLayer3D Scene and React Component

**Files:**
- Create: `src/components/elements/FlowLayer3D/FlowLayer3D.module.css`
- Create: `src/components/elements/FlowLayer3D/FlowLayer3D.tsx`
- Create: `src/components/elements/FlowLayer3D/createFlowLayer3DObjects.ts`
- Test: `src/components/elements/FlowLayer3D/createFlowLayer3DObjects.test.ts`
- Create: `src/components/elements/FlowLayer3D/stepFlowLayer3DBeamRun.ts`
- Test: `src/components/elements/FlowLayer3D/stepFlowLayer3DBeamRun.test.ts`
- Create: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts`
- Test: `src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx`
- Create: `src/components/elements/FlowLayer3D/index.ts`

**Interfaces:**
- Consumes: `resolveFlowPath3D`, `createConnector3DObject`, `createFadingConnector3DObject`, `createBeam3DFlareTexture`, and `createBeam3DObject`.
- Produces:
  - `FlowLayer3DConnectorStyle = { color; opacity; stroke; width }`
  - `FlowLayer3DBeamStyle = { beamColor; beamHighlightColor; beamWidth; enabled; glowIntensity; trailLength }`
  - `FlowLayer3DArrival = { id; point; progress }`
  - `FlowLayer3DArrivalEvent = { arrival; generation; runId; slot }`
  - `FlowLayer3DBeamRun = { arrivals?; delayMs; durationMs; id; path }`
  - `FlowLayer3DBeamSource = { slots; next(slot, generation) }`
  - `FlowLayer3DProps`
  - `stepFlowLayer3DBeamRun(run, elapsedMs, deliveredArrivalIds)`
  - `createFlowLayer3DScene(options): FlowLayer3DSceneController`
  - `FlowLayer3D`

- [ ] **Step 1: Extend the shared types**

```ts
export type FlowLayer3DConnectorStyle = {
  color: string;
  opacity: number;
  stroke: Connector3DStroke;
  width: number;
};

export type FlowLayer3DBeamStyle = {
  beamColor: string;
  beamHighlightColor: string;
  beamWidth: number;
  enabled: boolean;
  glowIntensity: number;
  trailLength: number;
};

export type FlowLayer3DArrival = {
  id: string;
  point: FlowLayer3DPoint;
  progress: number;
};

export type FlowLayer3DArrivalEvent = {
  arrival: FlowLayer3DArrival;
  generation: number;
  runId: string;
  slot: number;
};

export type FlowLayer3DBeamRun = {
  arrivals?: readonly FlowLayer3DArrival[];
  delayMs: number;
  durationMs: number;
  id: string;
  path: FlowLayer3DPath;
};

export type FlowLayer3DBeamSource = {
  slots: number;
  next: (slot: number, generation: number) => FlowLayer3DBeamRun | null;
};

export type FlowLayer3DProps = {
  beam: FlowLayer3DBeamStyle;
  beamSource: FlowLayer3DBeamSource;
  className?: string;
  connector: FlowLayer3DConnectorStyle;
  onArrival?: (event: FlowLayer3DArrivalEvent) => void;
  paths: readonly FlowLayer3DPath[];
  reducedMotion?: boolean;
  worldHeight?: number;
};

export type FlowLayer3DSceneOptions = Omit<FlowLayer3DProps, 'className'> & {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
};

export type FlowLayer3DSceneController = { destroy: () => void };
```

- [ ] **Step 2: Write the failing real-object composition test**

```ts
import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createFlowLayer3DObjects } from './createFlowLayer3DObjects';

it('creates Connector3D objects and skips invalid paths', () => {
  const objects = createFlowLayer3DObjects({
    aspectRatio: 1,
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    paths: [
      { id: 'valid', points: [[0, 0.5], [1, 0.5]] },
      { id: 'invalid', points: [[0.5, 0.5], [0.5, 0.5]] },
    ],
    worldHeight: 20,
  });
  expect(objects.connectors).toHaveLength(1);
  expect(objects.connectors[0].userData.flowLayer3DPathId).toBe('valid');
  expect(objects.group).toBeInstanceOf(THREE.Group);
  objects.destroy();
  expect(objects.group.children).toHaveLength(0);
});
```

- [ ] **Step 3: Verify RED**

Run `npm test -- src/components/elements/FlowLayer3D/createFlowLayer3DObjects.test.ts`.

Expected: FAIL because the object composer does not exist.

- [ ] **Step 4: Implement connector composition and disposal**

Build each valid path with:

```ts
const resolvedPath = resolveFlowPath3D(route.path);
const connectorObject = route.fading
  ? createFadingConnector3DObject({ ...connector, fogEnabled: false, path: resolvedPath })
  : createConnector3DObject({ ...connector, fogEnabled: false, path: resolvedPath });
connectorObject.userData.flowLayer3DPathId = route.id;
group.add(connectorObject);
```

`destroy()` must traverse the group, dispose every geometry, material, and texture using the existing BusinessFlow3D disposal pattern, then clear the group.

- [ ] **Step 5: Verify GREEN**

Run `npm test -- src/components/elements/FlowLayer3D/createFlowLayer3DObjects.test.ts`.

Expected: PASS with one connector and complete cleanup.

- [ ] **Step 6: Write the failing React lifecycle tests**

First write `stepFlowLayer3DBeamRun.test.ts` to lock the shared scheduler behavior:

```ts
import { expect, it } from 'vitest';
import { stepFlowLayer3DBeamRun } from './stepFlowLayer3DBeamRun';

const run = {
  id: 'run-a',
  delayMs: 250,
  durationMs: 1000,
  path: { id: 'path-a', points: [[0, 0], [1, 1]] as const },
  arrivals: [
    { id: 'middle', point: [0.5, 0.5] as const, progress: 0.5 },
    { id: 'end', point: [1, 1] as const, progress: 1 },
  ],
};

it('waits for delay and emits each crossed arrival once', () => {
  expect(stepFlowLayer3DBeamRun(run, 200, new Set())).toMatchObject({
    completed: false, progress: 0, arrivals: [],
  });
  expect(stepFlowLayer3DBeamRun(run, 750, new Set())).toMatchObject({
    completed: false, progress: 0.5, arrivals: [run.arrivals[0]],
  });
  expect(stepFlowLayer3DBeamRun(run, 900, new Set(['middle']))).toMatchObject({
    arrivals: [],
  });
  expect(stepFlowLayer3DBeamRun(run, 1250, new Set(['middle']))).toMatchObject({
    completed: true, progress: 1, arrivals: [run.arrivals[1]],
  });
});
```

Run `npm test -- src/components/elements/FlowLayer3D/stepFlowLayer3DBeamRun.test.ts`.

Expected: FAIL because the scheduler does not exist.

Implement it with clamped linear progress and arrival filtering:

```ts
export function stepFlowLayer3DBeamRun(
  run: FlowLayer3DBeamRun,
  elapsedMs: number,
  deliveredArrivalIds: ReadonlySet<string>,
) {
  const travelMs = Math.max(0, elapsedMs - Math.max(0, run.delayMs));
  const durationMs = Math.max(1, run.durationMs);
  const progress = Math.min(1, travelMs / durationMs);
  return {
    arrivals: (run.arrivals ?? []).filter((arrival) => (
      arrival.progress <= progress && !deliveredArrivalIds.has(arrival.id)
    )),
    completed: travelMs >= durationMs,
    progress,
  };
}
```

Run the focused scheduler test again. Expected: PASS.

Then write the React lifecycle tests.

Mock only the WebGL scene boundary because jsdom has no WebGL context:

```tsx
import { render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { FlowLayer3D } from './FlowLayer3D';
import { createFlowLayer3DScene } from './createFlowLayer3DScene';

vi.mock('./createFlowLayer3DScene', () => ({ createFlowLayer3DScene: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

it('creates one scene and destroys it on unmount', () => {
  const destroy = vi.fn();
  vi.mocked(createFlowLayer3DScene).mockReturnValue({ destroy });
  const view = render(<FlowLayer3D
    beam={{
      beamColor: '#449c40', beamHighlightColor: '#c9ebc7', beamWidth: 1,
      enabled: true, glowIntensity: 1, trailLength: 0.38,
    }}
    beamSource={{ slots: 0, next: () => null }}
    connector={{ color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 }}
    paths={[{ id: 'a', points: [[0, 0], [1, 1]] }]}
  />);
  expect(createFlowLayer3DScene).toHaveBeenCalledTimes(1);
  expect(view.container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  view.unmount();
  expect(destroy).toHaveBeenCalledTimes(1);
});

it('keeps its decorative container when WebGL initialization fails', () => {
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.mocked(createFlowLayer3DScene).mockImplementation(() => { throw new Error('WebGL unavailable'); });
  const view = render(<FlowLayer3D
    beam={{
      beamColor: '#449c40', beamHighlightColor: '#c9ebc7', beamWidth: 1,
      enabled: true, glowIntensity: 1, trailLength: 0.38,
    }}
    beamSource={{ slots: 0, next: () => null }}
    connector={{ color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 }}
    paths={[]}
  />);
  expect(view.container.firstElementChild).toBeInTheDocument();
  expect(diagnostic).toHaveBeenCalledWith(expect.objectContaining({ message: 'WebGL unavailable' }));
});
```

- [ ] **Step 7: Verify RED**

Run `npm test -- src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx`.

Expected: FAIL because FlowLayer3D and its scene controller do not exist.

- [ ] **Step 8: Implement the scene and React wrapper**

`createFlowLayer3DScene.ts` must:

1. Create one transparent antialiased WebGLRenderer on the supplied canvas.
2. Create an orthographic camera at `(0, 20, 0)` looking at the origin with `up = (0, 0, -1)`.
3. Build connector objects through `createFlowLayer3DObjects`.
4. Create one Beam3D object per source slot; request `next(slot, generation)` after each run.
5. Resolve run paths through `resolveFlowLayer3DPath` and `resolveFlowPath3D`.
6. Call `beam.update({ progress, time, visibility, packetVisibility, phase })` every frame.
7. Fire each arrival once when progress crosses its threshold.
8. Skip beam creation when disabled or reduced motion is active.
9. Update camera bounds and renderer size from ResizeObserver measurements, then rebuild connector paths and re-resolve active beam paths when the aspect ratio changes so normalized endpoints remain aligned with DOM icons.
10. Cancel animation, disconnect observation, dispose connector and beam resources, dispose the shared flare texture, and dispose the renderer in `destroy()`.

The React wrapper uses one effect:

```tsx
useEffect(() => {
  if (!containerRef.current || !canvasRef.current) return undefined;
  let controller: FlowLayer3DSceneController | undefined;
  try {
    controller = createFlowLayer3DScene({
      beam, beamSource, canvas: canvasRef.current, connector,
      container: containerRef.current, onArrival, paths, reducedMotion, worldHeight,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error(error);
  }
  return () => controller?.destroy();
}, [beam, beamSource, connector, onArrival, paths, reducedMotion, worldHeight]);
```

The component sets `aria-hidden="true"`. Its CSS positions the root and canvas at `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none`.

- [ ] **Step 9: Verify the shared layer**

Run:

```bash
npm test -- src/components/elements/FlowLayer3D
npm run typecheck
```

Expected: all FlowLayer3D tests pass and TypeScript reports no errors.

- [ ] **Step 10: Commit**

```bash
git add src/components/elements/FlowLayer3D src/test/setup.ts package.json package-lock.json
git commit -m "feat: add shared top-view Connector3D flow layer"
```

---

### Task 3: Migrate BusinessFlowHorizontal

**Files:**
- Create: `src/features/business-flow-horizontal/routes.ts`
- Test: `src/features/business-flow-horizontal/routes.test.ts`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.module.css`
- Test: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`

**Interfaces:**
- Consumes: `FlowLayer3D`, `FlowLayer3DPath`, and `FlowLayer3DBeamSource`.
- Produces:
  - `businessFlowHorizontalPaths: readonly FlowLayer3DPath[]`
  - `createBusinessFlowHorizontalBeamSource(speed: number): FlowLayer3DBeamSource`

- [ ] **Step 1: Write failing horizontal topology and timing tests**

```ts
it('preserves twelve connectors and the off-canvas entry', () => {
  expect(businessFlowHorizontalPaths).toHaveLength(12);
  expect(businessFlowHorizontalPaths[0]).toMatchObject({
    id: 'aux-top',
    points: [
      [324 / 320, 244 / 608], [302 / 320, 244 / 608],
      [302 / 320, 282 / 608], [282 / 320, 282 / 608],
    ],
  });
  expect(businessFlowHorizontalPaths.at(-1)?.id).toBe('relay-bottom-terminal-2');
});

it('preserves staggering and scales the cycle by speed', () => {
  const source = createBusinessFlowHorizontalBeamSource(2);
  expect(source.slots).toBe(12);
  expect(source.next(0, 0)).toMatchObject({ id: 'aux-top:0', delayMs: 0, durationMs: 312 });
  expect(source.next(1, 0)?.delayMs).toBe(50);
  expect(source.next(0, 1)?.delayMs).toBe(2288);
});
```

- [ ] **Step 2: Verify RED**

Run `npm test -- src/features/business-flow-horizontal/routes.test.ts`.

Expected: FAIL because `routes.ts` does not exist.

- [ ] **Step 3: Implement normalized routes and beam scheduling**

Convert each current 320×608 SVG route to normalized points. Cubic routes become orthogonal four-point polylines with a shared nonzero curve; straight routes remain two points.

Use:

```ts
const cycleMs = 5200 / resolvedSpeed;
const durationMs = cycleMs * (route.short ? 0.12 : 0.2);
const delayMs = generation === 0
  ? (route.delay * 1000) / resolvedSpeed
  : cycleMs - durationMs;
```

Each beam run uses the matching connector path and declares its endpoint as an arrival at progress `1`.

- [ ] **Step 4: Verify GREEN**

Run `npm test -- src/features/business-flow-horizontal/routes.test.ts`.

Expected: PASS with preserved count, endpoints, and timing.

- [ ] **Step 5: Write the failing component integration test**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BusinessFlowHorizontal } from './BusinessFlowHorizontal';

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({ paths, beamSource }: { paths: unknown[]; beamSource: { slots: number } }) => (
    <div data-testid="flow-layer" data-paths={paths.length} data-slots={beamSource.slots} />
  ),
}));

it('renders one shared layer and retains its DOM icon composition', () => {
  render(<BusinessFlowHorizontal />);
  expect(screen.getAllByTestId('flow-layer')).toHaveLength(1);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '12');
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-slots', '12');
  expect(screen.getByRole('img', { name: /Horizontal business flow/i })).toBeInTheDocument();
});
```

- [ ] **Step 6: Verify RED**

Run `npm test -- src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`.

Expected: FAIL because the component still renders SVG connectors.

- [ ] **Step 7: Replace horizontal SVG connectors and beams**

- Memoize connector style, beam style, and beam source from existing props.
- Render one FlowLayer3D behind the burst and icon layers.
- Use dashed connectors and preserve current colors, opacity, width, speed, and enabled state.
- Retain node positions, DOM bursts, icon components, dimensions, and labels.
- Remove SVG connector groups, beam paths, circles, and `animateMotion` markup.
- Replace `.diagram` with `.flowLayer` at z-index 1 and remove unused SVG beam selectors and keyframes.

- [ ] **Step 8: Verify the horizontal migration**

```bash
npm test -- src/features/business-flow-horizontal
npm run typecheck
npm run lint
```

Expected: tests pass with no TypeScript or ESLint errors.

- [ ] **Step 9: Commit**

```bash
git add src/features/business-flow-horizontal
git commit -m "refactor: reuse Connector3D in horizontal flow"
```

---

### Task 4: Extract Vertical Routes and Migrate BusinessFlowVertical

**Files:**
- Create: `src/features/business-flow-vertical/routes.ts`
- Test: `src/features/business-flow-vertical/routes.test.ts`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.tsx`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.module.css`
- Test: `src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`
- Delete: `src/features/business-flow-vertical/components/PillarsConnectors.tsx`

**Interfaces:**
- Consumes: `FlowLayer3D`, `FlowLayer3DPath`, `FlowLayer3DBeamSource`, and `FlowLayer3DArrival`.
- Produces:
  - `PillarPoint = readonly [x: number, y: number]`
  - `createBusinessFlowVerticalPaths(satellitePoints, showContinuation): FlowLayer3DPath[]`
  - `createBusinessFlowVerticalBeamSource(options): FlowLayer3DBeamSource`

- [ ] **Step 1: Write failing vertical topology and timing tests**

```ts
const satellites = [[20, 18], [80, 18], [20, 82], [80, 82]] as const;

it('builds central, satellite, and continuation connectors', () => {
  expect(createBusinessFlowVerticalPaths(satellites, false)).toHaveLength(7);
  const continued = createBusinessFlowVerticalPaths(satellites, true);
  expect(continued).toHaveLength(11);
  expect(continued.filter((path) => path.fading)).toHaveLength(4);
});

it('uses deterministic staggering when randomness is disabled', () => {
  const source = createBusinessFlowVerticalBeamSource({
    connectorRadius: 1.75,
    emissionRandomness: 0,
    maxConcurrentBeams: 4,
    random: () => 0.5,
    satellitePoints: satellites,
    showContinuationConnectors: false,
    speed: 1,
  });
  expect(source.slots).toBe(4);
  expect(source.next(0, 0)?.delayMs).toBe(0);
  expect(source.next(1, 0)?.delayMs).toBe(280);
  const run = source.next(0, 0)!;
  expect(run.arrivals?.at(-1)?.progress).toBe(1);
  expect(run.durationMs).toBeGreaterThanOrEqual(1500);
  expect(run.durationMs).toBeLessThanOrEqual(4300);
});
```

- [ ] **Step 2: Verify RED**

Run `npm test -- src/features/business-flow-vertical/routes.test.ts`.

Expected: FAIL because `routes.ts` does not exist.

- [ ] **Step 3: Extract renderer-independent vertical routes**

Move and adapt these functions from PillarsConnectors without React or SVG dependencies: `distance`, `routeToSatellite`, `continuationRoute`, `satelliteParent`, `centralTraversal`, `completeBeamRoute`, `beamArrivalPoints`, `initialBeamTrace`, `randomBeamTrace`, `approximateScreenLength`, `routeProgressAtPoint`, `emissionDelay`, and `createBeamRun`.

Normalize points with:

```ts
const normalize = ([x, y]: PillarPoint): FlowLayer3DPoint => [x / 100, y / 100];
```

Parameterize randomness:

```ts
type VerticalBeamSourceOptions = {
  connectorRadius: number;
  emissionRandomness: number;
  maxConcurrentBeams: number;
  random?: () => number;
  satellitePoints: readonly PillarPoint[];
  showContinuationConnectors: boolean;
  speed: number;
};
```

Map the current radius into the shared curve control with `Math.min(100, Math.max(0, connectorRadius * 20))`.

- [ ] **Step 4: Verify GREEN**

Run `npm test -- src/features/business-flow-vertical/routes.test.ts`.

Expected: PASS with 7 base connectors, 11 with continuations, deterministic delays, and bounded durations.

- [ ] **Step 5: Write the failing component integration test**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { BusinessFlowVertical } from './BusinessFlowVertical';

vi.mock('@/components/elements/FlowLayer3D', () => ({
  FlowLayer3D: ({ paths, beamSource }: { paths: unknown[]; beamSource: { slots: number } }) => (
    <div data-testid="flow-layer" data-paths={paths.length} data-slots={beamSource.slots} />
  ),
}));

it('renders one shared layer while retaining central and surrounding icons', () => {
  render(<BusinessFlowVertical
    numberOfNodesTop={2}
    numberOfNodesBottom={2}
    showContinuationConnectors
  />);
  expect(screen.getAllByTestId('flow-layer')).toHaveLength(1);
  expect(screen.getByTestId('flow-layer')).toHaveAttribute('data-paths', '11');
  expect(screen.getByLabelText('Vertical business flow')).toBeInTheDocument();
  expect(screen.getAllByRole('img')).toHaveLength(4);
});
```

- [ ] **Step 6: Verify RED**

Run `npm test -- src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`.

Expected: FAIL because BusinessFlowVertical still renders PillarsConnectors.

- [ ] **Step 7: Replace PillarsConnectors with FlowLayer3D**

- Compute satellite points as today.
- Memoize extracted connector paths and beam source.
- Render one FlowLayer3D below surrounding and central icon layers.
- Preserve current connector, beam, burst, grid, icon, and sizing prop defaults.
- Translate arrival callbacks into DOM burst records keyed by run and generation.
- Remove completed burst records from `onAnimationEnd`.
- Leave central and surrounding SVG icon rendering unchanged.
- Delete PillarsConnectors after no imports remain.
- Remove obsolete connector, continuation, orb, and trail CSS while retaining grid, icon, and burst rules.

- [ ] **Step 8: Verify the vertical migration**

```bash
npm test -- src/features/business-flow-vertical
npm test
npm run typecheck
npm run lint
```

Expected: all tests pass with no TypeScript or ESLint errors.

- [ ] **Step 9: Commit**

```bash
git add src/features/business-flow-vertical
git commit -m "refactor: reuse Connector3D in vertical flow"
```

---

### Task 5: Storybook and Production Verification

**Files:**
- Modify only when verification identifies a migration-specific issue:
  - `src/components/elements/FlowLayer3D/*`
  - `src/features/business-flow-horizontal/*`
  - `src/features/business-flow-vertical/*`

**Interfaces:**
- Consumes: the shared layer and both migrated features.
- Produces: verified stories and production pages with no migration-specific errors.

- [ ] **Step 1: Run complete automated verification**

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run build-storybook
```

Expected: every command exits zero. The existing Storybook large-chunk advisory is allowed; new compile, runtime, or accessibility errors are not.

- [ ] **Step 2: Restart Storybook and inspect the affected stories**

Run `npm run storybook -- --host 127.0.0.1`, then inspect:

- `/?path=/story/animated-illustrations-businessflow3d--workflow-1`
- `/?path=/story/animated-illustrations-businessflowhorizontal--foundation`
- `/?path=/story/animated-illustrations-businessflowvertical--foundation`
- `/?path=/story/elements-connector3d--foundation`
- `/?path=/story/elements-beam3d--foundation`

- [ ] **Step 3: Verify the horizontal visual contract**

At desktop and narrow viewports confirm 12 dashed routes, previous right-to-left staggering, aligned collector/relay/terminal icons, unchanged grid and bursts, exactly one canvas, and no console errors during mount, controls changes, or navigation.

- [ ] **Step 4: Verify the vertical visual contract**

At desktop and narrow viewports confirm previous central/satellite topology, faded continuation edges, concurrent complete routes, aligned arrival bursts, working controls, exactly one canvas, and no console errors during mount, controls changes, or navigation.

- [ ] **Step 5: Run accessibility scans**

Run the Storybook Accessibility addon for both migrated stories. Confirm the canvas is decorative, icon labels remain available, and no new violations are introduced.

- [ ] **Step 6: Verify the homepage**

Run the Next.js development server and inspect `/` at desktop and narrow viewports. Confirm BusinessFlow3D and BusinessFlowVertical render, animate, resize, and unmount without WebGL or React errors.

- [ ] **Step 7: Verify repository state**

```bash
git diff --check
git status --short
git log --oneline -5
```

Expected: no whitespace errors; only intentional migration corrections remain if visual verification required a final change.

- [ ] **Step 8: Commit scoped verification corrections if present**

```bash
git add src/components/elements/FlowLayer3D src/features/business-flow-horizontal src/features/business-flow-vertical
git commit -m "fix: complete shared flow layer verification"
```

Do not create an empty commit when no correction was necessary.
