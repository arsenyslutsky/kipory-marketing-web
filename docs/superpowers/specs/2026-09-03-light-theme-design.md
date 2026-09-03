# System-Aware Light Theme Design

## Summary

Kipory will gain a first-class light appearance built as a deliberate **Cold Paper Blueprint** adaptation of the existing dark site, not a mechanical color inversion. The dark appearance remains the visual baseline and should not regress. A shared theme contract will coordinate the Next.js application, the header control, Storybook, WebGL illustrations, and mobile workflow fallback images.

The user preference has three states: `system`, `light`, and `dark`. New visitors start in `system`; an explicit selection is stored locally, including a deliberate return to `system`. The resolved light/dark appearance is applied before first paint, follows operating-system changes only while the preference is `system`, and is available to React and Three.js consumers without reading presentation state from the DOM.

This work also incorporates the supplied revised logo SVG. Its visible symbol geometry and green gradient treatment will be preserved while removing the off-canvas Illustrator export material and restoring a compact, accessible production asset.

## Goals

- Add an authored light appearance across every public page and shared marketing component.
- Preserve the current dark appearance, layout, interaction hierarchy, and signal-green identity.
- Let users choose `system`, `light`, or `dark` and return to system behavior at any time.
- Prevent an incorrect-theme flash and avoid hydration mismatches.
- Give desktop and mobile header controls equally clear, accessible theme behavior.
- Make WebGL scenes inherit the resolved application theme while retaining explicit per-component overrides.
- Give Storybook the same three-state preference contract and theme-aware canvases.
- Provide genuine light variants of all mobile workflow fallback images.
- Clean the revised brand symbol SVG without changing its intended visible artwork.
- Maintain WCAG-appropriate contrast, reduced-motion behavior, keyboard access, and touch targets.

## Non-goals

- Do not redesign the dark theme or change its current composition.
- Do not add account-based or server-side preference synchronization.
- Do not create separate light and dark brand identities; the green symbol remains shared.
- Do not recolor raster workflow fallbacks with CSS filters.
- Do not remove explicit `light` or `dark` component overrides used for isolated testing.
- Do not change workflow topology, animation timing, copy, or page information architecture.
- Do not theme social preview images; they remain a stable brand artifact independent of the visitor preference.

## Approved Visual Direction

The light appearance uses a cool, tactile paper field with restrained blueprint structure.

- Base field: cool paper near `#f3f5ef`.
- Soft field: mineral paper near `#e7ebe2`.
- Alternate workflow field: pale sage near `#dfe9dd`.
- Primary ink: green-black near `#111511`.
- Secondary and muted copy: darker olive/graphite values selected by measured contrast, not opacity alone.
- Signal green: preserve the existing brand energy; use a deeper green for small text and a deep-green fill with cold-paper text for primary actions.
- Dividers and grids: low-opacity olive or graphite rather than neutral gray.
- Header: translucent paper with a restrained dark edge; stronger opaque fallback when reduced transparency is requested.
- WebGL: pale ground and fog, sage nodes, dark connectors, legible shadows, and the existing luminous green signal. The result should feel dimensional and technical, never like a washed-out white canvas.

Dark theme values remain unchanged unless a test exposes an existing accessibility defect directly involved in the new control.

## Theme Domain Contract

Introduce one shared theme domain with two distinct concepts:

```ts
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
```

The provider exposes:

```ts
type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
};
```

The cycle order is `system -> light -> dark -> system`. The local-storage key is stable and product-scoped. All three values, including `system`, are stored explicitly so returning to system preference is durable and inspectable. Missing, inaccessible, or invalid storage resolves to `system`.

`ResolvedTheme` is computed from the explicit preference or `matchMedia('(prefers-color-scheme: dark)')`. The provider listens for media-query changes only when the current preference is `system`, and listens for storage events so open Kipory tabs remain consistent. Storage and media-query failures degrade to a deterministic dark resolution without preventing rendering.

## First Paint and Hydration

The root layout includes a small inline pre-paint script based on the current Next.js guidance. Before React hydrates, it:

1. reads and validates the stored preference;
2. resolves `system` through `matchMedia`;
3. sets `data-theme="light|dark"` and `data-theme-preference="system|light|dark"` on the root element;
4. sets the root `color-scheme` and the page's theme-color metadata.

The root element uses `suppressHydrationWarning` only for these intentionally pre-hydration attributes. The React provider derives its initial state from the same contract and reconciles attributes after hydration. No component renders different structural markup solely from the resolved theme, preventing theme-dependent hydration divergence.

CSS includes a no-JavaScript fallback: when no explicit `data-theme` exists, `prefers-color-scheme` selects the corresponding token set. The canonical default remains dark when preference APIs are absent.

Theme transitions become active only after hydration through a readiness attribute, so the initial paint never animates between palettes. Subsequent changes use a short transition on color, background-color, border-color, fill, and shadow where appropriate. `prefers-reduced-motion: reduce` disables it.

## CSS Token Architecture

Add a semantic token layer rather than making components reason about light/dark values directly. The layer covers at least:

- base, soft, elevated, and alternate surfaces;
- primary, secondary, muted, and inverse text;
- default, strong, and interactive lines;
- signal, signal-strong, and on-signal colors;
- header surface, header edge, focus ring, selection, overlay, grid, and glow values;
- workflow ground, fog, node, connector, shadow, and label values.

Existing `--ink`, `--paper`, and related aliases remain temporarily mapped to semantic tokens so the migration can be incremental and low-risk. New and touched styles use semantic names. Theme-specific selectors belong in the global theme layer, not scattered across CSS modules; component modules continue to describe role and composition.

Light adaptations are authored per role:

- alternating sections use subtle shifts among paper, mineral, and pale sage rather than identical white blocks;
- gradients and masks that currently fade into dark ink receive light-theme equivalents that fade into the appropriate paper surface;
- shadows become broader and lower-contrast while retaining object separation;
- small green copy uses the contrast-safe strong signal color;
- primary filled controls use the strong signal background and on-signal paper text;
- focus states remain visible on both neutral and green surfaces;
- text and interactive state contrast is verified at its actual size and weight.

## Header Theme Control

The theme control sits in the persistent header without displacing the existing primary actions.

On desktop it is a three-segment control labeled as a group with visible `System`, `Light`, and `Dark` options. Each option uses an authored SVG monitor, sun, or moon icon and communicates selection with native button semantics plus `aria-pressed`. The selected state is not distinguished by color alone.

On compact layouts it becomes one 44-by-44-pixel button. Pressing it advances through the same three-state cycle. Its accessible label names the current preference and the next action, for example, “Theme: System. Switch to Light.” Its tooltip/title is supplementary, not the only label. The icon reflects the preference, so System retains the monitor icon even if the resolved appearance is currently dark.

Keyboard focus, hover, pressed, and selected treatments use shared tokens. The control remains usable under zoom, reduced transparency, and coarse pointers.

## WebGL Theme Integration

The existing light and dark data in `src/data/colors.json` becomes the source for two typed workflow palettes. The light values are refined to the approved Cold Paper Blueprint colors and contrast. The current dark values remain intact.

All public workflow components and reusable WebGL elements follow one precedence rule:

1. an explicit `mode: 'light' | 'dark'` prop wins;
2. otherwise, use the provider's `resolvedTheme`;
3. outside a provider, fall back to dark for backward compatibility and deterministic tests.

Components do not inspect root data attributes or register mutation observers. Client components consume the theme context, compute a typed palette from the resolved mode, and pass it into scene creation. Scene effects already rebuilt on relevant palette changes will reinitialize safely on a theme change; controller cleanup must release listeners, animation frames, DOM renderers, materials, textures, and WebGL resources before replacement.

Singleton dark defaults in the higher-level flow components and lower-level `Node3D`, `Beam3D`, `Connector3D`, and `FlowLayer3D` paths are replaced with mode-resolved defaults. Destructuring must not freeze colors before mode resolution. Homepage presets become structural presets or theme-aware palette factories so they do not force dark values into an inherited light scene.

Explicit mode props remain available in stories and consumers that need a fixed comparison. Theme resolution changes color only; it does not alter camera position, scene topology, render resolution, node geometry, timing, or interaction behavior.

## Mobile Workflow Fallbacks

The mobile experience currently replaces expensive WebGL scenes with dark raster screenshots. Every workflow therefore needs a real light counterpart:

- hero flow;
- pillars flow;
- delivery flow;
- contact core flow;
- waitlist core flow.

Each counterpart is captured from the actual themed component at the same deterministic camera, dimensions, and timing as its dark version, then exported at 1x, 2x, and 3x. This produces fifteen light assets. The light artwork uses the scene's paper/sage environment and is not post-processed with filters.

`MobileWorkflowFallback` accepts light and dark sources and consumes the resolved theme, while retaining an explicit override for deterministic use. It swaps the `src` and `srcset` as the resolved theme changes, preserves intrinsic dimensions and accessible labeling, and avoids layout shift. The dark filenames remain valid to minimize churn; light variants use a consistent suffix or directory convention.

## Storybook

Storybook defines a `theme` global with `system`, `light`, and `dark` values and matching monitor, sun, and moon toolbar entries. Its initial global is `system`.

The preview decorator wraps every story with the same theme provider contract, applies the resolved root data attributes to the preview container, and selects an appropriate canvas background. It listens to the host OS while Storybook's preference is `system`. Storybook manager chrome is not required to mirror the canvas theme.

Themeable stories inherit the global by default. Stories or controls that explicitly pass `mode="light"` or `mode="dark"` continue to override it. WebGL foundation stories should default to inheritance so switching the toolbar visibly exercises their integration. Dedicated fixed-mode comparison stories may remain explicit.

## Brand Symbol SVG

The revised `public/brand/kipory-symbol-vector.svg` is treated as approved source artwork for its visible symbol. The production cleanup will:

- retain the exact new visible path geometry, proportions, and green gradient stops;
- remove off-canvas wordmarks, alternate lockups, unused definitions, editor metadata, and Illustrator-only structure;
- reduce the view box to the visible symbol and retain responsive sizing behavior;
- add an accessible title where the SVG is used as meaningful content while allowing decorative presentation to remain hidden by the image component;
- preserve deterministic rendering in both themes without adding a theme-specific logo fork.

The cleaned asset is verified visually against the currently visible portion of the supplied SVG before replacement.

## Browser and Metadata Behavior

The resolved theme updates `color-scheme` so native controls match the site. It also updates the document theme-color metadata to a dark ink or light paper value, allowing supported mobile browser chrome to follow the page. These updates use the same palette constants as the theme domain and do not introduce a second source of truth.

Selection color, focus rings, scrollbars where styled, and form autofill treatments are checked in both appearances. The web manifest retains a stable brand color because manifest installation metadata cannot reliably track a runtime preference.

## Error Handling and Compatibility

- Invalid persisted values are ignored and replaced by `system` on the next selection.
- Local-storage read/write exceptions do not block the control or page rendering.
- Missing `matchMedia` resolves System to dark.
- Media-query observation uses `addEventListener('change', ...)` with the legacy `addListener`/`removeListener` pair as a compatibility fallback; cleanup is mandatory in either path.
- Cross-tab storage updates change both preference and resolved theme without writing back in a loop.
- WebGL theme reconstruction failures use the existing component fallback path and do not throw through the page.
- A theme change during asynchronous scene initialization invalidates the stale result; stale resources are disposed rather than attached.
- Static mobile fallback imagery remains available when WebGL, canvas, or scene initialization fails.
- Reduced motion disables theme transitions and preserves existing static workflow behavior.
- Reduced transparency replaces header backdrop blur with the stronger opaque theme surface.

## Testing Strategy

Development follows test-driven development: each behavioral change starts with a failing regression test.

Theme-domain unit tests cover:

- valid, missing, invalid, and inaccessible stored preferences;
- explicit persistence of all three states;
- system resolution and live operating-system changes;
- no OS-driven change under explicit light or dark preference;
- the three-state cycle order;
- cross-tab storage updates without feedback loops;
- document attributes, color-scheme, theme-color metadata, and listener cleanup.

Component tests cover:

- desktop segmented-control semantics and selection;
- mobile cycle control icon, 44-pixel target, accessible current/next-state label, and wraparound;
- root hydration attributes remaining structurally stable;
- theme-aware mobile `src` and `srcset` switching without geometry changes;
- explicit WebGL mode overriding context;
- inherited WebGL mode rebuilding once and disposing the prior scene;
- stale asynchronous scene cleanup during rapid theme changes;
- default dark behavior outside the provider.

Storybook tests or build assertions cover:

- the three global toolbar values and System default;
- provider propagation into ordinary and WebGL stories;
- explicit story mode overriding the global;
- successful static Storybook production output.

Visual verification covers every public route at desktop and mobile widths in dark, light, and System states. It specifically checks the header, hero gradients, alternating sections, form states, footer, each live WebGL illustration, each raster fallback, and the cleaned logo. Contrast is measured for primary copy, muted copy, links, control states, green labels, and button text.

Final verification runs focused tests, the complete unit suite, TypeScript, ESLint, the Next.js production build, the Storybook production build, and browser inspection with console monitoring. A reload is performed after each stored preference, and System mode is tested while the emulated OS preference changes.

## Acceptance Criteria

- A first-time visitor follows the operating-system appearance before the first visible paint.
- The user can select System, Light, or Dark and the exact preference survives reloads.
- System follows later OS changes; explicit Light and Dark do not.
- No incorrect-theme flash, hydration error, or initial palette transition occurs.
- Desktop shows a three-segment control; mobile shows one 44-pixel cycling control with a complete accessible label.
- Dark pages and dark WebGL scenes remain visually equivalent to the current production state.
- Light pages match the approved Cold Paper Blueprint direction and do not read as a simple inversion.
- All public WebGL components inherit the provider by default, explicit mode wins, and theme changes dispose and recreate scene resources safely.
- Storybook's System, Light, and Dark selections affect ordinary and WebGL canvases consistently.
- Every mobile workflow fallback has genuine light assets at 1x, 2x, and 3x, with no CSS filter recoloring or layout shift.
- The revised symbol renders identically to its approved visible artwork while containing no off-canvas export debris or unused editor data.
- Primary text, interactive controls, and status colors meet their applicable WCAG contrast requirements.
- Reduced-motion and reduced-transparency preferences remain honored.
- Focused tests, full tests, typecheck, lint, Next.js build, and Storybook build pass.
