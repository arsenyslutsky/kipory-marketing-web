# Protocol Icon List Design

## Goal

Create a reusable `ProtocolIconList` component that renders caller-selected protocol logos and their built-in names in the exact supplied order, with an optional title matching the supplied “Adjustable Surface” visual reference.

## Public API

```ts
type ProtocolIconListLayout = 'wrap' | 'scroll';

type ProtocolIconListProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  layout?: ProtocolIconListLayout;
  logoOpacity?: number;
  logoScale?: number;
  scaleOfSpaceItems?: number;
  scaleOfSpaceLogos?: number;
  size?: number;
  textOpacity?: number;
  textScale?: number;
  title?: ReactNode;
  titleOpacity?: number;
  titleScale?: number;
  variants: readonly ProtocolIconVariant[];
};
```

- `variants` accepts only the variants already supported by `ProtocolIcon` and preserves the array order exactly. Each variant is expected to appear at most once.
- `title` is optional and may contain formatted React content.
- `layout` defaults to `wrap`. `scroll` keeps every item on one row and enables horizontal overflow.
- `size` defaults to `48`, is passed to every child `ProtocolIcon` as its height, and proportionally scales the optional title, leading rule, and title-to-list spacing. Small-size floors preserve title legibility.
- `logoOpacity`, `textOpacity`, and `titleOpacity` independently control their named visual layers, default to `1`, and clamp to the standard CSS opacity range from `0` to `1`.
- `logoScale`, `textScale`, and `titleScale` independently multiply their size-derived baselines, default to `1`, and clamp from `0.5` to `1.5`.
- `scaleOfSpaceItems` multiplies the gap between protocol entries, while `scaleOfSpaceLogos` multiplies the gap between each logo and its visible name. Both default to `1` and clamp from `0.5` to `1.5`.
- Standard `HTMLAttributes<HTMLDivElement>` other than the native string-only `title` field allow consumers to provide an accessible label, class name, data attributes, and CSS custom properties without expanding the component API.

## Structure and Rendering

- The root is a neutral `div`; consumers determine the surrounding page section and heading hierarchy.
- When `title` is present, render it in a `p` before the list, matching the project’s eyebrow-label semantics without imposing a document heading level. The title remains optional without leaving empty spacing.
- Render the logos as a semantic `ul` with one `li` per variant.
- Each item renders `ProtocolIcon` with `withText`, using the icon’s built-in label and intrinsic width.
- An empty `variants` array renders an empty semantic list without throwing.

## Visual Design

- The component inherits foreground and background colors from its container.
- The title uses the existing accent font tokens, accent green, uppercase lettering, and wide tracking.
- A 56px leading rule and 22px line-to-title gap reproduce the supplied reference while using `currentColor` so theming remains coherent.
- The component does not draw the reference image’s grid; the grid belongs to the containing marketing surface.
- The title-to-list gap uses `--protocol-icon-list-title-gap` with a 32px fallback. The item gap uses `--protocol-icon-list-item-gap`; `size` scales it from a 12px floor to the existing 48px default ceiling, while page compositions may override the custom property to tune density without another React prop.
- `wrap` uses a flexible row that wraps naturally at narrow widths.
- `scroll` uses one non-wrapping row with horizontal overflow, touch momentum, and the project’s themed scrollbar treatment.

## Storybook

Add `Icons/ProtocolIconList` stories for:

- the default wrapped list with the reference title;
- the same ordered variants in scrolling mode;
- a list without a title.

Expose controls for `variants`, `title`, `layout`, `size`, the three opacity controls, the three visual scale controls, and the two spacing scale controls.

## Accessibility and Edge Cases

- Use native list semantics rather than an ARIA imitation.
- Child SVGs remain decorative because their built-in names are visible beside them.
- Horizontal scrolling must work with pointer, touch, trackpad, and keyboard-assisted browser scrolling.
- Do not truncate protocol names.
- TypeScript rejects unknown protocol names. Repeated variants are outside the supported input contract because variant names are the stable React keys.

## Verification

- Unit tests verify caller order, built-in labels, optional title behavior, both layout modes, propagated icon height, and empty input.
- Storybook tests verify the stories render the supported modes and exposed order.
- Browser inspection verifies the supplied title treatment, desktop wrapping, narrow-viewport wrapping, and narrow-viewport horizontal scrolling.
- Run the focused Vitest suite, full test suite, typecheck, lint, Storybook build, Impeccable detector, and `git diff --check`.
