# Workflow Runtime Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every workflow illustration reusable and lifecycle-aware while eliminating initial offscreen WebGL, CSS3D, burst, layout, and compositing work on the homepage.

**Architecture:** Shared workflow-runtime primitives expose optional loading, activity, preload, and resolution policies to every illustration. Both Three.js scene controllers consume one pause-aware frame scheduler, React shells dynamically import their scene modules after lifecycle initialization, and homepage integration supplies only preset policy and one shared scroll driver.

**Tech Stack:** Next.js 16.3.2, React 19.2.8, TypeScript, Three.js 0.185.1, Vitest, Testing Library, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-08-29-workflow-runtime-performance-design.md`

## Global Constraints

- Preserve `BusinessFlow3D`, `BusinessFlowVertical`, `BusinessFlowHorizontal`, `FlowLayer3D`, and all renderer-independent route/node factories as generic reusable components.
- Keep existing imports source-compatible; all runtime props are optional.
- Homepage hero uses eager initialization; lower workflows use `near-viewport` with `600px 0px` preload margin.
- Preserve loaders, semantic descriptions, WebGL fallbacks, reduced-motion behavior, flow topology, copy, typography, colors, and layout identity.
- Do not add React Three Fiber or any new rendering dependency.
- Use failing regression tests before each production change.
- Follow the installed Next.js documentation in `node_modules/next/dist/docs/` before changing client boundaries or dynamic imports.

---

### Task 1: Shared workflow lifecycle hook

**Files:**
- Create: `src/components/elements/workflow-runtime/types.ts`
- Create: `src/components/elements/workflow-runtime/useWorkflowRuntime.ts`
- Create: `src/components/elements/workflow-runtime/useWorkflowRuntime.test.tsx`
- Create: `src/components/elements/workflow-runtime/index.ts`

**Interfaces:**
- Produces `WorkflowLoadStrategy`, `WorkflowActivityStrategy`, and `WorkflowRuntimeOptions` exactly as specified in the design.
- Produces `WorkflowRuntimeState = { active: boolean; shouldInitialize: boolean }`.
- Produces `useWorkflowRuntime(ref, options): WorkflowRuntimeState`.
- `shouldInitialize` is monotonic; `active` follows real viewport visibility, document visibility, and `activityStrategy` after initialization.

- [ ] **Step 1: Write lifecycle regression tests**

Create a controllable IntersectionObserver test double and assert:

```tsx
const { result } = renderHook(() => useWorkflowRuntime(ref, {
  loadStrategy: 'near-viewport',
  activityStrategy: 'visible',
  preloadMargin: '600px 0px',
}));

expect(result.current).toEqual({ active: false, shouldInitialize: false });
act(() => preloadObserver.emit(true));
expect(result.current.shouldInitialize).toBe(true);
act(() => viewportObserver.emit(true));
expect(result.current.active).toBe(true);
act(() => viewportObserver.emit(false));
expect(result.current).toEqual({ active: false, shouldInitialize: true });
```

Also cover eager initialization, `activityStrategy: 'always'`, document hidden/visible changes, observer cleanup, and no-IntersectionObserver fallback.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/components/elements/workflow-runtime/useWorkflowRuntime.test.tsx`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the public types and hook**

Use defaults:

```ts
const defaults = {
  activityStrategy: 'visible',
  loadStrategy: 'eager',
  preloadMargin: '600px 0px',
  resolutionScale: 'display',
} as const;
```

Use separate preload and viewport observers so preload margin never implies active rendering. Keep `shouldInitialize` true after first entry. Listen to `visibilitychange` only after initialization, and return an immediately active runtime when browser observer APIs are unavailable.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- src/components/elements/workflow-runtime/useWorkflowRuntime.test.tsx`

Expected: all lifecycle tests pass.

- [ ] **Step 5: Commit the shared lifecycle**

```bash
git add src/components/elements/workflow-runtime
git commit -m "feat: add reusable workflow lifecycle"
```

### Task 2: Pause-aware frame loop and display resolution

**Files:**
- Create: `src/components/elements/workflow-runtime/createActiveFrameLoop.ts`
- Create: `src/components/elements/workflow-runtime/createActiveFrameLoop.test.ts`
- Create: `src/components/elements/workflow-runtime/resolveWorkflowRenderScale.ts`
- Create: `src/components/elements/workflow-runtime/resolveWorkflowRenderScale.test.ts`
- Modify: `src/components/elements/workflow-runtime/index.ts`

**Interfaces:**
- Produces `createActiveFrameLoop(frame): { destroy(): void; setActive(active: boolean): void }`.
- The callback signature is `(frame: { deltaMs: number; elapsedMs: number; timestamp: number }) => void`.
- Produces `resolveWorkflowRenderScale(element, resolutionScale): number` clamped to `[0.5, 1]`.

- [ ] **Step 1: Write frame-loop and scale regression tests**

Assert that pausing cancels the pending frame, resuming preserves accumulated active time, repeated state writes are idempotent, destroy prevents rescheduling, and a transformed element with `clientWidth=1920` and `getBoundingClientRect().width=1344` resolves to `0.7`.

```ts
loop.setActive(true);
runFrame(1000);
runFrame(1016);
loop.setActive(false);
loop.setActive(true);
runFrame(5016);
expect(frame).toHaveBeenLastCalledWith(expect.objectContaining({
  deltaMs: 0,
  elapsedMs: 16,
}));
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/elements/workflow-runtime/createActiveFrameLoop.test.ts src/components/elements/workflow-runtime/resolveWorkflowRenderScale.test.ts`

Expected: FAIL because both modules do not exist.

- [ ] **Step 3: Implement scheduler and scale resolver**

The scheduler owns one request id, a destroyed flag, an active flag, last active timestamp, and accumulated elapsed time. The display resolver uses the smaller positive transformed/layout dimension ratio, ignores rotation-expanded ratios above one, and returns a numeric prop directly after clamping.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- src/components/elements/workflow-runtime/createActiveFrameLoop.test.ts src/components/elements/workflow-runtime/resolveWorkflowRenderScale.test.ts`

Expected: all scheduler and scale tests pass.

- [ ] **Step 5: Commit runtime scheduling utilities**

```bash
git add src/components/elements/workflow-runtime
git commit -m "feat: add pausable workflow frame loop"
```

### Task 3: Make `FlowLayer3D` deferred and pausable

**Files:**
- Modify: `src/components/elements/FlowLayer3D/types.ts`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.tsx`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.module.css`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts`

**Interfaces:**
- `FlowLayer3DProps` extends `WorkflowRuntimeOptions`.
- `FlowLayer3DProps` adds `onActivityChange?: (active: boolean) => void` so composite reusable illustrations can synchronize non-WebGL decoration without creating a second observer.
- `FlowLayer3DSceneController` becomes `{ destroy(): void; setActive(active: boolean): void }`.
- `createFlowLayer3DScene` receives `active?: boolean` and `resolutionScale?: 'display' | number`.

- [ ] **Step 1: Write component lifecycle tests**

Mock the dynamic scene import behind a small exported loader function and assert no controller construction before preload entry, one construction after entry, `setActive(false/true)` on viewport changes, no reconstruction on re-entry, and destruction of a controller whose import resolves after unmount.

```tsx
render(<FlowLayer3D {...props} loadStrategy="near-viewport" />);
expect(createFlowLayer3DScene).not.toHaveBeenCalled();
preloadObserver.emit(true);
await waitFor(() => expect(createFlowLayer3DScene).toHaveBeenCalledTimes(1));
viewportObserver.emit(false);
expect(controller.setActive).toHaveBeenLastCalledWith(false);
```

- [ ] **Step 2: Write scene scheduling and shadow tests**

Assert `setActive` delegates to the shared loop, `renderer.render` and `cssRenderer.render` stop while inactive, `shadowMap.autoUpdate` becomes false after the first render, and resize sets `shadowMap.needsUpdate` for one subsequent active frame.

- [ ] **Step 3: Run focused tests and verify RED**

Run: `npm test -- src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts`

Expected: lifecycle/controller assertions fail against the unconditional scene construction and frame loop.

- [ ] **Step 4: Implement deferred component initialization**

Call `useWorkflowRuntime`, keep the sized root and fallback shell mounted, report activity transitions through `onActivityChange`, dynamically import `createFlowLayer3DScene` only when `shouldInitialize` is true, guard async completion with an effect generation token, and propagate `active` to the controller.

- [ ] **Step 5: Replace the scene animation recursion**

Drive beam stepping and both renderers from `createActiveFrameLoop`. Use active elapsed time for beam scheduling, call `onArrival` only from active frames, compute WebGL backing dimensions with `resolveWorkflowRenderScale`, keep CSS3D at layout dimensions, and make shadows single-update.

- [ ] **Step 6: Add containment without hiding fallbacks**

Add `contain: layout paint style`, `isolation: isolate`, and bounded overflow to the generic root. Do not add homepage selectors or fixed dimensions.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `npm test -- src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx src/components/elements/FlowLayer3D/createFlowLayer3DScene.test.ts`

Expected: all FlowLayer lifecycle and scene tests pass.

- [ ] **Step 8: Commit FlowLayer lifecycle integration**

```bash
git add src/components/elements/FlowLayer3D
git commit -m "feat: defer and pause shared flow scenes"
```

### Task 4: Make `BusinessFlow3D` deferred, pausable, and scroll-driver aware

**Files:**
- Create: `src/components/motion/ScrollMotionContext.tsx`
- Create: `src/components/motion/ScrollMotionContext.test.tsx`
- Modify: `src/components/site/HeroScrollEffects.tsx`
- Modify: `src/components/site/HeroScrollEffects.test.tsx`
- Modify: `src/features/business-flow-3d/types.ts`
- Modify: `src/features/business-flow-3d/components/BusinessFlow3D.tsx`
- Modify: `src/features/business-flow-3d/components/BusinessFlow3D.test.tsx`
- Modify: `src/features/business-flow-3d/scene/createSignalFlowScene.ts`
- Modify: `src/features/business-flow-3d/scene/createSignalFlowScene.test.ts`

**Interfaces:**
- `BusinessFlow3DProps` extends `WorkflowRuntimeOptions`.
- `SignalFlowSceneController` gains `setActive(active: boolean)`.
- `ScrollMotionProvider` publishes `subscribe(listener): () => void` without causing React renders on scroll.
- `BusinessFlow3D` uses the provider when present and retains its standalone window-scroll fallback.

- [ ] **Step 1: Write shared-scroll and batched-layout tests**

Assert one provider scroll listener, subscriber delivery from the same requestAnimationFrame, every `getBoundingClientRect` read occurring before any style write, and subscriber cleanup.

- [ ] **Step 2: Write BusinessFlow3D lifecycle tests**

Mirror Task 3's deferred import, late cleanup, pause/resume, and no-reconstruction assertions. Add an assertion that a context-provided scroll driver prevents registration of the component's local window scroll listener and removes `will-change` after damping settles.

- [ ] **Step 3: Write hero-scene scheduler and render-resolution tests**

Assert the shared frame loop drives beam time, paused wall-clock duration does not advance routes, display scale reduces the renderer backing size while camera/CSS3D sizes remain layout-sized, and static shadow invalidation occurs only after initialization and resize.

- [ ] **Step 4: Run focused tests and verify RED**

Run: `npm test -- src/components/motion/ScrollMotionContext.test.tsx src/components/site/HeroScrollEffects.test.tsx src/features/business-flow-3d/components/BusinessFlow3D.test.tsx src/features/business-flow-3d/scene/createSignalFlowScene.test.ts`

Expected: provider and lifecycle behavior are absent and tests fail.

- [ ] **Step 5: Implement provider and batched parallax updates**

Wrap the `<main>` returned by `HeroScrollEffects` in `ScrollMotionProvider`. In one frame, collect rectangle-derived values first, then write the main progress and group properties, then notify subscribers.

- [ ] **Step 6: Integrate BusinessFlow3D runtime and scheduler**

Use `useWorkflowRuntime`, dynamic scene import, guarded async cleanup, context subscription with standalone fallback, active-only `will-change`, shared active frame time, display-matched WebGL sizing, and single-update shadows.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run the Task 4 focused command and expect all tests to pass.

- [ ] **Step 8: Commit hero runtime and scroll consolidation**

```bash
git add src/components/motion src/components/site/HeroScrollEffects* src/features/business-flow-3d
git commit -m "feat: pause hero flow and share scroll motion"
```

### Task 5: Share lightweight arrival bursts

**Files:**
- Create: `src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.tsx`
- Create: `src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.module.css`
- Create: `src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.test.tsx`
- Create: `src/components/elements/WorkflowArrivalBursts/index.ts`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.module.css`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.tsx`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.module.css`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`

**Interfaces:**
- Produces `WorkflowArrivalBursts` with `active`, colors, timing, radius, strength, and arrival-event input.
- Horizontal and vertical components forward their runtime props to `FlowLayer3D` and consume `onActivityChange` to suppress and clear bursts without installing duplicate observers.

- [ ] **Step 1: Write burst lifecycle and CSS contract tests**

Assert arrivals add a burst only while active, changing active to false clears records synchronously, reduced motion renders no bursts, and the shared stylesheet contains no `drop-shadow` or `mix-blend-mode`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.test.tsx src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`

Expected: shared component is absent and existing feature bursts remain active offscreen.

- [ ] **Step 3: Implement the shared burst primitive**

Render one static ambient gradient layer and transform/opacity-only burst cores. Keep record keys deterministic, remove records on animation end, clear them when inactive, and avoid state writes for inactive arrivals.

- [ ] **Step 4: Migrate horizontal and vertical features**

Delete duplicated burst state and glow CSS. Use the shared primitive and forward all four runtime options to `FlowLayer3D`. Preserve existing sizing variables, labels, semantic lists, and feature props.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the Task 5 focused command and expect all tests to pass.

- [ ] **Step 6: Commit shared bursts**

```bash
git add src/components/elements/WorkflowArrivalBursts src/features/business-flow-horizontal src/features/business-flow-vertical
git commit -m "perf: stop offscreen workflow burst effects"
```

### Task 6: Homepage policy and compositing optimizations

**Files:**
- Modify: `src/features/business-flow-3d/presets.ts`
- Modify: `src/features/business-flow-horizontal/presets.ts`
- Modify: `src/features/business-flow-vertical/presets.ts`
- Modify: `src/features/homepage-illustration-presets.contract.test.ts`
- Modify: `src/components/site/HeroScrollEffects.tsx`
- Modify: `src/components/site/HeroScrollEffects.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/marketing.module.css`
- Modify: `src/app/globals.css`

**Interfaces:**
- Hero preset: `loadStrategy: 'eager'`, `activityStrategy: 'visible'`, `resolutionScale: 'display'`.
- Lower presets: `loadStrategy: 'near-viewport'`, `activityStrategy: 'visible'`, `preloadMargin: '600px 0px'`.
- Hero readiness is scoped to `[data-hero-workflow] [data-flow-state]`.

- [ ] **Step 1: Write homepage policy and stable-layout tests**

Assert exact preset policies, hero readiness ignoring a loading lower workflow, and the marketing stylesheet no longer declaring a progress-driven `margin-bottom` or pillars-section transform.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/features/homepage-illustration-presets.contract.test.ts src/components/site/HeroScrollEffects.test.tsx`

Expected: policy and readiness-scope assertions fail.

- [ ] **Step 3: Apply homepage policies and readiness scope**

Add `data-hero-workflow` to the hero visual wrapper, scope the readiness observer to that wrapper's flow-state element, and apply runtime props through the reusable presets rather than page conditionals.

- [ ] **Step 4: Apply layout and compositing CSS changes**

Remove the pillars margin/transform scroll effect and permanent `will-change`. Add mobile transform/opacity-only reveal rules, section `content-visibility` with intrinsic sizes where safe, and narrow/reduced-transparency header fallback without changing desktop visual identity.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the Task 6 focused command and expect all tests to pass.

- [ ] **Step 6: Commit homepage integration**

```bash
git add src/app src/components/site/HeroScrollEffects* src/features/*/presets.ts src/features/homepage-illustration-presets.contract.test.ts
git commit -m "perf: defer below-fold homepage workflows"
```

### Task 7: Full verification and measured browser acceptance

**Files:**
- Modify only if verification exposes a regression in files already listed above.

**Interfaces:**
- Consumes every acceptance criterion in the design spec.
- Produces fresh automated and browser evidence suitable for completion review.

- [ ] **Step 1: Run all automated checks**

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run build-storybook
```

Expected: every command exits 0 with no test failures, TypeScript errors, ESLint errors, build failures, or Storybook build failures.

- [ ] **Step 2: Inspect initial desktop runtime**

At 1280 by 720, confirm exactly one canvas at the top of the page, hero backing buffer at or below 2.3 MP, zero lower-flow burst nodes, stable hero/pillars spacing, and no console errors.

- [ ] **Step 3: Inspect deferred entry and pause**

Scroll each lower workflow into the 600px preload zone and then into the viewport. Confirm each creates one canvas once, shows its loader only while initializing, animates while visible, pauses offscreen, and resumes without rerouting or timing jumps.

- [ ] **Step 4: Inspect mobile and reduced motion**

At 390 by 844, confirm deferred loading, readable copy, unchanged section composition, no clip-path reveal paint, static reduced-motion flows, and header transparency fallback.

- [ ] **Step 5: Review the final diff against the spec**

Check source compatibility, generic ownership, cleanup, no homepage selectors in shared runtime files, and every acceptance criterion. Run `git diff --check` and `git status --short`.

- [ ] **Step 6: Request code review**

Provide the reviewer with the design spec, this plan, base SHA `18d0d48^`, final HEAD SHA, and the automated/browser evidence. Resolve all Critical and Important findings before completion.
