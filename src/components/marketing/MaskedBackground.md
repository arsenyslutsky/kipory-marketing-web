# MaskedBackground

A decorative, theme-aware background shared by the landing page and six stories under **Marketing → Masked Background**: Light and Dark versions of Hero, Our Pillars, and Everything Your Team Needs. Each story pins its theme; the existing story URLs remain the Dark versions.

| Variant | Default mask and tint | Default grid |
| --- | --- | --- |
| `hero` | Inverted, stronger green | Existing 3D illustration grid; no extra flat grid |
| `pillars` | Inverted, stronger green | Dashed, opacity 0.4 |
| `delivery` | Centered, same stronger green as Pillars | Dashed, opacity 0.22 |

All three variants share the same theme-aware green gradient. Saved mask and grid parameters remain independent per section and override the component defaults above.

The component uses the existing image mask and feathering, with `maskWidth={85}`, `maskHeight={85}`, and `gridSize={20}` by default. Width and height independently scale the image and its soft feathering inside a full-section canvas; they do not resize the background, grid, or inversion canvas. `gridOpacity` can override the section default. Each story is locked to its section; there is no variant selector. Legacy component callers may still supply `maskSize` as a fallback for either omitted dimension, but stories and saved presets use width and height.

## Save to Next.js

Mask controls are shared by all six stories:

- `maskWidth` / `maskHeight`: independent dimensions from 50–500% of the section's width and height. These replace the single size slider; existing saved sizes have been copied to both dimensions.
- `maskShape`: `rectangle` (the existing feathered image mask) or `ellipsis` (a soft ellipse).
- `maskOpacity`: 0–1, fading the final masked tint and grid after inversion; 0 hides both without affecting content or the hero illustration.
- `maskCenterX` / `maskCenterY`: the actual shape center in section percentages, defaulting to 50/50. Position is independent of mask size, including at 100%; the inversion canvas stays fixed.

The defaults are rectangle, opacity 1, and center 50/50, preserving the existing appearance. The background is a size container so its mask layers resolve center offsets against section dimensions rather than the viewport.

The `invert` checkbox reverses the complete feathered mask for both the green tint and dashed grid. It defaults to `true` for Hero and Our Pillars, and `false` for Delivery. All six stories can save it to their section's shared Next.js preset. It does not change colors, grid spacing, or the hero illustration's own 3D grid.

Adjust the story controls, then click **Save to Next.js** in the Storybook toolbar. On the local development server this writes only the matching export in `MaskedBackground.presets.ts`. The landing page and both themed stories consume that export, so the saved changes appear in the app and survive reloads. Hero saves all mask controls; Pillars and Delivery also save grid size and grid opacity. Saved values apply to both Light and Dark; theme colors adapt automatically. Static/published Storybook builds cannot write source files.

```tsx
<MarketingSection grid={false} style={{ background: 'var(--surface-base)' }}>
  <MaskedBackground {...pillarsBackgroundHomepageProps} variant="pillars" />
  <SiteContainer>{/* Section content */}</SiteContainer>
</MarketingSection>
```

The containing section must have `position: relative`, `isolation: isolate`, and a base surface. `MarketingSection` already provides positioning and isolation; disable its grid to avoid duplicates. The landing page supplies its base surface through page CSS.

Hero requires the illustration below the background and content at `z-index: 2`. Its tint blends at `z-index: 1` using multiply in light mode and screen in dark mode. The other variants render behind content at `z-index: -1`. All variants are non-interactive, hidden from assistive technology, and add no animation or client-side state.

Mask and gradient rules live in `MaskedBackground.module.css`; landing-page CSS retains section layout only. Theme colors continue to come from the shared palette.
## Hero base background

Hero (Light) and Hero (Dark) also expose `colorFrom`, `colorTo`, and `style`:
`solid` uses only `colorFrom`; `linear` blends both colors with an `angle` control
(0–360°), shown only for linear gradients; `circle` uses a centered radial gradient.
These controls affect the unmasked base beneath the existing illustration, not its
ground material or the green mask. Save to Next.js stores these four values separately
for each theme. Mask settings remain shared between the two Hero stories.
