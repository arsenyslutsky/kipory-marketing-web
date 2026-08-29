# Horizontal Beam Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the homepage horizontal flow the complete beam motion and arrival-burst effect configured for the vertical “Our Pillars” flow.

**Architecture:** Extend the horizontal route source to accept a typed options object and produce a bounded number of slots that rotate through the fixed route catalog. Move burst rendering from CSS schedules to React state fed by `FlowLayer3D` arrival events, matching the vertical component's event-driven lifecycle and visual variables.

**Tech Stack:** Next.js 16 client components, React 19, TypeScript, CSS Modules, Storybook 10, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-28-horizontal-beam-parity-design.md`

## Global Constraints

- Preserve all twelve existing horizontal connector paths and their fading flags.
- Use the exact current vertical homepage values for the horizontal homepage preset.
- Rotate bounded beam slots across every horizontal route; no route may be permanently starved.
- Render bursts only from real arrival events, and clear them for disabled beams, reduced motion, or source changes.
- Preserve component defaults for callers that do not use the homepage preset.

---

### Task 1: Horizontal Beam Source

**Files:**
- Modify: `src/features/business-flow-horizontal/routes.test.ts`
- Modify: `src/features/business-flow-horizontal/routes.ts`

**Interfaces:**
- Consumes: the existing twelve-route `businessFlowHorizontalPaths` catalog.
- Produces: `HorizontalBeamSourceOptions` and `createBusinessFlowHorizontalBeamSource(options): FlowLayer3DBeamSource`.

- [ ] **Step 1: Write failing tests for the new options contract**

Add a `createSource` test helper with literal defaults and tests proving that five slots rotate through all twelve route IDs, deterministic delays remain staggered, injected randomness controls later delays, zero speed clamps to `0.1`, invalid slots return `null`, arrivals occur at route endpoints, and a `32px` trail converts to route-relative progress.

- [ ] **Step 2: Run the route suite and verify RED**

Run: `npm test -- src/features/business-flow-horizontal/routes.test.ts`

Expected: FAIL because the production function still accepts a number and always creates twelve fixed slots.

- [ ] **Step 3: Implement the minimal source behavior**

Add this public options shape:

```ts
export type HorizontalBeamSourceOptions = {
  emissionRandomness: number;
  maxConcurrentBeams: number;
  random?: () => number;
  speed: number;
  trailLengthInIllustrationUnits?: number;
};
```

Resolve slot count with `Math.min(routes.length, Math.max(0, Math.floor(maxConcurrentBeams)))`, select routes with `(slot + generation * slots) % routes.length`, use the vertical flow's bounded emission-delay formula, retain existing short/long duration ratios, and calculate trail progress from raw `320 × 608` illustration-space route length.

- [ ] **Step 4: Run the route suite and verify GREEN**

Run: `npm test -- src/features/business-flow-horizontal/routes.test.ts`

Expected: PASS.

### Task 2: Horizontal Component Beam and Burst Contract

**Files:**
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.module.css`

**Interfaces:**
- Consumes: `createBusinessFlowHorizontalBeamSource(HorizontalBeamSourceOptions)` from Task 1 and `FlowLayer3D`'s `onArrival` callback.
- Produces: new serializable horizontal props for beam emission, head glow, trail, concurrency, and burst visuals.

- [ ] **Step 1: Write failing component tests**

Expand the `FlowLayer3D` test boundary to expose the real component's received beam properties and trigger its `onArrival` callback. Add tests proving the homepage preset sends beam width `1.4`, blur `32`, opacity `0`, radius `0`, style trail `0`, and five slots; prove a real arrival renders a burst at literal `20% / 50%` with `25px`, `1700ms`, and `0.5` CSS variables; prove animation completion removes it; and prove disabling beams or enabling reduced motion clears it.

- [ ] **Step 2: Run the component suite and verify RED**

Run: `npm test -- src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`

Expected: FAIL because the horizontal component does not expose the props or pass `onArrival`.

- [ ] **Step 3: Implement props and event-driven burst state**

Add the nine missing props with vertical-compatible component defaults. Build the beam style with connector-derived width, head-glow values, and style trail `0`. Build the source from the Task 1 options. Port the vertical flow's burst-context, deduplication, cleanup, and normalized positioning logic, using one-shot CSS variables for color, highlight, radius, strength, fade time, and core fade time.

- [ ] **Step 4: Replace scheduled burst CSS**

Remove `--camera-flow-cycle`, `--camera-delay`, node-position helpers, fixed burst sizing, and infinite animations. Use the same one-shot keyframe percentages and strength controls as the vertical flow, retaining horizontal class names.

- [ ] **Step 5: Run the component suite and verify GREEN**

Run: `npm test -- src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`

Expected: PASS with no warnings.

### Task 3: Homepage Preset and Storybook Controls

**Files:**
- Modify: `src/features/business-flow-horizontal/presets.ts`
- Modify: `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx`

**Interfaces:**
- Consumes: the component props from Task 2.
- Produces: a homepage preset matching `businessFlowVerticalHomepageProps` and editable Storybook controls.

- [ ] **Step 1: Add the exact vertical homepage values to the horizontal preset**

Add `beamEmissionRandomness: 100`, `beamHeadGlowBlur: 32`, `beamHeadGlowOpacity: 0`, `beamHeadGlowRadius: 0`, `beamTrailLength: 0`, `burstFadeTime: 1700`, `burstRadius: 25`, `burstStrength: 0.5`, and `maxConcurrentBeams: 5`.

- [ ] **Step 2: Add Storybook controls**

Expose randomness, head glow, trail length, and concurrency under `Beams`; expose fade time, radius, and strength under `Arrival Bursts`. Use bounded range controls consistent with the vertical story.

- [ ] **Step 3: Run focused tests and typecheck**

Run: `npm test -- src/features/business-flow-horizontal/routes.test.ts src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx && npm run typecheck`

Expected: PASS.

### Task 4: Repository and Visual Verification

**Files:**
- Verify: all changed files above

**Interfaces:**
- Consumes: the completed horizontal beam effect.
- Produces: evidence that the implementation works in tests, production builds, Storybook, and the homepage.

- [ ] **Step 1: Run automated verification**

Run: `npm test && npm run typecheck && npm run lint && npm run build && npm run build-storybook`

Expected: every command exits zero. If `next build` rewrites `next-env.d.ts`, restore the development route imports before final status.

- [ ] **Step 2: Inspect Storybook**

Open `Animated Illustrations/BusinessFlowHorizontal → Current Next.js App`; verify five active slots, no beam trail, no visible head glow at opacity zero, and arrival bursts driven by the animated beam endpoints.

- [ ] **Step 3: Inspect the Next.js homepage**

Open `http://127.0.0.1:3001/`; verify the “Everything your team needs…” horizontal illustration matches the “Our Pillars” beam effect and retains fading auxiliary connectors.

- [ ] **Step 4: Review the final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors and only the intended plan, spec, horizontal flow, tests, preset, and story files are changed.
