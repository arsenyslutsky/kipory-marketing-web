# Homepage Illustration Presets Design

## Goal

Keep the three animated illustration configurations used by the Next.js homepage in exact prop-level sync with dedicated Storybook stories. Add the horizontal business flow to the delivery section where the illustration placeholder currently appears.

## Scope

The homepage uses three existing illustration components:

- `BusinessFlow3D` in the hero
- `BusinessFlowVertical` in the pillars section
- `BusinessFlowHorizontal` in the delivery section

This change synchronizes their component props. The surrounding Storybook canvas and the homepage section layout may differ because those belong to separate presentation contexts.

Storybook Controls remain temporary runtime state. They do not write source files. After experimenting with Controls, a developer copies the chosen values into the relevant typed homepage preset; both Storybook and Next.js then update through their normal hot-reload behavior.

## Architecture

Each illustration feature exports one explicitly named homepage preset:

- `businessFlow3DHomepageProps`
- `businessFlowVerticalHomepageProps`
- `businessFlowHorizontalHomepageProps`

Every preset is a plain serializable object declared with TypeScript `satisfies` against its component prop type. This keeps the Next.js Server-to-Client boundary valid and catches missing, renamed, or invalid props during type checking.

The Next.js homepage imports the three illustration components and their homepage presets from the feature entry points. It spreads each preset directly into the matching component. The horizontal flow replaces the delivery-section placeholder while retaining the existing grid position and a responsive presentation that preserves the illustration's intended aspect ratio.

Each illustration's Storybook file exports a story named `Current Next.js App`. Its `args` point directly to the matching homepage preset. Existing Foundation or exploratory stories may remain for component development, but they are not production configuration sources.

## Data Flow

```text
typed feature homepage preset
    ├── Next.js homepage component props
    └── Storybook “Current Next.js App” story args
```

There is no duplicated production prop object and no runtime synchronization service. Source control records all persistent changes.

## Delivery Illustration Layout

The delivery section's placeholder markup and placeholder-only styling are removed. A dedicated delivery illustration wrapper occupies the same left-hand grid cell. The wrapper centers and contains `BusinessFlowHorizontal`, prevents overflow, and adapts to the existing single-column responsive breakpoint. The illustration keeps its own accessible `figure` label; the placeholder's duplicate `role="img"` and label are removed.

## Failure Handling

This is static configuration, so failures surface during development rather than at runtime:

- TypeScript rejects presets that do not satisfy their component prop types.
- Next.js rejects non-serializable props crossing into the client illustration components.
- Contract tests detect a homepage or story that stops consuming the shared preset.
- Build and visual checks detect layout or integration regressions.

## Testing and Verification

Add regression coverage that verifies:

- all three homepage presets satisfy and reach their matching components;
- all three `Current Next.js App` stories use the shared homepage presets;
- the delivery placeholder is removed and the horizontal flow is rendered;
- the homepage remains a Server Component with only the illustrations defining client boundaries.

Run the complete test suite, TypeScript checking, ESLint, the Next.js production build, and the Storybook production build. Finally, inspect the homepage at desktop and mobile widths and inspect all three `Current Next.js App` stories to confirm their rendered component parameters match.

## Out of Scope

- Persisting Storybook Controls back into source files
- A custom Storybook addon or file-writing API
- Synchronizing surrounding page layout CSS with the Storybook canvas
- Refactoring illustration internals unrelated to shared configuration
