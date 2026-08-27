# Homepage Illustration Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all three homepage illustrations a shared, typed production preset consumed by both Next.js and a dedicated Storybook story, and replace the delivery placeholder with the horizontal flow.

**Architecture:** Each illustration feature owns one serializable `*HomepageProps` object that is exported through its feature entry point. The Next.js Server Component and a `Current Next.js App` Storybook story consume that same object, while responsive page layout remains in the homepage CSS module.

**Tech Stack:** Next.js 16.3.2 App Router, React 19.2.8, TypeScript 5.9, Storybook 10.5.10, Vitest 4.1.11, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-27-homepage-illustration-presets-design.md`

## Global Constraints

- Read `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` and `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` before changing the App Router page.
- Keep `src/app/page.tsx` a Server Component; do not add `'use client'`.
- Pass only plain serializable values from the homepage presets into Client Components.
- Storybook Controls are temporary runtime state and must not gain a file-writing path.
- Do not add dependencies or refactor illustration internals.
- Preserve the existing Foundation and exploratory stories.

## File Structure

- `src/features/business-flow-3d/presets.ts`: owns the typed 3D homepage configuration.
- `src/features/business-flow-vertical/presets.ts`: owns the typed vertical homepage configuration.
- `src/features/business-flow-horizontal/presets.ts`: owns the typed horizontal homepage configuration.
- `src/features/business-flow-{3d,vertical,horizontal}/index.ts`: exposes the relevant homepage preset at each feature boundary.
- `src/features/business-flow-{3d,vertical,horizontal}/stories/*.stories.tsx`: exposes a `Current Next.js App` story backed by the matching homepage preset.
- `src/features/homepage-illustration-presets.contract.test.ts`: protects preset exports and Storybook consumption from drift.
- `src/app/page.tsx`: consumes all three homepage presets and renders the horizontal delivery illustration.
- `src/app/page.test.tsx`: verifies the delivery integration and exact horizontal preset propagation.
- `src/app/marketing.module.css`: owns the delivery illustration's grid placement, containment, and responsive behavior.

---

### Task 1: Establish the shared homepage preset contract

**Files:**

- Create: `src/features/homepage-illustration-presets.contract.test.ts`
- Modify: `src/features/business-flow-3d/presets.ts`
- Modify: `src/features/business-flow-3d/index.ts`
- Modify: `src/features/business-flow-3d/stories/BusinessFlow3D.stories.tsx`
- Modify: `src/features/business-flow-vertical/presets.ts`
- Modify: `src/features/business-flow-vertical/index.ts`
- Modify: `src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx`
- Modify: `src/features/business-flow-horizontal/presets.ts`
- Modify: `src/features/business-flow-horizontal/index.ts`
- Modify: `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**

- Produces: `businessFlow3DHomepageProps` satisfying `BusinessFlow3DProps`.
- Produces: `businessFlowVerticalHomepageProps` satisfying `BusinessFlowVerticalProps`.
- Produces: `businessFlowHorizontalHomepageProps` satisfying `BusinessFlowHorizontalProps`.
- Produces: one `CurrentNextjsApp: Story` export per illustration, displayed as `Current Next.js App`.
- Consumes: the existing values in `businessFlow3DProps`, `businessFlowVerticalProps`, and `businessFlowHorizontalProps` without changing them.

- [ ] **Step 1: Write the failing preset/story contract test**

Create `src/features/homepage-illustration-presets.contract.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const cases = [
  {
    feature: 'business-flow-3d',
    preset: 'businessFlow3DHomepageProps',
    story: 'BusinessFlow3D',
  },
  {
    feature: 'business-flow-vertical',
    preset: 'businessFlowVerticalHomepageProps',
    story: 'BusinessFlowVertical',
  },
  {
    feature: 'business-flow-horizontal',
    preset: 'businessFlowHorizontalHomepageProps',
    story: 'BusinessFlowHorizontal',
  },
] as const;

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

describe('homepage illustration preset contract', () => {
  it.each(cases)('$feature exports one preset used by its website story', ({ feature, preset, story }) => {
    const presetSource = source(`./${feature}/presets.ts`);
    const indexSource = source(`./${feature}/index.ts`);
    const storySource = source(`./${feature}/stories/${story}.stories.tsx`);

    expect(presetSource).toContain(`export const ${preset} =`);
    expect(indexSource).toContain(`export { ${preset} } from './presets';`);
    expect(storySource).toContain(`import { ${preset} } from '../presets';`);
    expect(storySource).toMatch(new RegExp(
      `export const CurrentNextjsApp: Story = \\{[\\s\\S]*?args: ${preset}`,
    ));
  });
});
```

- [ ] **Step 2: Run the contract test and verify the red state**

Run:

```bash
npm test -- src/features/homepage-illustration-presets.contract.test.ts
```

Expected: FAIL because none of the `*HomepageProps` exports or `CurrentNextjsApp` stories exists yet.

- [ ] **Step 3: Rename the three production preset exports without changing values**

In each `presets.ts`, change only the exported identifier:

```ts
export const businessFlow3DHomepageProps = {
  mode: 'dark',
  showInterface: false,
  interactive: false,
  fogEnabled: true,
  gridOpacity: 0.2,
  gridDensity: 30,
  gridMaskRadius: 800,
  gridMaskBlur: 480,
  connectorOpacity: 0.62,
  connectorStroke: 'dashed',
  connectorWidth: 1.25,
  showContinuationConnectors: true,
  pathCurve: 86,
  outlineOpacity: 0,
  outlineWidth: 1,
  nodeScale: 0.7,
  nodeDepth: 20,
  nodeDepthRandom: 42,
  nodeShape: 'custom',
  nodeCornerRadius: 10,
  nodeIconOpacity: 0.5,
  nodeFrontGradientAngle: 117,
  nodeSideXGradientAngle: 360,
  nodeSideZGradientAngle: 177,
  nodeFrontGradientStartColor: '#066b43',
  nodeFrontGradientMidColor: '#03492b',
  nodeFrontGradientEndColor: '#052f24',
  nodeSideXGradientEndColor: '#5c899b',
  nodeSideZGradientStartColor: '#427298',
  nodeSideZGradientMidColor: '#366480',
  nodeSideZGradientEndColor: '#0e4b81',
  perspectiveEffect: 75,
  cameraPitch: 33.19,
  cameraYaw: 0.35,
  cameraZoom: 0.91,
  emitterX: 3,
  emitterY: -8,
  scrollTilt: 41.81,
  scrollRange: 700,
  minDelay: 500,
  maxDelay: 1800,
  speed: 0.5,
  nodeProgressMode: 'outline',
  progressPadding: 1,
  progressBarHeight: 15,
  concurrentBeams: 10,
  minEmitDelay: 500,
  maxEmitDelay: 1400,
} satisfies BusinessFlow3DProps;
```

```ts
export const businessFlowVerticalHomepageProps = {
  auxiliaryIconFillColor: '#212121',
  beamColor: '#449c40',
  beamEmissionRandomness: 100,
  beamEnabled: true,
  beamHeadGlowBlur: 10,
  beamHeadGlowOpacity: 0.6,
  beamHeadGlowRadius: 18,
  beamHighlightColor: '#c9ebc7',
  beamSpeed: 1.4,
  beamTrailLength: 32,
  burstFadeTime: 1700,
  burstRadius: 19,
  burstStrength: 0.5,
  maxConcurrentBeams: 10,
  numberOfNodesTop: 4,
  numberOfNodesBottom: 5,
  auxiliaryNodeSpacing: 0.6,
  color: '#f3f5ef',
  centralIconFillColor: '#1d281d',
  centralIconFillMode: 'black',
  centralIconStrokeOpacity: 0.52,
  connectorColor: '#ffffff',
  connectorOpacity: 0.22,
  connectorRadius: 10,
  connectorWidth: 1.25,
  showContinuationConnectors: true,
  gradientStartColor: '#066b43',
  gradientMidColor: '#03492b',
  gradientEndColor: '#052f24',
  gridColor: '#39473f',
  gridDensity: 30,
  gridOpacity: 0,
  width: '20rem',
  height: '45rem',
  iconSize: 40,
  strokeWidth: 1.5,
} satisfies BusinessFlowVerticalProps;
```

```ts
export const businessFlowHorizontalHomepageProps = {
  auxiliaryIconFillColor: '#212121',
  beamColor: '#449c40',
  beamEnabled: true,
  beamHighlightColor: '#c9ebc7',
  beamSpeed: 1.4,
  centralIconFillColor: '#1d281d',
  centralIconStrokeOpacity: 0.52,
  color: '#f3f5ef',
  connectorColor: '#ffffff',
  connectorOpacity: 0.22,
  connectorWidth: 1.25,
  gridColor: '#39473f',
  gridDensity: 30,
  gridOpacity: 0,
  height: '38rem',
  iconSize: 40,
  strokeWidth: 1.5,
  width: '20rem',
} satisfies BusinessFlowHorizontalProps;
```

Do not leave aliases with the old names; update all imports so there is one persistent production object per illustration.

- [ ] **Step 4: Export the renamed presets and keep the current homepage compiling**

Update each feature `index.ts` to export its exact new name. In `src/app/page.tsx`, update the existing 3D and vertical imports and spreads:

```tsx
import {
  BusinessFlow3D,
  businessFlow3DHomepageProps,
} from '@/features/business-flow-3d';
import {
  BusinessFlowVertical,
  businessFlowVerticalHomepageProps,
} from '@/features/business-flow-vertical';

// Existing render sites:
<BusinessFlow3D {...businessFlow3DHomepageProps} />
<BusinessFlowVertical
  {...businessFlowVerticalHomepageProps}
  className={styles.pillarsIllustration}
/>
```

The horizontal preset is exported now but is connected to the homepage in Task 2.

- [ ] **Step 5: Add one website story to every illustration**

Replace old preset imports in the three story files with the matching `*HomepageProps` import. Add this export to each file, substituting the exact preset name:

```ts
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: businessFlowHorizontalHomepageProps,
};
```

For the vertical and horizontal story metadata, also replace the existing `meta.args` reference with the renamed homepage preset so Foundation retains its current appearance. For the 3D story, leave the exploratory metadata defaults and `Workflow1` overrides intact; only change its production preset import and add `CurrentNextjsApp` with `args: businessFlow3DHomepageProps`.

- [ ] **Step 6: Run the focused contract test and type checker**

Run:

```bash
npm test -- src/features/homepage-illustration-presets.contract.test.ts
npm run typecheck
```

Expected: both commands PASS, and TypeScript confirms all preset values still satisfy their illustration prop types.

- [ ] **Step 7: Commit the shared preset contract**

```bash
git add src/features/homepage-illustration-presets.contract.test.ts \
  src/features/business-flow-3d/presets.ts \
  src/features/business-flow-3d/index.ts \
  src/features/business-flow-3d/stories/BusinessFlow3D.stories.tsx \
  src/features/business-flow-vertical/presets.ts \
  src/features/business-flow-vertical/index.ts \
  src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx \
  src/features/business-flow-horizontal/presets.ts \
  src/features/business-flow-horizontal/index.ts \
  src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx \
  src/app/page.tsx
git commit -m "feat: share homepage illustration presets with stories"
```

---

### Task 2: Render the horizontal preset in the delivery section

**Files:**

- Create: `src/app/page.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/marketing.module.css`

**Interfaces:**

- Consumes: `BusinessFlowHorizontal` and `businessFlowHorizontalHomepageProps` from `@/features/business-flow-horizontal`.
- Produces: `.deliveryIllustration`, the responsive wrapper occupying column 1 of `.useCaseLayout`.
- Preserves: the `BusinessFlowHorizontal` component's own accessible `figure` label.

- [ ] **Step 1: Write the failing homepage integration test**

Create `src/app/page.test.tsx` with module mocks that keep the page test lightweight while verifying prop propagation:

```tsx
import { readFileSync } from 'node:fs';
import type { PropsWithChildren } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import HomePage from './page';

const {
  horizontalHomepageProps,
  horizontalRender,
  threeDHomepageProps,
  threeDRender,
  verticalHomepageProps,
  verticalRender,
} = vi.hoisted(() => ({
  horizontalHomepageProps: {
    beamSpeed: 1.4,
    height: '38rem',
    width: '20rem',
  },
  horizontalRender: vi.fn(),
  threeDHomepageProps: { cameraZoom: 0.91, mode: 'dark' },
  threeDRender: vi.fn(),
  verticalHomepageProps: { height: '45rem', width: '20rem' },
  verticalRender: vi.fn(),
}));

vi.mock('@/components/site/HeroScrollEffects', () => ({
  HeroScrollEffects: ({ children, className, id }: PropsWithChildren<{ className?: string; id?: string }>) => (
    <main className={className} id={id}>{children}</main>
  ),
}));
vi.mock('@/components/site/BackToTop', () => ({ BackToTop: () => null }));
vi.mock('@/components/ui/GlowLink', () => ({
  GlowLink: ({ children, href }: PropsWithChildren<{ href: string }>) => <a href={href}>{children}</a>,
}));
vi.mock('@/features/business-flow-3d', () => ({
  BusinessFlow3D: (props: Record<string, unknown>) => {
    threeDRender(props);
    return <div />;
  },
  businessFlow3DHomepageProps: threeDHomepageProps,
}));
vi.mock('@/features/business-flow-vertical', () => ({
  BusinessFlowVertical: (props: Record<string, unknown>) => {
    verticalRender(props);
    return <div />;
  },
  businessFlowVerticalHomepageProps: verticalHomepageProps,
}));
vi.mock('@/features/business-flow-horizontal', () => ({
  BusinessFlowHorizontal: (props: Record<string, unknown>) => {
    horizontalRender(props);
    return <figure aria-label="Horizontal business flow" />;
  },
  businessFlowHorizontalHomepageProps: horizontalHomepageProps,
}));

beforeEach(() => {
  horizontalRender.mockClear();
  threeDRender.mockClear();
  verticalRender.mockClear();
});

it('renders all shared homepage presets and replaces the delivery placeholder', () => {
  render(<HomePage />);

  const pageSource = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
  expect(pageSource).not.toMatch(/^['"]use client['"];?/);
  expect(screen.queryByText(/illustration placeholder/i)).not.toBeInTheDocument();
  expect(screen.getByRole('figure', { name: 'Horizontal business flow' })).toBeInTheDocument();
  expect(threeDRender.mock.calls[0][0]).toEqual(expect.objectContaining(threeDHomepageProps));
  expect(verticalRender.mock.calls[0][0]).toEqual(expect.objectContaining(verticalHomepageProps));
  expect(horizontalRender).toHaveBeenCalledWith(expect.objectContaining(horizontalHomepageProps));
});
```

If React passes an additional legacy context argument to the mock component in the installed test renderer, assert only against `horizontalRender.mock.calls[0][0]` rather than weakening the expected props.

- [ ] **Step 2: Run the page test and verify the red state**

Run:

```bash
npm test -- src/app/page.test.tsx
```

Expected: FAIL because the page still contains `Illustration placeholder` and never renders `BusinessFlowHorizontal`.

- [ ] **Step 3: Replace the placeholder with the horizontal illustration**

Add the feature import to `src/app/page.tsx`:

```tsx
import {
  BusinessFlowHorizontal,
  businessFlowHorizontalHomepageProps,
} from '@/features/business-flow-horizontal';
```

Replace the placeholder block with:

```tsx
<div className={styles.deliveryIllustration}>
  <BusinessFlowHorizontal {...businessFlowHorizontalHomepageProps} />
</div>
```

Do not add an outer `role="img"` or `aria-label`; the illustration already supplies its own accessible name.

- [ ] **Step 4: Replace placeholder-only CSS with delivery illustration layout**

In `src/app/marketing.module.css`, remove all `.capabilityVisualPlaceholder` and `.capabilityVisualPlaceholder span` rules. Add focused delivery rules while preserving the current grid order:

```css
.capabilityVisual,
.deliveryIllustration {
  min-height: 100%;
  display: grid;
  place-items: center;
}

.capabilityVisual {
  overflow: hidden;
  background: transparent;
  border: 0;
}

.deliveryIllustration {
  min-width: 0;
  min-height: 38rem;
  overflow: hidden;
}

.useCaseLayout .deliveryIllustration {
  grid-column: 1;
  grid-row: 1;
}
```

Update the existing `@media (max-width: 900px)` selectors:

```css
.useCaseLayout .capabilityContent,
.useCaseLayout .deliveryIllustration {
  grid-column: auto;
  grid-row: auto;
}

.capabilityVisual,
.deliveryIllustration {
  min-height: 360px;
}
```

The component continues to receive the exact `20rem × 38rem` shared preset. The wrapper centers it, clips accidental overflow, and allows the grid to stack at the existing breakpoint without duplicating sizing props in the page.

- [ ] **Step 5: Run the focused tests and type checker**

Run:

```bash
npm test -- src/app/page.test.tsx src/features/homepage-illustration-presets.contract.test.ts
npm run typecheck
```

Expected: all commands PASS.

- [ ] **Step 6: Run all automated verification**

Run each command separately so failures are attributable:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run build-storybook
```

Expected: all 76 existing tests plus four new cases PASS (80 total); lint, typecheck, Next.js build, and Storybook build exit with status 0.

- [ ] **Step 7: Verify the homepage and the three website stories visually**

With the existing development servers running, inspect:

- `http://127.0.0.1:3001/` at approximately 1440px desktop width.
- `http://127.0.0.1:3001/` at approximately 390px mobile width.
- `http://localhost:6006/?path=/story/animated-illustrations-businessflow3d--current-nextjs-app`.
- `http://localhost:6006/?path=/story/animated-illustrations-businessflowvertical--current-nextjs-app`.
- `http://localhost:6006/?path=/story/animated-illustrations-businessflowhorizontal--current-nextjs-app`.

Confirm the delivery illustration is centered and unclipped at both widths, there is no placeholder text or frame, each story renders, and the Storybook Controls display the same values as its exported homepage preset.

- [ ] **Step 8: Commit the homepage integration**

```bash
git add src/app/page.test.tsx src/app/page.tsx src/app/marketing.module.css
git commit -m "feat: render horizontal flow on homepage"
```

---

## Final Review Checklist

- [ ] `git status --short` shows no unintended files.
- [ ] `git diff HEAD~2 --check` reports no whitespace errors.
- [ ] The three production preset objects have one source definition each.
- [ ] The homepage and `Current Next.js App` stories import those definitions rather than copying values.
- [ ] Storybook Controls remain preview-only and no file-writing endpoint or addon was added.
- [ ] The delivery section exposes only the horizontal flow's accessible image label.
