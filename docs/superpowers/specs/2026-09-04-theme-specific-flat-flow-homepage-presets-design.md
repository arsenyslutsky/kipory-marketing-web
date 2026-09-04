# Theme-Specific Flat-Flow Homepage Presets Design

## Summary

The horizontal and vertical `Current App (Dark)` and `Current App (Light)` Storybook stories will each own a complete, theme-specific homepage preset. Every visible control in those stories will show the effective value rendered on the landing page and will be eligible for **Save to Next.js**. The landing page will select the matching preset at runtime through small client wrappers, following the established `HomepageBusinessFlow3D` pattern.

This replaces the current shared structural preset used by both themes. That shared preset leaves palette and node-shadow props undefined so the illustration component can derive them internally. Storybook cannot display those derived values: optional range controls fall back to their minimums, producing misleading values such as `-20`, `0`, and `1`. Changing one of those controls also creates an override that is not included in the persistent preset keys.

## Goals

- Make every visible Current App control truthful: its value must equal the value currently rendered by the landing page.
- Make every editable Current App control durable through **Save to Next.js**.
- Allow the horizontal and vertical Light and Dark variants to be tuned independently.
- Keep the landing page synchronized with the corresponding saved preset after reload and during theme changes.
- Preserve the existing Foundation stories as exploratory, theme-inheriting component playgrounds.
- Keep `src/app/page.tsx` a Server Component.

## Non-goals

- Do not change the approved illustration appearance while migrating values into explicit presets.
- Do not change the Storybook persistence protocol, endpoint security model, or TypeScript source writer.
- Do not make arbitrary or non-homepage stories writable.
- Do not persist `className`, callbacks, React elements, or the Storybook theme global.
- Do not change mobile fallback images as part of this migration.

## Considered Approaches

### 1. Hide derived controls in Current App stories

This would remove the misleading values and keep the shared theme-aware component defaults. It is the smallest change, but it prevents the user from tuning or saving shadow and palette settings from the Current App stories. It does not satisfy the requirement that changes made in those stories propagate to the landing page.

### 2. Populate derived values only in Storybook

This would make the controls look correct, but the additional values would not belong to the persistent homepage preset. The preview could diverge from the landing page after a save, which is worse than hiding the controls.

### 3. Theme-specific presets selected by the landing page — selected

Each Light and Dark story receives a complete preset, and the landing page selects the same object through the resolved theme. The existing 3D homepage illustration already uses this pattern successfully. It introduces two small client wrappers and duplicates the flat serializable preset objects, but creates a direct and testable source of truth for each theme.

## Preset Contract

The horizontal feature will export:

- `businessFlowHorizontalHomepageDarkProps`
- `businessFlowHorizontalHomepageLightProps`

The vertical feature will export:

- `businessFlowVerticalHomepageDarkProps`
- `businessFlowVerticalHomepageLightProps`

Each export remains a flat object literal satisfying its component prop type. Flat literals are required by the existing safe Storybook source writer. The Dark and Light objects will initially preserve the same structural, timing, topology, and layout values. They will differ only where the effective landing-page rendering currently differs by theme.

Theme-derived color and treatment values will be explicit preset properties. Untouched palette-backed values may use static property-access expressions from `businessFlowPalettes` or `businessFlowHeroTreatments`; the source writer already preserves those expressions until that particular control is changed. When a user changes a control, the saved literal becomes the intentional override.

The node-shadow controls will start with the effective values currently used by the flat-flow renderer:

- bias: `-0.0003`
- blur samples: `16`
- color: the active palette's node-shadow color
- light X/Y/Z: `-6 / 14 / -5`
- normal bias: `0.025`
- radius: `8`
- opacity: `0.5` in Dark and `0.38` in Light

The presets will likewise make the currently derived icon, gradient, connector, beam, and grid colors explicit so their Storybook controls are accurate and saveable.

## Landing-Page Theme Selection

Two client components will mirror the existing `HomepageBusinessFlow3D` boundary:

- `HomepageBusinessFlowHorizontal`
- `HomepageBusinessFlowVertical`

Each wrapper will call `useResolvedTheme()`, select the matching feature preset, and render the underlying flow component with both the selected preset and explicit `mode`. The vertical wrapper will forward the homepage illustration `className`; the horizontal wrapper requires no additional page-owned props initially.

`src/app/page.tsx` will render these wrappers inside the existing `MobileWorkflowFallback` boundaries. The page itself remains a Server Component, and only plain preset values cross into the client wrappers through module imports rather than Server Component props.

Theme changes will rerender the wrapper and switch presets immediately. The underlying illustration already rebuilds its scene when `mode` or visual props change and retains its existing cleanup behavior.

## Storybook Behavior

The existing story IDs remain stable:

- `animated-illustrations-businessflowhorizontal--current-nextjs-app` → horizontal Dark preset
- `animated-illustrations-businessflowhorizontal--current-app-light` → horizontal Light preset
- `animated-illustrations-businessflowvertical--current-nextjs-app` → vertical Dark preset
- `animated-illustrations-businessflowvertical--current-app-light` → vertical Light preset

Each Current App story will:

1. pin the Storybook theme global to its named theme;
2. provide the corresponding complete preset as args;
3. explicitly pass the matching `mode` for deterministic rendering;
4. register exactly the preset object's keys as `homepagePreset.keys`;
5. hide non-persistent implementation props such as `className`, the legacy `color` alias, and direct `mode` editing.

The Foundation stories will continue to expose the broader component API and inherit the global theme. They are not writable homepage stories.

After implementation, the browser will be returned to the canonical Light story URL without stale `args` overrides. Existing shared or copied URLs containing old shadow overrides will continue to apply those URL overrides until the query is removed, which is standard Storybook behavior.

## Save-to-Next.js Mapping

The Storybook server registry will map Dark and Light IDs to their corresponding exports rather than mapping both IDs to one shared export. The endpoint, request schema, validation, atomic rewrite, and local-only security checks remain unchanged.

The data flow becomes:

```text
Current App (Dark) controls
    -> Dark preset export
    -> homepage theme wrapper when resolved theme is Dark

Current App (Light) controls
    -> Light preset export
    -> homepage theme wrapper when resolved theme is Light
```

A save changes only the selected theme's export. Shared structural values are duplicated intentionally so a future theme-specific tuning change cannot silently alter the other appearance.

## Migration and Compatibility

The ambiguous `businessFlowHorizontalHomepageProps` and `businessFlowVerticalHomepageProps` exports will be replaced by the explicit Dark and Light names throughout the repository. Keeping aliases would preserve an unclear source of truth and make future imports prone to selecting the wrong theme.

All page tests, story tests, preset contract tests, source-target tests, and mocks will migrate to the paired exports and wrapper boundaries. No public route or user-facing component name changes.

## Error Handling

The existing save behavior remains authoritative:

- only registered story IDs can write;
- only keys already present in the target preset can be changed;
- invalid types and non-finite values are rejected;
- writes remain atomic;
- the toolbar reports `Saving`, `Saved`, `Save failed`, or `Save unavailable`.

Because every Current App control key will now exist in its target preset, a visible editable control cannot be silently omitted from a save.

## Testing Strategy

Implementation will follow test-driven development.

1. Preset contract tests will first require four explicit exports, complete theme-derived values, and identical non-theme structural values.
2. Wrapper tests will require Dark and Light theme resolution to pass the exact corresponding preset and explicit mode.
3. Landing-page tests will require the server page to use the new wrappers and remain free of a `'use client'` directive.
4. Story tests will require each named story to consume its matching preset, pin the correct theme, hide non-persistent props, and expose only saveable editable controls.
5. Source registry tests will require each of the four story IDs to map to the correct export.
6. Middleware/source tests will save one representative shadow value through both Light and Dark IDs and prove that only the targeted export changes.
7. Browser verification will confirm that node-shadow controls show the effective values, each toolbar reaches `Saved`, refresh retains the saved value, and the corresponding landing-page theme updates.

Final verification will run the focused tests, full test suite, typecheck, lint, Next.js production build, Storybook production build, the Impeccable detector on changed UI files, and bounded browser checks for both themes.

## Acceptance Criteria

- Horizontal and vertical Current App Light stories show the actual Light landing-page shadow values rather than Storybook range minimums.
- Dark stories show the actual Dark landing-page values.
- Every editable control displayed in a Current App story is included in that story's persistent preset keys.
- Saving Light never changes Dark, and saving Dark never changes Light.
- Reloading Storybook retains the saved value.
- Switching the landing page between Light and Dark selects the corresponding saved preset without a route reload.
- The Foundation stories remain available and theme-inheriting.
- The landing page remains a Server Component and mobile fallback behavior is unchanged.
- Focused and full automated verification passes, and the canonical Storybook URLs contain no verification-only overrides.
