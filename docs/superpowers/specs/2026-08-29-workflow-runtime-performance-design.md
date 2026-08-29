# Reusable Workflow Runtime Performance Design

## Summary

The three homepage workflow illustrations will keep their existing visual compositions and reusable public component boundaries while moving lifecycle, visibility, frame scheduling, render resolution, and quality behavior into shared workflow-runtime primitives. The hero workflow initializes eagerly. Below-fold workflows keep their layout and lightweight semantic/loading shells in the document, but their Three.js scene modules and GPU resources initialize only when they approach the viewport. Once initialized, any workflow pauses WebGL, CSS3D, beam simulation, arrival bursts, and dynamic style work whenever it is offscreen or the document is hidden.

This is a runtime and integration refactor, not a redesign. `BusinessFlow3D`, `BusinessFlowVertical`, `BusinessFlowHorizontal`, `FlowLayer3D`, and their renderer-independent route/node factories remain generic and reusable outside the homepage.

## Baseline

The local production build was inspected at a 1280 by 720 viewport with device pixel ratio 2.

- Three WebGL canvases initialized at page load even though only the hero was visible.
- Their backing buffers totaled 5.46 megapixels; the hero canvas alone was 4.29 megapixels.
- Both below-fold workflows continued rendering while offscreen.
- A three-second top-of-page sample contained between four and eleven active offscreen arrival-burst elements.
- The three workflow roots contained 631 of the page's 836 DOM descendants.
- Homepage JavaScript totaled approximately 1.30 MB raw and 366 KB gzip; the Three.js-containing chunk was approximately 728 KB raw and 190 KB gzip.
- The pillars transition changed `margin-bottom` on every scroll frame, forcing layout in addition to compositing.

These measurements define the acceptance targets in this design.

## Goals

- Initialize below-fold workflow scenes only when they enter a configurable near-viewport preload zone.
- Pause initialized scenes without destroying their state when they leave the active viewport or the document becomes hidden.
- Preserve lightweight loading, fallback, accessible description, and layout shells before scene initialization.
- Make lifecycle and quality controls reusable component props rather than homepage-specific branches.
- Eliminate offscreen arrival-burst React updates and filtered animations.
- Eliminate layout-affecting scroll animation.
- Render each canvas at the resolution it is actually displayed after CSS scaling.
- Render static shadows once and explicitly invalidate them after a resize or scene rebuild.
- Batch scroll reads before writes and share one homepage scroll driver with the hero workflow.
- Defer scene-controller code until an illustration is scheduled to initialize.
- Preserve the current appearance at normal desktop and mobile breakpoints, including loaders, flow timing, node styling, copy reveals, and reduced-motion fallbacks.

## Non-goals

- Do not replace the workflow illustrations with static images.
- Do not remove nodes, connectors, beams, progress indicators, semantic descriptions, loaders, or WebGL fallbacks.
- Do not make shared workflow components depend on homepage section names, marketing copy, or CSS module selectors.
- Do not add a user-facing performance settings control.
- Do not migrate the scenes to React Three Fiber or introduce another rendering dependency.
- Do not redesign flow topology, typography, colors, or marketing layout.

## Public Runtime Contract

Add renderer-agnostic workflow lifecycle types under the shared workflow element layer.

```ts
export type WorkflowLoadStrategy = 'eager' | 'near-viewport';
export type WorkflowActivityStrategy = 'always' | 'visible';

export type WorkflowRuntimeOptions = {
  activityStrategy?: WorkflowActivityStrategy;
  loadStrategy?: WorkflowLoadStrategy;
  preloadMargin?: string;
  resolutionScale?: 'display' | number;
};
```

The three reusable feature components and `FlowLayer3D` accept these optional controls. Defaults remain safe for standalone reuse:

- `loadStrategy`: `eager`, so an existing consumer does not unexpectedly defer rendering;
- `activityStrategy`: `visible`, so an initialized illustration does not waste resources offscreen;
- `preloadMargin`: `600px 0px`, used only by `near-viewport`;
- `resolutionScale`: `display`, which matches the renderer backing size to the element's post-transform display scale while keeping camera and CSS3D layout based on the untransformed container size.

Homepage presets explicitly select eager loading for the hero and near-viewport loading for the two lower illustrations. Storybook stories can use eager loading for deterministic previews. Consumers may choose `always` when an offscreen animation is intentionally required.

## Shared Visibility Lifecycle

Create a reusable client hook that returns two monotonic states:

- `shouldInitialize`: false until an eager component mounts or a deferred component first intersects the preload zone; once true it never returns to false;
- `active`: true only while initialization has occurred, the illustration intersects the real viewport, the document is visible, and the selected activity strategy permits animation.

The hook owns one `IntersectionObserver` for the preload zone and one for actual visibility. It listens to `visibilitychange`, handles browsers without IntersectionObserver by initializing and activating immediately, and removes all observers and listeners during cleanup.

Near-viewport loading does not remove the component shell. The root retains its configured dimensions, label, semantic content, fallback state, and subtle loading overlay. Only the scene module import, renderer, CSS3D tree, and GPU allocation are deferred.

## Shared Frame Scheduler

Add a small renderer-independent frame scheduler used by both scene controllers. It owns `requestAnimationFrame`, active elapsed time, and pause/resume behavior.

- `setActive(false)` cancels the pending frame and freezes active elapsed time.
- `setActive(true)` resumes from the frozen timeline without treating the paused wall-clock duration as animation time.
- Starting an already-active scheduler and pausing an already-paused scheduler are no-ops.
- Destroying the scheduler permanently cancels work.
- The frame callback receives stable active `elapsedMs` and `deltaMs` values.

Both scene-controller interfaces gain `setActive(active: boolean)`. Scene construction does not own an unconditional recursive frame loop. React components update controller activity from the shared lifecycle hook. This keeps route generation, node construction, and illustration-specific visuals independent from browser visibility policy.

## Deferred Scene Initialization

`BusinessFlow3D` and `FlowLayer3D` dynamically import their scene-controller modules only after `shouldInitialize` becomes true. The async effect must guard against resolution after unmount or prop replacement. A late scene is destroyed immediately rather than attached to a stale component.

The component state distinguishes `deferred`, `loading`, `ready`, and `error`, while the existing public fallback behavior remains intact. The loading overlay becomes active only once the preload boundary is crossed, avoiding invisible animation work far below the fold.

Homepage hero-copy readiness will inspect only the workflow inside the hero visual wrapper. Lower workflows no longer block the hero reveal. The broad readiness MutationObserver will observe the hero workflow root's `data-flow-state` attribute only; it will not observe child-list changes throughout the page.

## Rendering Quality

### Display-matched render targets

Scene resize logic keeps camera aspect and CSS3D sizing based on `clientWidth` and `clientHeight`. WebGL backing size is multiplied by a resolved render scale:

- a numeric `resolutionScale` is clamped to a safe range;
- `display` compares the element's transformed bounding rectangle with its layout dimensions and uses the visible scale, capped at 1.

This lets the homepage hero keep its existing oversized, shifted composition and 0.7 CSS scale while avoiding a render target sized for the unscaled 1920-pixel-wide layout box. At the measured desktop viewport, the hero target should fall from 4.29 MP to no more than 2.3 MP without reframing the scene.

### Static shadows

All workflow scenes keep their existing shape-aware shadows. Shadow maps render once after scene creation. `shadowMap.autoUpdate` is disabled afterward. Resize, node rebuild, or an explicit structural scene change marks the shadow map dirty for the next active render. Beam, packet, icon-opacity, progress, and hover updates do not invalidate shadows.

### CSS3D work

CSS3D renders only while a scene is active. Shared workflow roots gain paint/layout/style containment and isolation so their transformed descendants and glows do not expand page-wide paint or style invalidation. The DOM icon and progress representation remains unchanged for accessibility and visual fidelity.

## Arrival Bursts

Arrival callbacks are not emitted while a scene is inactive. Existing burst state is cleared when a workflow becomes inactive so no filtered animation continues offscreen.

Visible bursts retain their timing and node alignment but use a reusable ambient layer:

- one static radial ambient glow belongs to the illustration root;
- burst instances animate a small core with transform and opacity only;
- moving burst elements do not use `drop-shadow`, animated blur, or `mix-blend-mode`;
- the static ambient layer may use a bounded, non-animated blur or gradient;
- reduced-motion continues to suppress bursts.

Horizontal and vertical features share the same burst primitive and lifecycle behavior rather than duplicating CSS and state machinery.

## Scroll Architecture

`HeroScrollEffects` becomes the homepage scroll-motion provider. It owns the single passive scroll listener and a single requestAnimationFrame callback.

Within each frame it:

1. reads scroll progress and every parallax bounding rectangle;
2. computes all visibility and shift values;
3. writes CSS custom properties in a separate pass;
4. notifies subscribed scroll-motion consumers with the same progress and timestamp.

`BusinessFlow3D` subscribes to this provider when present and keeps a local fallback driver when reused outside it. Its damped camera/tilt transform remains generic, but it no longer adds a second homepage scroll listener. `will-change` is set only while damping is active and removed when the displayed progress settles.

The pillars section stops changing `margin-bottom` and stops translating the whole section. The hero copy and hero workflow retain their scroll motion; downstream document layout remains stable throughout scrolling. This deliberately removes the collapsing-section effect because preserving it requires moving downstream layout.

## Loading and Bundle Behavior

- Scene-controller modules are dynamic imports triggered by `shouldInitialize`.
- Feature components, semantic shells, dimensions, and fallback markup remain reusable and independently importable.
- The hero scene still loads immediately because it is above the fold.
- Lower scene setup, node SVG fetching, CSS3D creation, connector/beam creation, shadow allocation, and animation code wait for the preload boundary.
- No homepage-only global registry is added.

## CSS and Compositing

- Remove permanent `will-change` declarations from the hero copy and pillars section.
- Keep motion on transform and opacity; mobile text reveals omit clip-path painting while retaining the cascade.
- On narrow viewports and `prefers-reduced-transparency: reduce`, replace the fixed header's backdrop blur with a more opaque background.
- Give below-fold marketing sections `content-visibility: auto` with representative intrinsic sizes where it does not interfere with IntersectionObserver preload behavior.
- Workflow roots use containment and bounded overflow for glow effects.

## Error Handling and Fallbacks

- WebGL construction failures continue to show the existing DOM fallback without throwing through the page.
- Dynamic import rejection uses the same error state and development diagnostic path as construction failure.
- Browsers without IntersectionObserver initialize immediately.
- Browsers without Page Visibility support behave as visible.
- Reduced-motion users receive static connectors/nodes and simplified opacity reveals.
- A paused scene can be resized; the resize marks it dirty and the first resumed frame renders the correct dimensions.

## Testing Strategy

Development follows test-driven development. Each behavior receives a failing regression test before production changes.

Unit tests cover:

- eager and near-viewport initialization;
- monotonic `shouldInitialize` and reversible `active` state;
- document visibility and IntersectionObserver fallbacks;
- frame scheduler pause, resume, active elapsed time, idempotency, and destroy;
- display-scale resolution calculation;
- static shadow invalidation after first render and resize;
- controller `setActive` behavior for both scene implementations;
- scroll read/write batching and shared subscriber notification.

Component tests cover:

- no scene import or controller construction before a deferred workflow enters the preload zone;
- one construction after entry and no reconstruction during later visibility changes;
- controller pause/resume propagation;
- late async import cleanup after unmount;
- no arrival-burst insertion while inactive and clearing existing bursts on pause;
- hero readiness ignoring lower workflow state;
- semantic shell, dimensions, loader, error fallback, and reduced-motion behavior while deferred.

Integration and visual verification cover:

- desktop and mobile homepage screenshots before and after each lower workflow enters its preload zone;
- stable section geometry across scroll progress;
- no console errors or WebGL context warnings;
- no active lower-workflow burst elements at the top of the page;
- one initialized canvas at initial desktop load and additional canvases only near their sections;
- preserved node, connector, beam, progress, shadow, and loading appearance.

Final verification runs focused regression tests, the complete unit suite, TypeScript, ESLint, the Next.js production build, Storybook production build, and bounded browser inspection at desktop and mobile viewports.

## Acceptance Criteria

- At the measured initial desktop viewport, only the hero workflow owns a WebGL canvas.
- The initial hero backing buffer is no larger than 2.3 MP while preserving its current framing.
- No horizontal or vertical arrival-burst elements exist while both illustrations are outside the real viewport.
- Below-fold scenes initialize once within 600px of the viewport and pause after leaving it.
- Hiding the document pauses every initialized workflow.
- Resuming a workflow continues its animation timeline without a wall-clock jump.
- Scrolling does not change computed margins or document-flow geometry for the pillars section.
- Homepage scrolling uses one primary scroll listener/frame driver for text and hero workflow progress.
- Static workflow shadows do not update on every animation frame and remain visually present after resize.
- Moving burst elements contain no `drop-shadow`, animated blur, or `mix-blend-mode` declarations.
- Existing workflow component imports remain source-compatible; new runtime props are optional.
- Storybook can force eager/always behavior for deterministic isolated previews.
- Reduced-motion, WebGL failure, and no-IntersectionObserver fallbacks remain functional.
- Unit tests, typecheck, lint, Next.js build, and Storybook build pass.
