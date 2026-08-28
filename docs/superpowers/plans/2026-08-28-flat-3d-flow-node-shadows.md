# Flat 3D Flow Node Shadows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add soft, lower-right, shape-aware shadows beneath every node in the shared horizontal and vertical 2D-perspective flow illustrations.

**Architecture:** Complete the shadow path already present in `createNode3DObject`, whose node bodies already set `castShadow = true`. Configure the shared `FlowLayer3D` WebGL renderer for VSM shadows, add one directional light and one transparent receiver plane to `createFlowLayer3DScene`, and dispose the receiver resources with the existing scene lifecycle. No component props or illustration-specific shadow implementations are added.

**Tech Stack:** TypeScript, Three.js 0.185.1, React 19, Vitest 4, Next.js 16.3.2

**Spec:** `docs/superpowers/specs/2026-08-28-flat-3d-flow-node-shadows-design.md`

## Global Constraints

- Apply the effect to every node rendered by `FlowLayer3D`, covering both `BusinessFlowVertical` and `BusinessFlowHorizontal`.
- Preserve node gradients, icons, progress indicators, glows, connectors, beams, and arrival bursts.
- Keep the shadow implementation internal to the shared scene; add no public component props.
- Use one light and one receiver for the complete scene and introduce no per-frame DOM work.
- Dispose every new geometry and material during normal teardown and guarded initialization failure cleanup.
- Do not overwrite or commit the pre-existing uncommitted horizontal-width changes in `src/app/marketing.module.css`, `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`, or `src/features/business-flow-horizontal/presets.ts` as part of the shadow commit.

## File Structure

- `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts`: configure shadow rendering, create the shared light and catcher, and own their cleanup.
- `src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts`: prove the renderer/scene shadow contract and GPU resource disposal.

---

### Task 1: Add shape-aware soft shadows to the shared flow scene

**Files:**
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts:3-78`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts:80-104`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts:37-54`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts:93-110`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts:316-337`

**Interfaces:**
- Consumes: node bodies returned by `createNode3DObject`, which already have `THREE.Mesh.castShadow = true`.
- Produces: an internal `THREE.DirectionalLight` and `THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial>` owned by `createFlowLayer3DScene`.
- Public API: unchanged; `FlowLayer3DProps`, `FlowLayer3DNodeStyle`, `BusinessFlowVerticalProps`, and `BusinessFlowHorizontalProps` receive no new fields.

- [ ] **Step 1: Extend the renderer double and write the failing scene-shadow test**

Add a mutable shadow-map shape to the hoisted renderer double and reset it after every test:

```ts
const renderer = vi.hoisted(() => ({
  dispose: vi.fn(),
  outputColorSpace: undefined,
  render: vi.fn(),
  setClearColor: vi.fn(),
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  shadowMap: { enabled: false, type: undefined as number | undefined },
}));

afterEach(() => {
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = undefined;
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
```

Add this regression test near the renderer-configuration test:

```ts
it('renders and disposes soft lower-right shadows beneath flow nodes', () => {
  const animationFrames: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return { disconnect: vi.fn(), observe: vi.fn() };
  }));
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientHeight: { value: 640 },
    clientWidth: { value: 320 },
  });
  const controller = createFlowLayer3DScene({
    beam: {
      beamColor: '#449c40',
      beamHighlightColor: '#c9ebc7',
      beamWidth: 1,
      enabled: false,
      glowIntensity: 1,
      trailLength: 0.38,
    },
    beamSource: { slots: 0, next: () => null },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container,
    cssLayer: document.createElement('div'),
    paths: [],
  });

  const firstFrame = animationFrames.shift();
  if (!firstFrame) throw new Error('Expected the first animation frame.');
  firstFrame(1000);

  const scene = renderer.render.mock.calls[0]?.[0] as THREE.Scene | undefined;
  if (!scene) throw new Error('Expected the flow scene to render.');
  const light = scene.children.find((object): object is THREE.DirectionalLight => (
    object instanceof THREE.DirectionalLight
  ));
  const catcher = scene.children.find((object): object is THREE.Mesh => (
    object instanceof THREE.Mesh && object.material instanceof THREE.ShadowMaterial
  ));
  if (!light || !catcher || !(catcher.material instanceof THREE.ShadowMaterial)) {
    throw new Error('Expected a directional shadow light and receiving plane.');
  }

  expect(renderer.shadowMap.enabled).toBe(true);
  expect(renderer.shadowMap.type).toBe(THREE.VSMShadowMap);
  expect(light.castShadow).toBe(true);
  expect(light.position.x).toBeLessThan(0);
  expect(light.position.y).toBeGreaterThan(0);
  expect(light.position.z).toBeLessThan(0);
  expect(catcher.receiveShadow).toBe(true);
  expect(catcher.position.y).toBeLessThan(0.29);
  expect(catcher.material.transparent).toBe(true);
  expect(catcher.material.opacity).toBeGreaterThan(0);

  const disposeGeometry = vi.spyOn(catcher.geometry, 'dispose');
  const disposeMaterial = vi.spyOn(catcher.material, 'dispose');
  controller.destroy();

  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
});
```

Add a second regression for the existing guarded initialization-failure path:

```ts
it('disposes shadow resources when flow-scene initialization fails', () => {
  vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.stubGlobal('ResizeObserver', vi.fn(function MockResizeObserver() {
    return {
      disconnect: vi.fn(),
      observe: vi.fn(() => {
        throw new Error('shadow-scene initialization failed');
      }),
    };
  }));
  const disposeGeometry = vi.spyOn(THREE.PlaneGeometry.prototype, 'dispose');
  const disposeMaterial = vi.spyOn(THREE.ShadowMaterial.prototype, 'dispose');

  expect(() => createFlowLayer3DScene({
    beam: {
      beamColor: '#449c40',
      beamHighlightColor: '#c9ebc7',
      beamWidth: 1,
      enabled: false,
      glowIntensity: 1,
      trailLength: 0.38,
    },
    beamSource: { slots: 0, next: () => null },
    canvas: document.createElement('canvas'),
    connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
    container: document.createElement('div'),
    cssLayer: document.createElement('div'),
    paths: [],
  })).toThrow('shadow-scene initialization failed');

  expect(disposeGeometry).toHaveBeenCalledOnce();
  expect(disposeMaterial).toHaveBeenCalledOnce();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts
```

Expected: FAIL because `renderer.shadowMap.enabled` remains `false`, the scene has no directional shadow light or receiving `ShadowMaterial` plane, and initialization failure creates no disposable shadow resources.

- [ ] **Step 3: Configure the renderer for soft shadow maps**

In `createRenderer`, after pixel-ratio setup and before returning the renderer, add:

```ts
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
```

Keep the clear color and sRGB output configuration unchanged.

- [ ] **Step 4: Add the shared directional light and transparent shadow catcher**

Immediately after the top-down camera setup in `createFlowLayer3DScene`, create the shadow resources once:

```ts
const shadowLight = new THREE.DirectionalLight(0xffffff, 1);
shadowLight.position.set(-6, 14, -5);
shadowLight.castShadow = true;
shadowLight.shadow.mapSize.set(1024, 1024);
shadowLight.shadow.camera.left = -14;
shadowLight.shadow.camera.right = 14;
shadowLight.shadow.camera.top = 14;
shadowLight.shadow.camera.bottom = -14;
shadowLight.shadow.bias = -0.0003;
shadowLight.shadow.normalBias = 0.025;
shadowLight.shadow.radius = 8;
shadowLight.shadow.blurSamples = 16;

const shadowCatcherGeometry = new THREE.PlaneGeometry(80, 80);
const shadowCatcherMaterial = new THREE.ShadowMaterial({
  color: 0x000000,
  opacity: 0.5,
  transparent: true,
  depthWrite: false,
  toneMapped: false,
});
const shadowCatcher = new THREE.Mesh(shadowCatcherGeometry, shadowCatcherMaterial);
shadowCatcher.rotation.x = -Math.PI / 2;
shadowCatcher.position.y = 0.12;
shadowCatcher.receiveShadow = true;
shadowCatcher.renderOrder = -90;
scene.add(shadowLight, shadowLight.target, shadowCatcher);
```

The negative X/Z light position is intentional: with the existing top-down camera and `camera.up = (0, 0, -1)`, it projects the shadow toward the lower-right of the screen. The catcher remains below the lowest tier's body bottom (`0.29` world units).

- [ ] **Step 5: Dispose the new scene resources**

Inside `destroy`, before the CSS renderer and WebGL renderer are disposed, add:

```ts
scene.remove(shadowLight, shadowLight.target, shadowCatcher);
shadowCatcherGeometry.dispose();
shadowCatcherMaterial.dispose();
```

Keep this inside the existing idempotent `destroyed` guard so normal teardown and guarded initialization failures share the same cleanup.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run:

```bash
/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts
```

Expected: all tests in `createFlowLayer3DScene.test.ts` pass, including the new shadow-map, direction, receiver, and disposal assertions.

- [ ] **Step 7: Run all automated verification**

Run these independently and require exit code `0` from each:

```bash
/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run
/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/eslint/bin/eslint.js .
/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/typescript/bin/tsc --noEmit
git diff --check
```

Expected: all tests pass, lint and TypeScript produce no errors, and `git diff --check` produces no output.

- [ ] **Step 8: Verify both live flow illustrations visually**

Open `http://127.0.0.1:3001/#pillars` in the existing local app preview and inspect both flow canvases:

- Vertical: inactive and glowing square/rectangular nodes show a soft lower-right shadow that stays beneath the body and is not clipped by the illustration bounds.
- Horizontal: terminal, relay, collector, and hexagonal nodes use the same shadow direction and softness.
- Connectors, moving beams, node glows, icons, progress bars, and arrival bursts remain unshadowed.
- The browser console contains no new errors.

If either flow fails one of these exact checks, adjust only `shadowLight.position`, `shadowLight.shadow.radius`, `shadowLight.shadow.blurSamples`, `shadowCatcher.position.y`, or `shadowCatcherMaterial.opacity`; update the regression assertions when their behavioral direction or bounds change, then repeat Steps 6-8.

- [ ] **Step 9: Commit only the shadow implementation**

Review the staged paths before committing:

```bash
git add src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts
git diff --cached --check
git diff --cached --stat
git commit -m "feat: add flat 3d shadows to flow nodes"
```

Expected: the commit contains only the shared scene and its test. The three pre-existing horizontal-width files remain modified and unstaged.
