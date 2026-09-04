# Theme-Specific Flat-Flow Homepage Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the horizontal and vertical Current App stories display and persist their actual Light/Dark landing-page values, while exposing saveable horizontal node-outline opacity and width controls.

**Architecture:** Replace the ambiguous shared horizontal and vertical homepage presets with complete Dark and Light flat object literals. Add small client wrappers that select the matching preset from `useResolvedTheme()`, keeping `src/app/page.tsx` a Server Component. Reuse the existing Storybook local-save endpoint, but map each story ID to its own theme export.

**Tech Stack:** Next.js 16.3.2 App Router, React 19.2.8, TypeScript 5.9, Storybook 10.5.10, Vitest 4.1.11, Testing Library, Three.js/FlowLayer3D

**Spec:** `docs/superpowers/specs/2026-09-04-theme-specific-flat-flow-homepage-presets-design.md`

## Global Constraints

- Work in the existing linked worktree at `/Users/arsenys/Development/kipory-marketing-web/.worktrees/system-aware-light-theme`; do not create another worktree.
- Use Node 20.19 with `PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH` for every npm command.
- Preserve all unrelated dirty-worktree changes.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` and `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` before changing App Router integration.
- Keep `src/app/page.tsx` a Server Component; never add `'use client'` to it.
- Preserve the existing illustration appearance during preset migration.
- Preserve Foundation stories as non-writable, theme-inheriting playgrounds.
- Keep Current App story IDs stable.
- Do not change the persistence endpoint schema, security checks, atomic writer, or production behavior.
- Use test-driven development: observe each new test fail before implementation and pass afterward.
- Use `apply_patch` for source edits.

## File Structure

- `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`: expose and resolve horizontal `outlineOpacity` and `outlineWidth`.
- `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`: protect explicit outline overrides and inherited theme defaults.
- `src/features/business-flow-horizontal/presets.ts`: own complete horizontal Dark and Light homepage presets.
- `src/features/business-flow-horizontal/index.ts`: export the paired horizontal presets.
- `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`: migrate homepage-shape assertions to the explicit Dark preset after the shared export is removed.
- `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx`: bind each Current App story to its theme preset and expose outline controls.
- `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.test.tsx`: protect story names, themes, args, save keys, and outline controls.
- `src/features/business-flow-vertical/presets.ts`: own complete vertical Dark and Light homepage presets.
- `src/features/business-flow-vertical/index.ts`: export the paired vertical presets.
- `src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`: migrate homepage-shape assertions to the explicit Dark preset after the shared export is removed.
- `src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx`: bind each Current App story to its theme preset.
- `src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.test.ts`: protect story names, themes, args, and save keys.
- `src/features/homepage-illustration-presets.contract.test.ts`: protect complete theme-specific values and structural parity.
- `src/app/_components/HomepageBusinessFlowHorizontal.tsx`: select the horizontal preset from the resolved theme.
- `src/app/_components/HomepageBusinessFlowHorizontal.test.tsx`: verify both horizontal theme selections.
- `src/app/_components/HomepageBusinessFlowVertical.tsx`: select the vertical preset and forward the page class name.
- `src/app/_components/HomepageBusinessFlowVertical.test.tsx`: verify both vertical theme selections and class forwarding.
- `src/app/page.tsx`: render theme-aware wrappers within the existing mobile fallback boundaries.
- `src/app/page.test.tsx`: verify wrapper integration while the page remains a Server Component.
- `.storybook/homepagePresetSource.ts`: map each flat-flow story ID to its matching theme export.
- `.storybook/homepagePresetSource.test.ts`: protect target mapping and independent writes.
- `.storybook/homepagePresetContract.test.ts`: migrate preset imports and require the complete persistent key surface.

---

### Task 1: Expose horizontal node-outline overrides

**Files:**

- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`
- Test: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`

**Interfaces:**

- Consumes: `BusinessFlowHeroTreatment.outlineOpacity` and `BusinessFlowHeroTreatment.outlineWidth`.
- Produces: optional `BusinessFlowHorizontalProps.outlineOpacity?: number` and `outlineWidth?: number`.
- Produces: `FlowLayer3DNodeStyle` values where explicit props win and omitted props retain theme-derived values.

- [ ] **Step 1: Add the failing explicit-outline test**

Append this test beside the existing theme-treatment tests:

```tsx
it('lets explicit node-outline values override the active theme treatment', () => {
  render(
    <ThemeProvider preference="light">
      <BusinessFlowHorizontal outlineOpacity={0.72} outlineWidth={2.5} />
    </ThemeProvider>,
  );

  expect(capturedNodeStyle).toMatchObject({
    mode: 'light',
    outlineOpacity: 0.72,
    outlineWidth: 2.5,
  });
});
```

The existing `inherits the light palette from theme context` and `falls back to the dark palette outside theme context` tests already protect omitted-prop behavior.

- [ ] **Step 2: Run the focused test and verify red**

Run:

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx
```

Expected: FAIL because `outlineOpacity` and `outlineWidth` are not public horizontal props and the captured style still contains the Light treatment values `0.3` and `1.25`.

- [ ] **Step 3: Add the public props and precedence rule**

Add these fields to `BusinessFlowHorizontalProps`:

```ts
outlineOpacity?: number;
outlineWidth?: number;
```

Destructure them as `outlineOpacity` and `outlineWidth`, then change the `nodeStyle` entries to:

```ts
outlineOpacity: outlineOpacity ?? heroTreatment.outlineOpacity,
outlineWidth: outlineWidth ?? heroTreatment.outlineWidth,
```

Add both props to the node-style `useMemo` dependency list. Do not clamp them here; the shared renderer and bounded Storybook controls remain the validation boundary, matching the existing 3D component API.

- [ ] **Step 4: Run the focused test and verify green**

Run the command from Step 2.

Expected: the complete horizontal component test file passes.

- [ ] **Step 5: Commit the component API change**

```bash
git add src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx
git commit -m "feat: expose horizontal node outline controls"
```

---

### Task 2: Create complete Light and Dark flat-flow presets

**Files:**

- Modify: `src/features/business-flow-horizontal/presets.ts`
- Modify: `src/features/business-flow-horizontal/index.ts`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`
- Modify: `src/features/business-flow-vertical/presets.ts`
- Modify: `src/features/business-flow-vertical/index.ts`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`
- Test: `src/features/homepage-illustration-presets.contract.test.ts`
- Test: `.storybook/homepagePresetContract.test.ts`

**Interfaces:**

- Produces: `businessFlowHorizontalHomepageDarkProps` and `businessFlowHorizontalHomepageLightProps` satisfying `BusinessFlowHorizontalProps`.
- Produces: `businessFlowVerticalHomepageDarkProps` and `businessFlowVerticalHomepageLightProps` satisfying `BusinessFlowVerticalProps`.
- Consumes: `businessFlowPalettes` and `businessFlowHeroTreatments` for explicit theme values.

- [ ] **Step 1: Replace shared-preset assertions with failing paired-preset assertions**

Update imports in `src/features/homepage-illustration-presets.contract.test.ts` and `.storybook/homepagePresetContract.test.ts` to the four new names before the exports exist. Add this shared assertion helper:

```ts
const nodeShadowKeys = [
  'nodeShadowBias',
  'nodeShadowBlurSamples',
  'nodeShadowColor',
  'nodeShadowLightX',
  'nodeShadowLightY',
  'nodeShadowLightZ',
  'nodeShadowNormalBias',
  'nodeShadowOpacity',
  'nodeShadowRadius',
] as const;

for (const preset of [
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
]) {
  for (const key of nodeShadowKeys) expect(preset).toHaveProperty(key);
}

expect(businessFlowHorizontalHomepageDarkProps).toMatchObject({
  outlineOpacity: 0,
  outlineWidth: 1,
  nodeShadowOpacity: 0.5,
});
expect(businessFlowHorizontalHomepageLightProps).toMatchObject({
  outlineOpacity: 0.3,
  outlineWidth: 1.25,
  nodeShadowOpacity: 0.38,
});
expect(businessFlowVerticalHomepageDarkProps).toMatchObject({ nodeShadowOpacity: 0.5 });
expect(businessFlowVerticalHomepageLightProps).toMatchObject({ nodeShadowOpacity: 0.38 });
```

Replace every existing lower-flow shared-preset case with one Dark case and one Light case. Keep the 3D and core-flow assertions unchanged.

In the horizontal and vertical component test files, replace imports and renders of the removed shared preset with the matching Dark preset. Those tests exercise structural homepage values, so the Dark export is the direct successor to the former shared object; theme-selection behavior belongs to the wrapper tests in Task 4.

- [ ] **Step 2: Run both contract files and verify red**

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- src/features/homepage-illustration-presets.contract.test.ts .storybook/homepagePresetContract.test.ts
```

Expected: FAIL because the four new exports do not exist.

- [ ] **Step 3: Define both complete horizontal preset objects**

Import the palette sources:

```ts
import {
  businessFlowHeroTreatments,
  businessFlowPalettes,
} from '@/features/business-flow-palette';
```

Rename the existing object to `businessFlowHorizontalHomepageDarkProps`, preserve every existing structural value, and add these explicit entries:

```ts
auxiliaryIconFillColor: businessFlowHeroTreatments.dark.iconFill,
beamColor: businessFlowPalettes.dark.beam,
beamHighlightColor: businessFlowPalettes.dark.beamHighlight,
centralIconFillColor: businessFlowHeroTreatments.dark.iconFill,
connectorColor: businessFlowHeroTreatments.dark.connectorColor,
gridColor: businessFlowPalettes.dark.grid,
iconStrokeColor: businessFlowHeroTreatments.dark.iconStroke,
outlineOpacity: 0,
outlineWidth: 1,
nodeShadowBias: -0.0003,
nodeShadowBlurSamples: 16,
nodeShadowColor: businessFlowPalettes.dark.nodeShadow,
nodeShadowLightX: -6,
nodeShadowLightY: 14,
nodeShadowLightZ: -5,
nodeShadowNormalBias: 0.025,
nodeShadowOpacity: 0.5,
nodeShadowRadius: 8,
```

Create `businessFlowHorizontalHomepageLightProps` as a second full object literal. Copy every structural value from the Dark object exactly, then use these Light entries:

```ts
auxiliaryIconFillColor: businessFlowHeroTreatments.light.iconFill,
beamColor: businessFlowPalettes.light.beam,
beamHighlightColor: businessFlowPalettes.light.beamHighlight,
centralIconFillColor: businessFlowHeroTreatments.light.iconFill,
connectorColor: businessFlowHeroTreatments.light.connectorColor,
gridColor: businessFlowPalettes.light.grid,
iconStrokeColor: businessFlowHeroTreatments.light.iconStroke,
outlineOpacity: 0.3,
outlineWidth: 1.25,
nodeShadowBias: -0.0003,
nodeShadowBlurSamples: 16,
nodeShadowColor: businessFlowPalettes.light.nodeShadow,
nodeShadowLightX: -6,
nodeShadowLightY: 14,
nodeShadowLightZ: -5,
nodeShadowNormalBias: 0.025,
nodeShadowOpacity: 0.38,
nodeShadowRadius: 8,
```

Both declarations must remain direct object literals ending in `satisfies BusinessFlowHorizontalProps`; do not use spreads or aliases because the safe source writer edits object literals only.

- [ ] **Step 4: Define both complete vertical preset objects**

Import the same palette sources. Rename the existing object to `businessFlowVerticalHomepageDarkProps`, preserve every structural value, and add:

```ts
auxiliaryIconFillColor: businessFlowHeroTreatments.dark.iconFill,
beamColor: businessFlowPalettes.dark.beam,
beamHighlightColor: businessFlowPalettes.dark.beamHighlight,
centralIconFillColor: businessFlowHeroTreatments.dark.iconFill,
connectorColor: businessFlowHeroTreatments.dark.connectorColor,
gradientStartColor: businessFlowHeroTreatments.dark.frontGradient.start,
gradientMidColor: businessFlowHeroTreatments.dark.frontGradient.mid,
gradientEndColor: businessFlowHeroTreatments.dark.frontGradient.end,
gridColor: businessFlowPalettes.dark.grid,
iconStrokeColor: businessFlowHeroTreatments.dark.iconStroke,
nodeShadowBias: -0.0003,
nodeShadowBlurSamples: 16,
nodeShadowColor: businessFlowPalettes.dark.nodeShadow,
nodeShadowLightX: -6,
nodeShadowLightY: 14,
nodeShadowLightZ: -5,
nodeShadowNormalBias: 0.025,
nodeShadowOpacity: 0.5,
nodeShadowRadius: 8,
```

Create `businessFlowVerticalHomepageLightProps` as another complete object literal with identical structural values and these Light entries:

```ts
auxiliaryIconFillColor: businessFlowHeroTreatments.light.iconFill,
beamColor: businessFlowPalettes.light.beam,
beamHighlightColor: businessFlowPalettes.light.beamHighlight,
centralIconFillColor: businessFlowHeroTreatments.light.iconFill,
connectorColor: businessFlowHeroTreatments.light.connectorColor,
gradientStartColor: businessFlowHeroTreatments.light.frontGradient.start,
gradientMidColor: businessFlowHeroTreatments.light.frontGradient.mid,
gradientEndColor: businessFlowHeroTreatments.light.frontGradient.end,
gridColor: businessFlowPalettes.light.grid,
iconStrokeColor: businessFlowHeroTreatments.light.iconStroke,
nodeShadowBias: -0.0003,
nodeShadowBlurSamples: 16,
nodeShadowColor: businessFlowPalettes.light.nodeShadow,
nodeShadowLightX: -6,
nodeShadowLightY: 14,
nodeShadowLightZ: -5,
nodeShadowNormalBias: 0.025,
nodeShadowOpacity: 0.38,
nodeShadowRadius: 8,
```

Both declarations must end in `satisfies BusinessFlowVerticalProps` and contain no spreads.

- [ ] **Step 5: Export the four explicit names**

Replace the old index exports with:

```ts
export {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from './presets';
```

and:

```ts
export {
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
} from './presets';
```

Do not retain ambiguous aliases.

- [ ] **Step 6: Run the paired-preset contract tests and verify green**

Run the command from Step 2.

Expected: both test files pass and TypeScript resolves all four exports.

- [ ] **Step 7: Commit the preset contract**

```bash
git add src/features/business-flow-horizontal/presets.ts src/features/business-flow-horizontal/index.ts src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx src/features/business-flow-vertical/presets.ts src/features/business-flow-vertical/index.ts src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx src/features/homepage-illustration-presets.contract.test.ts .storybook/homepagePresetContract.test.ts
git commit -m "feat: split flat-flow homepage presets by theme"
```

---

### Task 3: Bind Current App stories to their complete theme presets

**Files:**

- Modify: `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx`
- Test: `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.test.tsx`
- Modify: `src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx`
- Test: `src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.test.ts`

**Interfaces:**

- Consumes: all four presets from Task 2.
- Produces: stable Dark and Light story IDs with theme-pinned args and exact persistent key lists.
- Produces: horizontal `outlineOpacity` and `outlineWidth` Controls under `Nodes`.

- [ ] **Step 1: Write failing story assertions**

Replace shared-object assertions with exact per-theme expectations:

```ts
expect(horizontalStories.CurrentNextjsApp.args).toEqual({
  ...businessFlowHorizontalHomepageDarkProps,
  mode: 'dark',
});
expect(horizontalStories.CurrentNextjsApp.parameters).toEqual({
  homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageDarkProps) },
});
expect(horizontalStories.CurrentAppLight.args).toEqual({
  ...businessFlowHorizontalHomepageLightProps,
  mode: 'light',
});
expect(horizontalStories.CurrentAppLight.parameters).toEqual({
  homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageLightProps) },
});
expect(horizontalMeta.argTypes.outlineOpacity).toMatchObject({
  control: { type: 'range', min: 0, max: 1, step: 0.05 },
  table: { category: 'Nodes' },
});
expect(horizontalMeta.argTypes.outlineWidth).toMatchObject({
  control: { type: 'range', min: 0, max: 5, step: 0.25 },
  table: { category: 'Nodes' },
});
expect(horizontalMeta.argTypes.mode).toEqual({ table: { disable: true } });
```

Add equivalent vertical assertions using `businessFlowVerticalHomepageDarkProps` and `businessFlowVerticalHomepageLightProps`, including explicit `mode` and exact `homepagePreset.keys`.

- [ ] **Step 2: Run both story tests and verify red**

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.test.tsx src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.test.ts
```

Expected: FAIL because the stories still use the old shared objects and horizontal outline controls do not exist.

- [ ] **Step 3: Update the horizontal story meta and variants**

Import both horizontal presets. Set meta `args` to the Dark preset so Foundation retains a complete deterministic base. Add:

```ts
mode: { table: { disable: true } },
outlineOpacity: {
  control: { type: 'range', min: 0, max: 1, step: 0.05 },
  table: { category: 'Nodes' },
},
outlineWidth: {
  control: { type: 'range', min: 0, max: 5, step: 0.25 },
  table: { category: 'Nodes' },
},
```

Define the variants exactly as:

```ts
export const CurrentNextjsApp: Story = {
  name: 'Current App (Dark)',
  globals: { theme: 'dark' },
  args: { ...businessFlowHorizontalHomepageDarkProps, mode: 'dark' },
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageDarkProps) },
  },
};

export const CurrentAppLight: Story = {
  name: 'Current App (Light)',
  globals: { theme: 'light' },
  args: { ...businessFlowHorizontalHomepageLightProps, mode: 'light' },
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageLightProps) },
  },
};
```

- [ ] **Step 4: Update the vertical story variants**

Import both vertical presets, set meta `args` to the Dark preset, hide direct `mode` editing, and define both variants with the same structure as Step 3 using the vertical names. Do not add vertical outline controls; that component remains theme-derived by approved scope.

- [ ] **Step 5: Run both story tests and verify green**

Run the command from Step 2.

Expected: both story test files pass.

- [ ] **Step 6: Commit the Storybook bindings**

```bash
git add src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.test.tsx src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.test.ts
git commit -m "feat: bind flat-flow stories to themed presets"
```

---

### Task 4: Select themed flat-flow presets on the landing page

**Files:**

- Create: `src/app/_components/HomepageBusinessFlowHorizontal.tsx`
- Create: `src/app/_components/HomepageBusinessFlowHorizontal.test.tsx`
- Create: `src/app/_components/HomepageBusinessFlowVertical.tsx`
- Create: `src/app/_components/HomepageBusinessFlowVertical.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Interfaces:**

- Consumes: `useResolvedTheme()` and the four paired presets.
- Produces: `<HomepageBusinessFlowHorizontal />`.
- Produces: `<HomepageBusinessFlowVertical className?: string />`.
- Preserves: `src/app/page.tsx` as a Server Component.

- [ ] **Step 1: Write failing horizontal wrapper tests**

Create a test following `HomepageBusinessFlow3D.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
  type BusinessFlowHorizontalProps,
} from '@/features/business-flow-horizontal';
import { HomepageBusinessFlowHorizontal } from './HomepageBusinessFlowHorizontal';

const mocks = vi.hoisted(() => ({
  mode: 'light' as 'light' | 'dark',
  renderFlow: vi.fn<(props: BusinessFlowHorizontalProps) => null>(() => null),
}));

vi.mock('@/features/business-flow-horizontal', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/business-flow-horizontal')>()),
  BusinessFlowHorizontal: mocks.renderFlow,
}));
vi.mock('@/theme/ThemeProvider', () => ({ useResolvedTheme: () => mocks.mode }));

beforeEach(() => mocks.renderFlow.mockClear());

it.each([
  ['light', businessFlowHorizontalHomepageLightProps],
  ['dark', businessFlowHorizontalHomepageDarkProps],
] as const)('passes the %s horizontal homepage preset', (mode, preset) => {
  mocks.mode = mode;
  render(<HomepageBusinessFlowHorizontal />);
  expect(mocks.renderFlow).toHaveBeenCalledWith({ ...preset, mode });
});
```

- [ ] **Step 2: Write failing vertical wrapper tests**

Create the vertical equivalent and assert class forwarding:

```tsx
it.each([
  ['light', businessFlowVerticalHomepageLightProps],
  ['dark', businessFlowVerticalHomepageDarkProps],
] as const)('passes the %s vertical homepage preset', (mode, preset) => {
  mocks.mode = mode;
  render(<HomepageBusinessFlowVertical className="pillars" />);
  expect(mocks.renderFlow).toHaveBeenCalledWith({
    ...preset,
    className: 'pillars',
    mode,
  });
});
```

- [ ] **Step 3: Run both wrapper tests and verify red**

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- src/app/_components/HomepageBusinessFlowHorizontal.test.tsx src/app/_components/HomepageBusinessFlowVertical.test.tsx
```

Expected: FAIL because neither wrapper exists.

- [ ] **Step 4: Implement the horizontal wrapper**

Create:

```tsx
'use client';

import {
  BusinessFlowHorizontal,
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from '@/features/business-flow-horizontal';
import { useResolvedTheme } from '@/theme/ThemeProvider';

export function HomepageBusinessFlowHorizontal() {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlowHorizontalHomepageLightProps
    : businessFlowHorizontalHomepageDarkProps;

  return <BusinessFlowHorizontal {...preset} mode={mode} />;
}
```

- [ ] **Step 5: Implement the vertical wrapper**

Create:

```tsx
'use client';

import {
  BusinessFlowVertical,
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
  type BusinessFlowVerticalProps,
} from '@/features/business-flow-vertical';
import { useResolvedTheme } from '@/theme/ThemeProvider';

export function HomepageBusinessFlowVertical({
  className,
}: Pick<BusinessFlowVerticalProps, 'className'>) {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlowVerticalHomepageLightProps
    : businessFlowVerticalHomepageDarkProps;

  return <BusinessFlowVertical {...preset} className={className} mode={mode} />;
}
```

- [ ] **Step 6: Run wrapper tests and verify green**

Run the command from Step 3.

Expected: both wrapper tests pass.

- [ ] **Step 7: Write the failing page integration assertion**

Mock both wrapper modules in `src/app/page.test.tsx`, render `HomePage`, and assert one call to each wrapper. Retain the source assertion:

```ts
expect(pageSource).not.toMatch(/^['"]use client['"];?/);
```

Remove assertions that the page directly spreads the old shared presets; wrapper tests now own exact preset propagation.

- [ ] **Step 8: Replace direct flows with wrappers in the page**

Remove the direct horizontal/vertical feature imports and import:

```ts
import { HomepageBusinessFlowHorizontal } from './_components/HomepageBusinessFlowHorizontal';
import { HomepageBusinessFlowVertical } from './_components/HomepageBusinessFlowVertical';
```

Replace the existing children with:

```tsx
<HomepageBusinessFlowVertical className={styles.pillarsIllustration} />
```

and:

```tsx
<HomepageBusinessFlowHorizontal />
```

Keep both `MobileWorkflowFallback` components and all their props unchanged.

- [ ] **Step 9: Run wrapper and page tests**

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- src/app/_components/HomepageBusinessFlowHorizontal.test.tsx src/app/_components/HomepageBusinessFlowVertical.test.tsx src/app/page.test.tsx
```

Expected: all three files pass.

- [ ] **Step 10: Commit the landing integration**

```bash
git add src/app/_components/HomepageBusinessFlowHorizontal.tsx src/app/_components/HomepageBusinessFlowHorizontal.test.tsx src/app/_components/HomepageBusinessFlowVertical.tsx src/app/_components/HomepageBusinessFlowVertical.test.tsx src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: select flat-flow homepage presets by theme"
```

---

### Task 5: Persist each flat-flow theme independently

**Files:**

- Modify: `.storybook/homepagePresetSource.ts`
- Test: `.storybook/homepagePresetSource.test.ts`

**Interfaces:**

- Consumes: the four stable flat-flow story IDs.
- Produces: one exact `{ relativePath, exportName }` target per story.
- Preserves: existing queued, atomic writes for two exports in the same file.

- [ ] **Step 1: Change mapping expectations to the four explicit exports**

Use these cases:

```ts
[
  'animated-illustrations-businessflowhorizontal--current-nextjs-app',
  'src/features/business-flow-horizontal/presets.ts',
  'businessFlowHorizontalHomepageDarkProps',
],
[
  'animated-illustrations-businessflowhorizontal--current-app-light',
  'src/features/business-flow-horizontal/presets.ts',
  'businessFlowHorizontalHomepageLightProps',
],
[
  'animated-illustrations-businessflowvertical--current-nextjs-app',
  'src/features/business-flow-vertical/presets.ts',
  'businessFlowVerticalHomepageDarkProps',
],
[
  'animated-illustrations-businessflowvertical--current-app-light',
  'src/features/business-flow-vertical/presets.ts',
  'businessFlowVerticalHomepageLightProps',
],
```

- [ ] **Step 2: Add a failing independent flat-flow save test**

Create a temporary horizontal preset source with both exports:

```ts
export const businessFlowHorizontalHomepageDarkProps = {
  outlineOpacity: 0,
  nodeShadowOpacity: 0.5,
} satisfies Props;

export const businessFlowHorizontalHomepageLightProps = {
  outlineOpacity: 0.3,
  nodeShadowOpacity: 0.38,
} satisfies Props;
```

Call `saveHomepagePreset` once with the Dark ID and `{ outlineOpacity: 0.2 }`, then with the Light ID and `{ outlineOpacity: 0.7, nodeShadowOpacity: 0.31 }`. Assert the final source contains Dark `0.2 / 0.5` and Light `0.7 / 0.31`, proving isolation.

- [ ] **Step 3: Run the source tests and verify red**

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- .storybook/homepagePresetSource.test.ts
```

Expected: FAIL because both Light and Dark IDs still target the old shared exports.

- [ ] **Step 4: Update the four registry entries**

Set `exportName` to the exact names from Step 1. Do not change paths or any writer logic.

- [ ] **Step 5: Run the source tests and verify green**

Run the command from Step 3.

Expected: all source tests pass, including the new independent-write test.

- [ ] **Step 6: Commit the persistence mapping**

```bash
git add .storybook/homepagePresetSource.ts .storybook/homepagePresetSource.test.ts
git commit -m "feat: save flat-flow presets per theme"
```

---

### Task 6: Remove stale names and verify the complete feature

**Files:**

- Modify only if search finds stale references: files returned by the exact `rg` command below.
- Verify: all files changed in Tasks 1–5.

**Interfaces:**

- Consumes: completed theme-specific presets, stories, wrappers, and save targets.
- Produces: a repository with no ambiguous flat-flow homepage preset references and canonical Storybook URLs.

- [ ] **Step 1: Find and migrate every stale shared name**

Run:

```bash
rg -n "businessFlow(Horizontal|Vertical)HomepageProps" .storybook src
```

Expected after Tasks 1–5: no matches. If a match remains, replace it with the explicit Dark/Light name required by its runtime or test context. Documentation is intentionally outside this hygiene check so historical plans/specs remain unchanged.

- [ ] **Step 2: Run focused regression tests**

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test -- src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.test.tsx src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.test.ts src/features/homepage-illustration-presets.contract.test.ts src/app/_components/HomepageBusinessFlowHorizontal.test.tsx src/app/_components/HomepageBusinessFlowVertical.test.tsx src/app/page.test.tsx .storybook/homepagePresetContract.test.ts .storybook/homepagePresetSource.test.ts .storybook/homepagePresetMiddleware.test.ts .storybook/HomepagePresetToolbar.test.tsx .storybook/manager.test.ts
```

Expected: every focused file passes with zero failures.

- [ ] **Step 3: Run complete automated verification**

Run each command independently and require exit code 0:

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm test
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm run typecheck
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm run lint
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm run build
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm run build-storybook
```

- [ ] **Step 4: Run the Impeccable detector once on changed UI targets**

```bash
node /Users/arsenys/.codex/skills/impeccable/scripts/detect.mjs --json src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx src/app/_components/HomepageBusinessFlowHorizontal.tsx src/app/_components/HomepageBusinessFlowVertical.tsx src/app/page.tsx
```

Expected: no unaddressed findings. Verify any reported item in context before editing.

- [ ] **Step 5: Restart Storybook so server-side target mappings reload**

Stop only the known Storybook process for this worktree, restart with:

```bash
PATH=/Users/arsenys/.nvm/versions/node/v20.19.0/bin:$PATH npm run storybook
```

Wait for `Storybook ready!`, then reload the in-app Storybook tab.

- [ ] **Step 6: Verify controls and saving in the browser**

Inspect these canonical URLs without an `args` query:

```text
http://localhost:6006/?path=/story/animated-illustrations-businessflowhorizontal--current-nextjs-app
http://localhost:6006/?path=/story/animated-illustrations-businessflowhorizontal--current-app-light
http://localhost:6006/?path=/story/animated-illustrations-businessflowvertical--current-nextjs-app
http://localhost:6006/?path=/story/animated-illustrations-businessflowvertical--current-app-light
```

Confirm:

- horizontal Dark outline values are `0` and `1`;
- horizontal Light outline values are `0.3` and `1.25`;
- shadow values show `-6 / 14 / -5`, blur `16`, radius `8`, and theme opacity `0.5` or `0.38`;
- both toolbar buttons are enabled;
- a reversible representative change reaches `Saved`, changes only its selected export, appears in the matching landing-page theme at `http://localhost:3000/`, and restores exactly.

- [ ] **Step 7: Run final source hygiene checks**

```bash
git diff --check
git status --short
```

Confirm no temporary preset values, generated Storybook output, or stale URL parameters remain. Preserve unrelated pre-existing changes.

- [ ] **Step 8: Commit any final migration-only corrections**

If Step 1 or verification required corrections, inspect `git status --short`, stage only the exact correction files, and commit:

```bash
git add <exact correction files>
git commit -m "test: verify themed flat-flow preset parity"
```

Skip this commit when there are no final corrections.
