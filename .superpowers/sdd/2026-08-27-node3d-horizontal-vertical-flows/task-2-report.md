# Task 2 Report: Renderer-Owned Node3D Gradient Textures

## Implementation summary

- Added a renderer-scoped gradient texture cache backed by one `WeakMap<WebGLRenderer, Map<string, CanvasTexture>>`.
- Added managed-texture tracking with one `WeakSet<Texture>` so renderer teardown can distinguish cache-owned textures from other material textures.
- Moved the Node3D face-gradient cache ownership out of `createNode3DObject` and into the cache module.
- Updated Node3D scene resource traversal to skip managed gradient textures, then dispose them exactly once immediately before `renderer.dispose()`.
- Exported the cache lifecycle API from the Node3D barrel.

## Files changed

- `src/components/elements/Node3D/node3DGradientTextureCache.ts` — new renderer-scoped cache and disposal API.
- `src/components/elements/Node3D/node3DGradientTextureCache.test.ts` — cache reuse, renderer isolation, ownership, and teardown test.
- `src/components/elements/Node3D/createNode3DObject.ts` — delegates face-gradient texture creation to the cache.
- `src/components/elements/Node3D/createNode3DScene.ts` — skips managed textures during material cleanup and tears down the renderer cache.
- `src/components/elements/Node3D/index.ts` — exports cache API.

## TDD RED

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test -- src/components/elements/Node3D/node3DGradientTextureCache.test.ts
```

Output:

```text
> kipory-marketing-web@1.0.0 test
> vitest run src/components/elements/Node3D/node3DGradientTextureCache.test.ts

 RUN  v4.1.11 /Users/arsenys/Development/kipory-marketing-web/.worktrees/reuse-node3d-flows

 ❯ src/components/elements/Node3D/node3DGradientTextureCache.test.ts (0 test)

Error: Failed to resolve import "./node3DGradientTextureCache" from "src/components/elements/Node3D/node3DGradientTextureCache.test.ts".
```

The suite failed because the requested cache module did not exist yet.

## TDD GREEN

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test -- src/components/elements/Node3D/node3DGradientTextureCache.test.ts
```

Output:

```text
Test Files  1 passed (1)
Tests  1 passed (1)
```

## Focused lifecycle verification

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test -- src/components/elements/Node3D
npm run typecheck
```

Output:

```text
Test Files  2 passed (2)
Tests  3 passed (3)

> kipory-marketing-web@1.0.0 typecheck
> tsc --noEmit
```

## Full-suite verification

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test
```

Output:

```text
Test Files  15 passed (15)
Tests  52 passed (52)
```

## Self-review

- The cache reuses a key only within the same renderer; separate renderers receive independent textures.
- A cached texture is marked managed only after successful creation.
- Renderer cache disposal is idempotent: missing renderer entries return immediately, and disposed entries are deleted.
- Node3D material traversal leaves managed textures untouched until cache teardown, while non-managed textures retain their existing disposal behavior.
- `git diff --check` passed.
- Changes are limited to the requested Node3D implementation, test, and report files.

## Concerns

None identified for this task. The existing BusinessFlow3D scene has a separate resource cleanup path; this task intentionally limits lifecycle integration to the requested `createNode3DScene` files.

## Fix Round 1

### Findings addressed

- Updated `createSignalFlowScene` cleanup to skip renderer-managed Node3D gradient textures during material traversal and call `disposeNode3DGradientTextures(renderer)` exactly once immediately before `renderer.dispose()`.
- Expanded cache lifecycle assertions for repeated renderer-A disposal, renderer-B teardown, and repeated renderer-B disposal.
- Added a BusinessFlow controller lifecycle regression that verifies the shared face texture is disposed once, the renderer cache is finalized (a subsequent lookup creates a replacement), and the renderer is disposed once.

### TDD RED

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test -- src/features/business-flow-3d/scene/createSignalFlowScene.test.ts
```

Output:

```text
❯ src/features/business-flow-3d/scene/createSignalFlowScene.test.ts (1 test | 1 failed)
× finalizes managed gradient textures through BusinessFlow renderer teardown
AssertionError: expected "dispose" to be called once, but got 2 times
```

The failure demonstrated the existing BusinessFlow cleanup was disposing one renderer-managed shared texture once per Node3D material instead of through renderer ownership.

### TDD GREEN

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test -- src/features/business-flow-3d/scene/createSignalFlowScene.test.ts
```

Output:

```text
Test Files  1 passed (1)
Tests  1 passed (1)
```

### Covering tests

Command:

```bash
export PATH=/Users/arsenys/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
npm test -- src/components/elements/Node3D/node3DGradientTextureCache.test.ts src/features/business-flow-3d/scene/createSignalFlowScene.test.ts
```

Output:

```text
Test Files  2 passed (2)
Tests  2 passed (2)
```

### Files changed

- `src/features/business-flow-3d/scene/createSignalFlowScene.ts` — protects managed textures and finalizes the Node3D cache before renderer teardown.
- `src/features/business-flow-3d/scene/createSignalFlowScene.test.ts` — new BusinessFlow lifecycle regression with jsdom canvas and renderer lifecycle setup.
- `src/components/elements/Node3D/node3DGradientTextureCache.test.ts` — asserts idempotent disposal for both renderer scopes.
- `.superpowers/sdd/2026-08-27-node3d-horizontal-vertical-flows/task-2-report.md` — this fix-round record.

### Fix-round self-review

- Both existing consumers of `createNode3DObject` now skip managed textures during material cleanup (`createNode3DScene` and `createSignalFlowScene`).
- Both consumers finalize the renderer-owned cache immediately before `renderer.dispose()`.
- Cache tests verify renderer isolation and idempotence; BusinessFlow regression verifies shared-texture single disposal and cache deletion.
- The regression uses real Node3D geometry/material creation with a mocked renderer and canvas 2D context; it does not alter production behavior.
- No unrelated files were changed.
