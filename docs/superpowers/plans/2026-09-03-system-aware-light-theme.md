# System-Aware Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a flash-free three-state theme system and an authored Cold Paper Blueprint light appearance across the Next.js site, Storybook, WebGL illustrations, mobile workflow fallbacks, and cleaned brand symbol.

**Architecture:** A root `ThemeProvider` owns the persisted `system | light | dark` preference, while a synchronous head script applies the resolved `light | dark` DOM contract before first paint. CSS consumes semantic tokens, React and Three.js consume the same resolved theme through context, and explicit WebGL mode props retain precedence for isolated use. Storybook supplies the same preference contract through a global toolbar; mobile fallbacks select genuine theme-specific raster assets.

**Tech Stack:** Next.js 16.3.2 App Router, React 19.2.8, TypeScript 5.9, CSS Modules/global CSS variables, Three.js 0.185.1, Storybook 10.5.10, Vitest 4.1.11, Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-03-light-theme-design.md`

## Global Constraints

- Preserve the current dark appearance; light is a Cold Paper Blueprint adaptation, not an inversion.
- Theme preference values are exactly `system`, `light`, and `dark`; resolved values are exactly `light` and `dark`.
- First visit defaults to System, and all three preferences—including System—persist in local storage.
- System follows OS changes; explicit Light and Dark do not.
- Explicit component mode wins over provider mode; provider absence resolves reusable WebGL components to dark.
- Mobile uses a 44-by-44-pixel cycling control; desktop uses a three-option segmented control.
- Mobile workflow fallbacks use real light renders at 1x, 2x, and 3x; CSS filters are prohibited.
- Dark WebGL palette values and scene geometry/timing remain unchanged.
- No new runtime dependency is required.
- Follow the local Next.js 16.3.2 guides in `node_modules/next/dist/docs/`, especially `01-app/02-guides/preventing-flash-before-hydration.md`, before editing the root layout.
- Use TDD for behavioral changes and commit after every task.

---

## File Map

### New files

- `src/theme/theme.ts` — theme types, constants, pure resolution/storage/DOM helpers, and boot-script source.
- `src/theme/ThemeProvider.tsx` — context, persistence, OS/storage subscriptions, and resolved-theme hook.
- `src/theme/ThemeProvider.test.tsx` — provider integration and browser-event coverage.
- `src/theme/theme.test.ts` — pure domain and boot-script tests.
- `src/components/site/ThemeToggle.tsx` — responsive three-state control with authored icons.
- `src/components/site/ThemeToggle.module.css` — desktop segments and compact mobile cycle button.
- `src/components/site/ThemeToggle.test.tsx` — semantics, persistence calls, labels, and cycling.
- `src/app/light-theme-styles.test.ts` — semantic-token and theme-selector contract tests.
- `src/features/business-flow-palette.test.ts` — exact typed dark/light palette contract.
- `src/components/media/MobileWorkflowFallback.test.tsx` — theme-specific image and density-source behavior.
- `public/images/workflows/mobile/*-light.png`, `*-light@2x.png`, `*-light@3x.png` — fifteen real light workflow renders.

### Existing files changed by responsibility

- Root integration: `src/app/layout.tsx`, `src/app/globals.css`.
- Header: `src/components/site/SiteHeader.tsx`, `src/components/site/SiteHeader.test.tsx`, `src/components/site/SiteHeader.stories.tsx`.
- Authored light styling: `src/app/marketing.module.css`, `src/components/marketing/MarketingBlocks.module.css`, `src/components/form-controls/FormControls.module.css`, `src/components/icons/ProtocolIcon/ProtocolIcon.module.css`, `src/components/icons/ProtocolIconList/ProtocolIconList.module.css`, `src/components/site/BackToTop.module.css`, `src/components/ui/BackgroundBeams.module.css`, `src/components/ui/GlowLink.module.css`, `src/components/ui/SubmissionForm.module.css`, `src/components/elements/FlowLoadingOverlay/FlowLoadingOverlay.module.css`, `src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.module.css`.
- Palette source: `src/data/colors.json`, `src/features/business-flow-palette.ts`.
- Low-level WebGL inheritance: `src/components/elements/Node3D/{types.ts,Node3D.tsx,Node3D.test.tsx}`, `src/components/elements/Beam3D/{types.ts,Beam3D.tsx}`, `src/components/elements/Connector3D/{types.ts,Connector3D.tsx}`, `src/components/elements/FlowLayer3D/{types.ts,FlowLayer3D.tsx,FlowLayer3D.test.tsx,createFlowLayer3DScene.ts}`.
- Feature WebGL inheritance: `src/features/business-flow-3d/{types.ts,presets.ts}`, `src/features/business-flow-3d/components/{BusinessFlow3D.tsx,BusinessFlow3D.test.tsx}`, `src/features/business-flow-horizontal/{presets.ts,components/BusinessFlowHorizontal.tsx,components/BusinessFlowHorizontal.test.tsx}`, `src/features/business-flow-vertical/{presets.ts,components/BusinessFlowVertical.tsx,components/BusinessFlowVertical.test.tsx}`, `src/features/business-core-node-flow/{presets.ts,components/BusinessCoreNodeFlow.tsx,components/BusinessCoreNodeFlow.test.tsx}`, `src/features/homepage-illustration-presets.contract.test.ts`.
- Storybook theme contract: `.storybook/preview.ts`, `.storybook/homepagePresetContract.test.ts`, and the mode defaults in `src/**/*.stories.tsx` for Node3D, Beam3D, Connector3D, FlowLayer3D, and the four feature flows.
- Raster selection: `src/components/media/MobileWorkflowFallback.tsx`, `src/app/_components/HomepageHero.tsx`, `src/app/page.tsx`, `src/app/page.test.tsx`, `src/app/contact/ContactInquiry.tsx`, `src/app/contact/page.test.tsx`, `src/app/waitlist/WaitlistInquiry.tsx`, `src/app/waitlist/page.test.tsx`.
- Brand cleanup: `public/brand/kipory-symbol-vector.svg`, `src/app/brand-assets.test.ts`.

---

### Task 1: Theme domain, pre-paint script, and provider

**Files:**
- Create: `src/theme/theme.ts`
- Create: `src/theme/theme.test.ts`
- Create: `src/theme/ThemeProvider.tsx`
- Create: `src/theme/ThemeProvider.test.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `ThemePreference`, `ResolvedTheme`, `THEME_STORAGE_KEY`, `THEME_ORDER`, `isThemePreference(value)`, `resolveTheme(preference, systemDark)`, `nextThemePreference(preference)`, `applyThemeToDocument(preference, resolvedTheme)`, and `themeBootScript`.
- Produces: `ThemeProvider`, `useTheme()`, and `useResolvedTheme(explicitMode?: ResolvedTheme): ResolvedTheme`.
- `ThemeProvider` accepts optional controlled `preference?: ThemePreference` and `onPreferenceChange?: (preference: ThemePreference) => void`; the application omits both and uses internal persistence.
- Later tasks consume `useTheme()` for the header/fallback and `useResolvedTheme()` for WebGL inheritance.

- [ ] **Step 1: Write failing pure-domain tests**

```ts
import {
  THEME_ORDER,
  isThemePreference,
  nextThemePreference,
  resolveTheme,
} from './theme';

it('accepts only the three public preference values', () => {
  expect(THEME_ORDER).toEqual(['system', 'light', 'dark']);
  expect(['system', 'light', 'dark'].every(isThemePreference)).toBe(true);
  expect(isThemePreference('sepia')).toBe(false);
});

it('resolves System from the OS and cycles back to System', () => {
  expect(resolveTheme('system', false)).toBe('light');
  expect(resolveTheme('system', true)).toBe('dark');
  expect(resolveTheme('light', true)).toBe('light');
  expect(nextThemePreference('system')).toBe('light');
  expect(nextThemePreference('light')).toBe('dark');
  expect(nextThemePreference('dark')).toBe('system');
});
```

- [ ] **Step 2: Run the domain test and confirm it fails**

Run: `npm test -- src/theme/theme.test.ts`

Expected: FAIL because `src/theme/theme.ts` does not exist.

- [ ] **Step 3: Implement the pure contract and boot script**

```ts
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'kipory-theme';
export const THEME_ORDER = ['system', 'light', 'dark'] as const;
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#0a0c0b',
  light: '#f3f5ef',
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && THEME_ORDER.includes(value as ThemePreference);
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

export function nextThemePreference(preference: ThemePreference): ThemePreference {
  return THEME_ORDER[(THEME_ORDER.indexOf(preference) + 1) % THEME_ORDER.length];
}
```

Build `themeBootScript` from the same literal storage key and palette constants. Its IIFE must catch storage/media failures, validate the persisted string, set both root data attributes and `style.colorScheme`, and update the existing `meta[name="theme-color"]` before paint.

- [ ] **Step 4: Write failing provider/browser contract tests**

Test an uncontrolled provider with a controllable `matchMedia` mock and local storage. Assert:

```tsx
function Probe() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  return <button onClick={() => setPreference('dark')}>{preference}:{resolvedTheme}</button>;
}

expect(screen.getByRole('button')).toHaveTextContent('system:light');
await user.click(screen.getByRole('button'));
expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
```

Also cover an OS `change` event in System, no OS-driven update in explicit modes, a valid/invalid `storage` event, local-storage exceptions, controlled preference, listener cleanup, and `useResolvedTheme('light')` overriding context.

- [ ] **Step 5: Run the provider tests and confirm they fail**

Run: `npm test -- src/theme/theme.test.ts src/theme/ThemeProvider.test.tsx`

Expected: pure tests pass; provider tests FAIL because the provider and hooks do not exist.

- [ ] **Step 6: Implement provider subscriptions and document synchronization**

Use one context value:

```ts
export type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};
```

Initialize with the hydration-stable server snapshot `system/dark`, then reconcile from pre-painted root attributes in a layout effect before WebGL passive effects run. Persist user actions only, not storage-event echoes. Register the media listener only while preference is System. Support `addEventListener('change')` and the legacy `addListener` pair with symmetric cleanup.

- [ ] **Step 7: Integrate the pre-paint script and viewport metadata**

Modify the root layout to:

```tsx
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { THEME_COLORS, themeBootScript } from '@/theme/theme';

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: THEME_COLORS.dark,
};

<html
  lang="en"
  className={fontVariables}
  data-theme="dark"
  data-theme-preference="system"
  suppressHydrationWarning
>
  <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
  <body>
    <ThemeProvider>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </ThemeProvider>
  </body>
</html>
```

Keep `SiteHeader`, route children, and `SiteFooter` inside the provider. Do not read cookies or convert the root layout to a Client Component.

- [ ] **Step 8: Run theme tests, layout metadata tests, typecheck, and commit**

Run: `npm test -- src/theme/theme.test.ts src/theme/ThemeProvider.test.tsx src/app/metadata.test.ts`

Run: `npm run typecheck`

Expected: PASS with no hydration/type errors.

```bash
git add src/theme src/app/layout.tsx
git commit -m "feat: add system-aware theme foundation"
```

---

### Task 2: Accessible responsive header theme control

**Files:**
- Create: `src/components/site/ThemeToggle.tsx`
- Create: `src/components/site/ThemeToggle.module.css`
- Create: `src/components/site/ThemeToggle.test.tsx`
- Modify: `src/components/site/SiteHeader.tsx`
- Modify: `src/components/site/SiteHeader.test.tsx`
- Modify: `src/components/site/SiteHeader.stories.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `useTheme(): ThemeContextValue` and `nextThemePreference()` from Task 1.
- Produces: `ThemeToggle`, with no public props; it is always driven by the nearest provider.

- [ ] **Step 1: Write failing control semantics and interaction tests**

Render inside `ThemeProvider` and assert:

```tsx
const group = screen.getByRole('group', { name: 'Theme preference' });
expect(within(group).getByRole('button', { name: 'System' })).toHaveAttribute('aria-pressed', 'true');
expect(within(group).getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');

const cycle = screen.getByRole('button', { name: 'Theme: System. Switch to Light.' });
expect(cycle).toHaveClass(styles.mobile);
await user.click(cycle);
expect(screen.getByRole('button', { name: 'Theme: Light. Switch to Dark.' })).toBeInTheDocument();
```

Click every desktop segment, verify local storage and root attributes, verify mobile wraparound, and confirm the monitor/sun/moon SVGs are `aria-hidden` and `focusable="false"`.

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm test -- src/components/site/ThemeToggle.test.tsx src/components/site/SiteHeader.test.tsx`

Expected: FAIL because `ThemeToggle` is missing and the header has no theme control.

- [ ] **Step 3: Implement the authored icons and two responsive presentations**

Use native buttons. Render one desktop group with three visible labels and one mobile button with the exact current/next accessible label. Keep all four buttons in the DOM and switch visibility with CSS so server/client markup remains stable.

```tsx
const labels = { system: 'System', light: 'Light', dark: 'Dark' } as const;
const next = nextThemePreference(preference);

<div className={styles.desktop} role="group" aria-label="Theme preference">
  {THEME_ORDER.map((item) => (
    <button type="button" aria-pressed={item === preference} onClick={() => setPreference(item)}>
      <ThemeIcon preference={item} />
      <span>{labels[item]}</span>
    </button>
  ))}
</div>
<button
  className={styles.mobile}
  type="button"
  aria-label={`Theme: ${labels[preference]}. Switch to ${labels[next]}.`}
  onClick={cyclePreference}
>
  <ThemeIcon preference={preference} />
</button>
```

- [ ] **Step 4: Place and style the control in the header**

Insert `<ThemeToggle />` before the primary navigation. Desktop segments use a restrained 32–36px control height; the mobile button is exactly `44px` square. At `max-width: 760px`, hide the desktop group, show the mobile button, retain the wait-list CTA, and prevent the brand/actions row from overflowing at 320px.

Use semantic variables for border, selected surface, selected text, hover, and focus. No emoji, icon library, color-only selection, or tooltip-only labeling.

- [ ] **Step 5: Run focused tests and commit**

Run: `npm test -- src/components/site/ThemeToggle.test.tsx src/components/site/SiteHeader.test.tsx`

Run: `npm run typecheck`

Expected: PASS.

```bash
git add src/components/site/ThemeToggle.tsx src/components/site/ThemeToggle.module.css src/components/site/ThemeToggle.test.tsx src/components/site/SiteHeader.tsx src/components/site/SiteHeader.test.tsx src/components/site/SiteHeader.stories.tsx src/app/globals.css
git commit -m "feat: add three-state header theme control"
```

---

### Task 3: Semantic tokens and Cold Paper Blueprint site styling

**Files:**
- Create: `src/app/light-theme-styles.test.ts`
- Modify: `src/app/globals.css`
- Modify: `src/app/marketing.module.css`
- Modify: `src/components/marketing/MarketingBlocks.module.css`
- Modify: `src/components/form-controls/FormControls.module.css`
- Modify: `src/components/icons/ProtocolIcon/ProtocolIcon.module.css`
- Modify: `src/components/icons/ProtocolIconList/ProtocolIconList.module.css`
- Modify: `src/components/site/BackToTop.module.css`
- Modify: `src/components/ui/BackgroundBeams.module.css`
- Modify: `src/components/ui/GlowLink.module.css`
- Modify: `src/components/ui/SubmissionForm.module.css`
- Modify: `src/components/elements/FlowLoadingOverlay/FlowLoadingOverlay.module.css`
- Modify: `src/components/elements/WorkflowArrivalBursts/WorkflowArrivalBursts.module.css`

**Interfaces:**
- Consumes: root `data-theme` from Task 1.
- Produces: semantic CSS variables used by all non-WebGL UI and legacy aliases mapped to them.

- [ ] **Step 1: Write a failing stylesheet contract test**

Read the CSS sources as text and assert both root themes define the semantic contract:

```ts
const required = [
  '--surface-base', '--surface-soft', '--surface-elevated', '--surface-alternate',
  '--text-primary', '--text-secondary', '--text-muted', '--text-inverse',
  '--line-default', '--line-strong', '--signal', '--signal-strong', '--on-signal',
  '--header-surface', '--header-edge', '--focus-ring', '--selection-background',
  '--grid-color', '--glow-color',
];

for (const token of required) {
  expect(darkBlock).toContain(token);
  expect(lightBlock).toContain(token);
}
expect(css).toContain("html[data-theme='light']");
expect(css).toContain('@media (prefers-color-scheme: light)');
expect(css).toContain("html[data-theme-ready='true']");
```

Also assert that the touched component styles reference semantic variables for backgrounds, text, lines, and focus treatments instead of adding light-only selectors inside modules.

- [ ] **Step 2: Run the stylesheet test and confirm it fails**

Run: `npm test -- src/app/light-theme-styles.test.ts`

Expected: FAIL because the semantic light token layer does not exist.

- [ ] **Step 3: Define the exact global light and dark semantic palettes**

Keep current dark values. Add the approved light values and measured supporting values:

```css
html[data-theme='light'] {
  --surface-base: #f3f5ef;
  --surface-soft: #e7ebe2;
  --surface-elevated: #f8faf5;
  --surface-alternate: #dfe9dd;
  --text-primary: #111511;
  --text-secondary: #3f4a40;
  --text-muted: #5d695e;
  --text-inverse: #f3f5ef;
  --line-default: rgb(34 48 35 / 16%);
  --line-strong: rgb(25 40 27 / 32%);
  --signal: #449c40;
  --signal-strong: #2f702c;
  --on-signal: #f3f5ef;
  --header-surface: rgb(243 245 239 / 82%);
  --header-edge: rgb(25 40 27 / 18%);
  --focus-ring: #2f702c;
  --selection-background: #b7d9b3;
  --grid-color: rgb(45 70 47 / 10%);
  --glow-color: rgb(68 156 64 / 18%);
}
```

Map legacy `--ink`, `--paper`, `--line`, and `--accent` aliases to semantic roles in both theme blocks. Add `:root:not([data-theme])` plus `@media (prefers-color-scheme: light)` as the no-JavaScript fallback. Add transition rules only under `data-theme-ready='true'`, and disable them under reduced motion.

- [ ] **Step 4: Adapt site surfaces and interactions by semantic role**

Replace dark-assuming uses across the listed CSS files:

- base body/footer use `--surface-base` and `--text-primary`;
- the fixed header uses `--header-surface`/`--header-edge` and retains the reduced-transparency opaque override;
- hero shades and section masks fade into `--surface-base` or `--surface-alternate` as appropriate;
- alternating workflow sections use mineral and pale-sage fields with low-opacity blueprint grids;
- green eyebrow/link copy uses `--signal-strong` in light and `--signal` in dark;
- filled CTAs use `--signal-strong` plus `--on-signal` in light;
- form panels, inputs, success state, protocol chips, loading overlays, back-to-top, and glow links receive explicit semantic surfaces/lines/shadows;
- hover and focus states remain visible without relying on transforms or opacity alone.

- [ ] **Step 5: Run style/component regressions and commit**

Run: `npm test -- src/app/light-theme-styles.test.ts src/app/marketing-styles.test.ts src/app/design-system-contract.test.ts src/components/marketing/MarketingBlocks.test.tsx src/components/form-controls/FormControls.test.tsx src/components/ui/GlowLink.test.tsx src/components/ui/SubmissionForm.test.tsx`

Run: `npm run lint`

Expected: PASS with no hard-coded light-theme overrides scattered into component modules.

```bash
git add src/app/globals.css src/app/marketing.module.css src/app/light-theme-styles.test.ts src/components
git commit -m "feat: add cold paper light interface palette"
```

---

### Task 4: Typed light and dark workflow palettes

**Files:**
- Create: `src/features/business-flow-palette.test.ts`
- Modify: `src/data/colors.json`
- Modify: `src/features/business-flow-palette.ts`

**Interfaces:**
- Consumes: `ResolvedTheme` from `src/theme/theme.ts`.
- Produces: `BusinessFlowPalette`, `businessFlowPalettes: Record<ResolvedTheme, BusinessFlowPalette>`, and `getBusinessFlowPalette(mode: ResolvedTheme): BusinessFlowPalette`.

- [ ] **Step 1: Write failing exact palette tests**

```ts
expect(getBusinessFlowPalette('dark')).toMatchObject({
  beam: '#449c40',
  frontGradient: { start: '#066b43', mid: '#03492b', end: '#052f24' },
});
expect(getBusinessFlowPalette('light')).toMatchObject({
  black: '#111511',
  connector: '#33453a',
  grid: '#a7b5a8',
  iconStroke: '#182019',
});
expect(businessFlowPalettes.light).not.toBe(businessFlowPalettes.dark);
```

Also deep-check both five-stop flare tuples and verify the dark palette remains byte-for-byte equivalent to its current values.

- [ ] **Step 2: Run the palette test and confirm it fails**

Run: `npm test -- src/features/business-flow-palette.test.ts`

Expected: FAIL because only the singleton dark palette exists.

- [ ] **Step 3: Refine the light JSON tokens and export both typed palettes**

Use these light scene anchors:

```json
{
  "background": "#f3f5ef",
  "ground": "#e7ebe2",
  "fog": "#f3f5ef",
  "gridMajor": "#8fa092",
  "gridMinor": "#a7b5a8",
  "icon": "#182019",
  "card": "#cfe0cf",
  "cardHighlight": "#f8faf5",
  "cardShadow": "#9cac9d",
  "cardSide": "#a9c1aa",
  "cardSideHighlight": "#e9f2e8",
  "cardSideMid": "#91ad94",
  "cardSideShadow": "#5f7863",
  "edge": "#26342a",
  "connector": "#33453a",
  "junction": "#edf2e9"
}
```

Keep signal/beam green luminous. Use deeper progress/label greens where text-size contrast requires them. Construct each `BusinessFlowPalette` from its matching JSON theme plus theme-specific node gradients; do not alias or mutate the imported JSON.

- [ ] **Step 4: Run palette/config regressions and commit**

Run: `npm test -- src/features/business-flow-palette.test.ts src/features/business-flow-3d/scene/createSignalFlowScene.test.ts`

Run: `npm run typecheck`

Expected: PASS and unchanged dark assertions.

```bash
git add src/data/colors.json src/features/business-flow-palette.ts src/features/business-flow-palette.test.ts
git commit -m "feat: add typed light workflow palette"
```

---

### Task 5: Theme inheritance in reusable WebGL elements

**Files:**
- Modify: `src/components/elements/Node3D/types.ts`
- Modify: `src/components/elements/Node3D/Node3D.tsx`
- Modify: `src/components/elements/Node3D/Node3D.test.tsx`
- Modify: `src/components/elements/Beam3D/types.ts`
- Modify: `src/components/elements/Beam3D/Beam3D.tsx`
- Modify: `src/components/elements/Connector3D/types.ts`
- Modify: `src/components/elements/Connector3D/Connector3D.tsx`
- Modify: `src/components/elements/FlowLayer3D/types.ts`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.tsx`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx`
- Modify: `src/components/elements/FlowLayer3D/createFlowLayer3DScene.ts`

**Interfaces:**
- Consumes: `useResolvedTheme(explicitMode?)` and `getBusinessFlowPalette(resolvedMode)`.
- Produces: optional `mode?: ResolvedTheme` on Connector3D and FlowLayer3D; existing Node3D/Beam3D mode props retain the same public union.
- Changes: `FlowLayer3DNodeStyle.mode` becomes optional; the component always passes a resolved mode into scene creation.

- [ ] **Step 1: Add failing context/override tests for every low-level element**

Mock each scene constructor and capture options. For Node3D, Beam3D, Connector3D, and FlowLayer3D, cover:

```tsx
render(<ThemeProvider preference="light"><Node3D /></ThemeProvider>);
expect(createNode3DScene).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'light' }));

render(<ThemeProvider preference="light"><Node3D mode="dark" /></ThemeProvider>);
expect(createNode3DScene).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'dark' }));
```

Assert the default outside a provider is dark, light defaults come from `businessFlowPalettes.light`, and rerendering the provider destroys the old controller once before constructing a replacement.

- [ ] **Step 2: Run focused tests and confirm they fail**

Run: `npm test -- src/components/elements/Node3D/Node3D.test.tsx src/components/elements/FlowLayer3D/FlowLayer3D.test.tsx`

Expected: FAIL because components still freeze singleton dark defaults.

- [ ] **Step 3: Resolve mode before deriving optional defaults**

Stop assigning theme-dependent defaults in parameter destructuring. Follow this pattern in all four components:

```tsx
export function Node3D({ mode: explicitMode, ...props }: Node3DProps) {
  const mode = useResolvedTheme(explicitMode);
  const palette = getBusinessFlowPalette(mode);
  const frontGradientStartColor = props.frontGradientStartColor ?? palette.frontGradient.start;
  const frontGradientMidColor = props.frontGradientMidColor ?? palette.frontGradient.mid;
  const frontGradientEndColor = props.frontGradientEndColor ?? palette.frontGradient.end;
}
```

Add `data-mode={mode}` to reusable roots. Connector3D uses its palette connector color but keeps its transparent canvas. FlowLayer3D resolves `nodeStyle.mode ?? mode`, uses the matching palette in its DOM error fallback, and sends a complete `nodeStyle` to `createFlowLayer3DScene`.

- [ ] **Step 4: Remove hard-coded dark scene paths and protect stale initialization**

In `createFlowLayer3DScene.ts`, replace the hard-coded `mode: 'dark'` with the already-resolved `nodeStyle.mode`, and derive flare stops from `getBusinessFlowPalette(nodeStyle.mode)`. Preserve the existing mounted/stale guards so a mode change disposes a late scene result instead of attaching it.

- [ ] **Step 5: Run low-level suites and commit**

Run: `npm test -- src/components/elements/Node3D src/components/elements/Beam3D src/components/elements/Connector3D src/components/elements/FlowLayer3D`

Run: `npm run typecheck`

Expected: PASS with existing geometry, progress, disposal, and runtime behavior unchanged.

```bash
git add src/components/elements/Node3D src/components/elements/Beam3D src/components/elements/Connector3D src/components/elements/FlowLayer3D
git commit -m "feat: inherit theme in reusable webgl elements"
```

---

### Task 6: Theme inheritance in feature flows and homepage presets

**Files:**
- Modify: `src/features/business-flow-3d/types.ts`
- Modify: `src/features/business-flow-3d/components/BusinessFlow3D.tsx`
- Modify: `src/features/business-flow-3d/components/BusinessFlow3D.test.tsx`
- Modify: `src/features/business-flow-3d/presets.ts`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.tsx`
- Modify: `src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx`
- Modify: `src/features/business-flow-horizontal/presets.ts`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.tsx`
- Modify: `src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx`
- Modify: `src/features/business-flow-vertical/components/PillarIcon.tsx`
- Modify: `src/features/business-flow-vertical/presets.ts`
- Modify: `src/features/business-core-node-flow/components/BusinessCoreNodeFlow.tsx`
- Modify: `src/features/business-core-node-flow/components/BusinessCoreNodeFlow.test.tsx`
- Modify: `src/features/business-core-node-flow/presets.ts`
- Modify: `src/features/homepage-illustration-presets.contract.test.ts`
- Modify: `.storybook/homepagePresetContract.test.ts`

**Interfaces:**
- Consumes: the Task 4 palettes and Task 5 FlowLayer3D mode contract.
- Produces: optional `mode?: ResolvedTheme` on horizontal, vertical, and core feature props; BusinessFlow3D retains its existing optional mode.
- Homepage presets preserve layout/runtime/timing values but omit `mode` and all palette-derived color props so context can flow through.

- [ ] **Step 1: Write failing feature inheritance and override tests**

Extend the existing FlowLayer3D/scene mocks and assert each feature resolves light from context, dark outside a provider, and explicit dark over a light provider. For example:

```tsx
render(<ThemeProvider preference="light"><BusinessFlowHorizontal /></ThemeProvider>);
expect(capturedNodeStyle).toMatchObject({ mode: 'light' });
expect(capturedConnector?.color).toBe(businessFlowPalettes.light.connector);

render(<ThemeProvider preference="light"><BusinessFlowHorizontal mode="dark" /></ThemeProvider>);
expect(capturedNodeStyle).toMatchObject({ mode: 'dark' });
```

For BusinessFlow3D, assert the captured scene `theme` equals `defaultColors.light`, an explicit dark prop wins, and changing provider mode destroys/recreates once. Add a stale async import test that resolves the first scene factory after the preference changes and verifies the stale controller is destroyed.

- [ ] **Step 2: Run feature tests and confirm they fail**

Run: `npm test -- src/features/business-flow-3d/components/BusinessFlow3D.test.tsx src/features/business-flow-horizontal/components/BusinessFlowHorizontal.test.tsx src/features/business-flow-vertical/components/BusinessFlowVertical.test.tsx src/features/business-core-node-flow/components/BusinessCoreNodeFlow.test.tsx`

Expected: FAIL because defaults and presets force dark palette values.

- [ ] **Step 3: Resolve feature palettes after props are known**

Add `mode?: ResolvedTheme` to the three FlowLayer-based feature prop types and follow this exact precedence:

```tsx
const mode = useResolvedTheme(explicitMode);
const palette = getBusinessFlowPalette(mode);
const beamColor = beamColorProp ?? palette.beam;
const connectorColor = connectorColorProp ?? palette.connector;
const nodeStyle = useMemo(() => ({
  mode,
  frontGradient: { angle: 117, ...palette.frontGradient },
  sideXGradient: { angle: 360, ...palette.sideXGradient },
  sideZGradient: { angle: 177, ...palette.sideZGradient },
  assetBasePath: '/assets/nodes',
  nodeCornerRadius: 10,
  outlineOpacity: 0,
  outlineWidth: 1,
  progressBarHeight: nodeProgressSize,
  progressMaxDelay: nodeProgressMaxDelay,
  progressMinDelay: nodeProgressMinDelay,
  progressMode: nodeProgressMode,
  progressPadding: 1,
}), [mode, nodeProgressMaxDelay, nodeProgressMinDelay, nodeProgressMode, nodeProgressSize, palette]);
```

Pass `mode` to FlowLayer3D. Update PillarIcon so its defaults are passed from the resolved parent rather than importing the singleton dark palette.

For BusinessFlow3D, rename the destructured prop to `mode: explicitMode`, compute `mode = useResolvedTheme(explicitMode)`, then derive theme-dependent connector/icon defaults. Preserve its internal explicit mode callback API: `onModeChange` receives a user-selected light/dark value; it does not change the global preference itself.

- [ ] **Step 4: Make homepage presets structural rather than dark-colored**

Remove `mode` and these palette-derived fields from presets: icon/fill colors, beam/highlight colors, connector/grid colors, and node front/side gradient colors. Retain exact activity, sizing, camera, topology, opacity, timing, and resolution values. Update the two preset contract suites to assert that theme-derived keys are absent while all structural keys remain stable.

- [ ] **Step 5: Run feature and homepage regressions and commit**

Run: `npm test -- src/features/business-flow-3d src/features/business-flow-horizontal src/features/business-flow-vertical src/features/business-core-node-flow src/features/homepage-illustration-presets.contract.test.ts .storybook/homepagePresetContract.test.ts`

Run: `npm run typecheck`

Expected: PASS; no homepage preset forces `mode: 'dark'` or singleton colors.

```bash
git add src/features .storybook/homepagePresetContract.test.ts
git commit -m "feat: inherit theme in workflow features"
```

---

### Task 7: Storybook three-state theme integration

**Files:**
- Modify: `.storybook/preview.ts`
- Modify: `src/components/elements/Node3D/Node3D.stories.tsx`
- Modify: `src/components/elements/Beam3D/Beam3D.stories.tsx`
- Modify: `src/components/elements/Connector3D/Connector3D.stories.tsx`
- Modify: `src/components/elements/FlowLayer3D/FlowLayer3D.stories.tsx`
- Modify: `src/features/business-flow-3d/stories/BusinessFlow3D.stories.tsx`
- Modify: `src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.tsx`
- Modify: `src/features/business-flow-vertical/stories/BusinessFlowVertical.stories.tsx`
- Modify: `src/features/business-core-node-flow/stories/BusinessCoreNodeFlow.stories.tsx`
- Modify: `src/components/site/SiteHeader.stories.tsx`
- Modify: `src/components/marketing/MarketingStories.test.ts`

**Interfaces:**
- Consumes: controlled `ThemeProvider preference={context.globals.theme}`.
- Produces: Storybook global `theme: ThemePreference`, initial value `system`, and a decorator that scopes matching data attributes/background to every canvas.

- [ ] **Step 1: Write failing Storybook source-contract assertions**

Extend `MarketingStories.test.ts` to import/inspect preview and story metadata:

```ts
expect(preview.globalTypes?.theme?.toolbar?.items).toEqual([
  expect.objectContaining({ value: 'system', title: 'System' }),
  expect.objectContaining({ value: 'light', title: 'Light' }),
  expect.objectContaining({ value: 'dark', title: 'Dark' }),
]);
expect(preview.initialGlobals).toMatchObject({ theme: 'system' });
```

Assert foundation WebGL story defaults omit `mode`, while named fixed-mode comparison stories still specify it.

- [ ] **Step 2: Run the Storybook contract and confirm it fails**

Run: `npm test -- src/components/marketing/MarketingStories.test.ts`

Expected: FAIL because preview has no theme global/provider.

- [ ] **Step 3: Add the global toolbar and provider decorator**

Use Storybook's object toolbar items and pass the selected preference into the shared provider:

```ts
globalTypes: {
  theme: {
    description: 'Theme preference',
    toolbar: {
      icon: 'mirror',
      items: [
        { value: 'system', title: 'System' },
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
},
initialGlobals: { theme: 'system' },
decorators: [
  (Story, context) => createElement(
    ThemeProvider,
    { preference: context.globals.theme as ThemePreference },
    createElement('div', { className: 'storybook-fonts' }, createElement(Story)),
  ),
],
```

Ensure the preview wrapper receives the resolved data attribute/background through the provider document contract; do not attempt to theme Storybook manager chrome.

- [ ] **Step 4: Change foundation stories to inherit and retain explicit comparison stories**

Delete default `mode: 'dark'` values from ordinary story args and argTypes defaults. Keep explicit mode only in stories whose title/purpose is Light, Dark, or side-by-side comparison. Ensure the SiteHeader story renders inside the global provider and its control reflects the toolbar preference.

- [ ] **Step 5: Run tests and the production Storybook build, then commit**

Run: `npm test -- src/components/marketing/MarketingStories.test.ts src/features/business-flow-horizontal/stories/BusinessFlowHorizontal.stories.test.tsx src/features/business-core-node-flow/stories/BusinessCoreNodeFlow.stories.test.tsx`

Run: `npm run build-storybook`

Expected: PASS and static Storybook build completes with no missing globals or WebGL story errors.

```bash
git add .storybook/preview.ts src/**/*.stories.tsx src/components/marketing/MarketingStories.test.ts
git commit -m "feat: add system light dark storybook themes"
```

---

### Task 8: Theme-aware mobile workflow fallbacks and real light assets

**Files:**
- Create: `src/components/media/MobileWorkflowFallback.test.tsx`
- Modify: `src/components/media/MobileWorkflowFallback.tsx`
- Modify: `src/app/_components/HomepageHero.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`
- Modify: `src/app/contact/ContactInquiry.tsx`
- Modify: `src/app/contact/page.test.tsx`
- Modify: `src/app/waitlist/WaitlistInquiry.tsx`
- Modify: `src/app/waitlist/page.test.tsx`
- Create: `public/images/workflows/mobile/hero-flow-light.png`
- Create: `public/images/workflows/mobile/hero-flow-light@2x.png`
- Create: `public/images/workflows/mobile/hero-flow-light@3x.png`
- Create: `public/images/workflows/mobile/pillars-flow-light.png`
- Create: `public/images/workflows/mobile/pillars-flow-light@2x.png`
- Create: `public/images/workflows/mobile/pillars-flow-light@3x.png`
- Create: `public/images/workflows/mobile/delivery-flow-light.png`
- Create: `public/images/workflows/mobile/delivery-flow-light@2x.png`
- Create: `public/images/workflows/mobile/delivery-flow-light@3x.png`
- Create: `public/images/workflows/mobile/contact-core-flow-light.png`
- Create: `public/images/workflows/mobile/contact-core-flow-light@2x.png`
- Create: `public/images/workflows/mobile/contact-core-flow-light@3x.png`
- Create: `public/images/workflows/mobile/waitlist-core-flow-light.png`
- Create: `public/images/workflows/mobile/waitlist-core-flow-light@2x.png`
- Create: `public/images/workflows/mobile/waitlist-core-flow-light@3x.png`

**Interfaces:**
- Consumes: `useResolvedTheme(mode?)`.
- Changes: `MobileWorkflowFallbackProps` replaces `src` with `darkSrc`, `lightSrc`, and optional `mode?: ResolvedTheme`.
- Retains: `alt`, `children`, `className`, `fill`, `fit`, `height`, `name`, and `width` unchanged.

- [ ] **Step 1: Write failing source-selection tests**

Mock mobile `matchMedia`, render under each controlled preference, and assert:

```tsx
render(
  <ThemeProvider preference="light">
    <MobileWorkflowFallback
      alt="Workflow"
      darkSrc="/dark.png"
      lightSrc="/light.png"
      height={100}
      name="test"
      width={200}
    ><span>webgl</span></MobileWorkflowFallback>
  </ThemeProvider>,
);
expect(screen.getByRole('img')).toHaveAttribute('src', '/light.png');
expect(screen.getByRole('img')).toHaveAttribute(
  'srcset',
  '/light.png 1x, /light@2x.png 2x, /light@3x.png 3x',
);
```

Also assert dark, System-resolved light, explicit mode override, desktop child rendering, unchanged dimensions/aspect ratio, and live switching without remounting the picture.

- [ ] **Step 2: Run fallback and route tests and confirm they fail**

Run: `npm test -- src/components/media/MobileWorkflowFallback.test.tsx src/app/page.test.tsx src/app/contact/page.test.tsx src/app/waitlist/page.test.tsx`

Expected: FAIL because only one `src` is supported.

- [ ] **Step 3: Implement theme-specific source resolution**

```tsx
const resolvedMode = useResolvedTheme(mode);
const src = resolvedMode === 'light' ? lightSrc : darkSrc;
```

Keep the existing density-source function, desktop subscription, intrinsic dimensions, fill/fit behavior, decoding, drag prevention, and alt semantics unchanged.

- [ ] **Step 4: Update all five consumers and their route assertions**

Use the current filename as `darkSrc` and the matching `-light.png` filename as `lightSrc`. Update page tests to assert both complete 1x/2x/3x families, while retaining existing mobile fallback names and dimensions.

- [ ] **Step 5: Capture the five real light illustrations at 3x**

Run the dev server, force stored preference `light`, and use the in-app Browser at the exact existing mobile CSS widths. Wait for `data-flow-state="ready"`, freeze deterministic animation progress where the component already exposes controls, and capture transparent/correct-paper crops from the actual rendered scenes:

- hero: 1170×2340 for a 390×780 CSS target;
- pillars: 1080×1080 for a 360×360 CSS target;
- delivery: 1080×1824 for a 360×608 CSS target;
- contact core: 528×528 for a 176×176 CSS target;
- waitlist core: 528×528 for a 176×176 CSS target.

Save these as each `@3x` file. Downsample with macOS `sips`, preserving alpha and aspect ratio:

```bash
sips -z 780 390 public/images/workflows/mobile/hero-flow-light@3x.png --out public/images/workflows/mobile/hero-flow-light.png
sips -z 1560 780 public/images/workflows/mobile/hero-flow-light@3x.png --out public/images/workflows/mobile/hero-flow-light@2x.png
sips -z 360 360 public/images/workflows/mobile/pillars-flow-light@3x.png --out public/images/workflows/mobile/pillars-flow-light.png
sips -z 720 720 public/images/workflows/mobile/pillars-flow-light@3x.png --out public/images/workflows/mobile/pillars-flow-light@2x.png
sips -z 608 360 public/images/workflows/mobile/delivery-flow-light@3x.png --out public/images/workflows/mobile/delivery-flow-light.png
sips -z 1216 720 public/images/workflows/mobile/delivery-flow-light@3x.png --out public/images/workflows/mobile/delivery-flow-light@2x.png
sips -z 176 176 public/images/workflows/mobile/contact-core-flow-light@3x.png --out public/images/workflows/mobile/contact-core-flow-light.png
sips -z 352 352 public/images/workflows/mobile/contact-core-flow-light@3x.png --out public/images/workflows/mobile/contact-core-flow-light@2x.png
sips -z 176 176 public/images/workflows/mobile/waitlist-core-flow-light@3x.png --out public/images/workflows/mobile/waitlist-core-flow-light.png
sips -z 352 352 public/images/workflows/mobile/waitlist-core-flow-light@3x.png --out public/images/workflows/mobile/waitlist-core-flow-light@2x.png
```

Inspect all fifteen files and verify their pixel dimensions with `sips -g pixelWidth -g pixelHeight public/images/workflows/mobile/*-light*.png`.

- [ ] **Step 6: Run fallback/route tests and commit**

Run: `npm test -- src/components/media/MobileWorkflowFallback.test.tsx src/app/page.test.tsx src/app/contact/page.test.tsx src/app/waitlist/page.test.tsx`

Expected: PASS for light/dark source selection and density families.

```bash
git add src/components/media src/app public/images/workflows/mobile
git commit -m "feat: add light mobile workflow fallbacks"
```

---

### Task 9: Clean and verify the revised brand symbol SVG

**Files:**
- Modify: `public/brand/kipory-symbol-vector.svg`
- Modify: `src/app/brand-assets.test.ts`

**Interfaces:**
- Consumes: the currently modified Illustrator export as source artwork.
- Produces: one standalone symbol with viewBox `0 0 42.7 40.2`, three named gradients/paths, and accessible title metadata.

- [ ] **Step 1: Write failing production-asset assertions**

```ts
expect(svg).toContain('viewBox="0 0 42.7 40.2"');
expect(svg).toContain('<title id="kipory-symbol-title">Kipory</title>');
expect(svg).toContain('aria-labelledby="kipory-symbol-title"');
expect(svg.match(/<polygon\b/g)).toHaveLength(3);
expect(svg).not.toMatch(/Adobe Illustrator|<symbol\b|<use\b|xlink:href|translate\(/);
expect(svg).not.toMatch(/<path\b/);
```

Also assert exactly three linear gradients and both approved stop colors `#449c40` and `#2f702c`.

- [ ] **Step 2: Run the asset test and confirm it fails**

Run: `npm test -- src/app/brand-assets.test.ts`

Expected: FAIL against the current oversized Illustrator export.

- [ ] **Step 3: Replace export debris with the exact visible symbol**

Keep these supplied visible polygons exactly:

```xml
<polygon fill="url(#kipory-left)" points="12.1 30.2 12.1 .8 .1 10.6 0 39.7 12.1 30.2" />
<polygon fill="url(#kipory-lower)" points="42.7 40.2 25.2 37.1 12.5 20.1 27.6 20.1 42.7 40.2" />
<polygon fill="url(#kipory-upper)" points="42.7 0 24.8 3.8 12.5 20.1 27.6 20.1 42.7 0" />
```

Retain the revised gradient direction through simple `gradientUnits="userSpaceOnUse"` coordinates, remove all off-canvas wordmarks/alternate lockups/styles/editor comments, add `role="img"`, `aria-labelledby`, and the title. Compare the cleaned render against the first visible symbol of the supplied export at high zoom.

- [ ] **Step 4: Run brand/header tests and commit**

Run: `npm test -- src/app/brand-assets.test.ts src/components/site/SiteNavigation.test.tsx src/components/site/SiteHeader.test.tsx`

Expected: PASS and the header continues referencing `/brand/kipory-symbol-vector.svg`.

```bash
git add public/brand/kipory-symbol-vector.svg src/app/brand-assets.test.ts
git commit -m "chore: clean production brand symbol svg"
```

---

### Task 10: Browser QA, accessibility, builds, and final cleanup

**Files:**
- Modify only files implicated by verified regressions from this task.

**Interfaces:**
- Consumes: all earlier task deliverables.
- Produces: verified release-ready feature with no generated Storybook/Next artifacts staged.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Run: `npm run typecheck`

Run: `npm run lint`

Expected: all commands exit 0.

- [ ] **Step 2: Run both production builds**

Run: `npm run build`

Run: `npm run build-storybook`

Expected: both builds exit 0 with no hydration, metadata, CSS, or missing-asset errors.

- [ ] **Step 3: Inspect all routes in every preference**

At desktop 1440×900 and mobile 390×844, inspect `/`, `/contact`, and `/waitlist` in System, Light, and Dark. For each state:

- reload and confirm root attributes are correct before visible content;
- watch the browser console through initial load, navigation, and theme changes;
- check header layout/focus, hero gradients, alternating sections, forms, success states, footer, live WebGL, and mobile fallbacks;
- emulate an OS preference change and verify only System responds;
- reload explicit Light and Dark and verify persistence;
- use a second tab to verify storage-event synchronization;
- emulate reduced motion and reduced transparency;
- inspect 200% zoom and keyboard-only navigation.

- [ ] **Step 4: Measure contrast and visual parity**

Measure actual rendered foreground/background pairs for primary text, secondary/muted text, green eyebrow/link text, selected theme segments, CTA text, inputs, focus rings, and status text. Require at least 4.5:1 for normal text, 3:1 for large text and graphical controls. Compare dark screenshots to the pre-feature baseline and reject unintended dark palette or layout changes.

- [ ] **Step 5: Inspect WebGL resource changes and fallbacks**

Switch theme repeatedly while hero and lower workflows are active. Verify one scene teardown/rebuild per resolved change, no growing canvas/CSS3D count, no stale scene flash, no WebGL context warnings, and unchanged camera/topology/timing. Force scene failure and confirm the DOM/raster fallback matches the active theme.

- [ ] **Step 6: Verify repository cleanliness and commit QA fixes if any**

Run: `git diff --check`

Run: `git status --short`

Expected: only intended source/assets are present; `.next/`, `storybook-static/`, and `.superpowers/` remain ignored. If QA required code changes, rerun their focused tests plus Steps 1–2 and commit them:

Inspect `git status --short`, stage each QA-modified path individually, and run `git commit -m "fix: polish light theme integration"`.

If no QA changes are needed, do not create an empty commit.
