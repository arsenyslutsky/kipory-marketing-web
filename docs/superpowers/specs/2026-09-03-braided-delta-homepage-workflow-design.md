# Braided Delta Homepage Workflow Design

## Summary

Replace the homepage hero's dense, nearly rectangular 3D node matrix with a sparser **Braided Delta** composition. The new workflow uses fewer nodes but a richer graph: asymmetric splits, two deliberate rejoins, one early dead end, and three explicit outputs. Its silhouette opens toward the lower-right while preserving a clear, protected reading area for the hero copy on the left.

This is a homepage composition redesign, not a renderer rewrite. `BusinessFlow3D`, its public props, node geometry, connector implementation, progress treatment, theme palettes, and animation runtime remain reusable and unchanged.

## Problem

The current homepage workflow has accumulated nine tiers and many one-to-one extension nodes. Although it communicates scale, the result reads as a regular matrix:

- repeated rows have similar density and cadence;
- long one-to-one chains add nodes without adding meaningful topology;
- the lower half becomes a wall of equally weighted shapes;
- the graph's broad left edge competes with the hero body copy;
- complexity comes from node count rather than from splits, convergence, and route choice;
- the composition is difficult to read as a single memorable system.

The replacement must feel more complex while becoming materially less dense. Complexity therefore comes from graph behavior and silhouette, not from adding more objects.

## Goals

- Create a distinctive asymmetric workflow that reads as one living operational system.
- Reduce the visible graph to 24 nodes across eight irregularly spaced tiers.
- Use branching and convergence to make the topology richer than the current matrix.
- Keep the node and connector field visually separate from the left-side hero content.
- Preserve strict connector geometry: straight runs or rounded 90-degree turns only.
- Keep authored parent-child columns stable so the renderer does not introduce micro-jogs.
- Make beam behavior agree with visible graph structure, including early terminal leaves.
- Use the same topology and spatial composition in light mode, dark mode, and the two Current App Storybook stories.
- Preserve the existing hero height, scroll behavior, WebGL lifecycle, and reduced-motion fallback contract.

## Non-goals

- Do not change homepage copy, calls to action, protocol icons, or section order.
- Do not introduce diagonal connector segments.
- Do not add a public graph-layout API, force-directed layout, automatic edge router, or new dependency.
- Do not redesign node materials, theme colors, shadows, progress controls, or beam styling.
- Do not change the reusable `defaultFlow`; the homepage receives a separate complete flow configuration.
- Do not increase the hero canvas height to make the graph fit.
- Do not fabricate product capabilities or customer evidence through new visible labels.

## Visual Thesis

The graph is a right-weighted delta rather than a centered tree or rectangular matrix. A narrow source enters near the upper-right, widens into several routes, contracts at controlled convergence points, and resolves into three widely separated outputs. Empty cells are intentional and prevent every tier from carrying equal visual weight.

The primary reading path remains the hero copy. The workflow supports it as a technical proof object:

1. copy and actions establish the proposition on the left;
2. the bright source and first split establish the workflow on the right;
3. the eye follows alternating splits and rejoins down the field;
4. three separated outputs resolve the composition near the crop edge.

The workflow should remain legible under a squint test as a narrow-to-wide-to-narrow-to-wide sequence. No row should read as a complete horizontal shelf.

## Spatial System

### Logical columns

Use five shared logical columns. Their implementation coordinates begin at the current root column and extend only toward the right:

| Column | X coordinate |
| --- | ---: |
| `C0` | `0.00` |
| `C1` | `3.30` |
| `C2` | `6.60` |
| `C3` | `9.90` |
| `C4` | `13.20` |

These are authored node centers. The existing collision resolver may increase separation only when the rendered node scale would otherwise overlap nodes. It must preserve the authored centers when the row already satisfies the minimum rendered gap.

### Logical tiers

Use eight tiers with deliberately varied forward spacing:

| Tier | Z coordinate | Nodes |
| --- | ---: | ---: |
| `T0` | `-5.00` | 1 |
| `T1` | `-0.70` | 2 |
| `T2` | `3.20` | 3 |
| `T3` | `7.40` | 4 |
| `T4` | `11.00` | 3 |
| `T5` | `15.20` | 4 |
| `T6` | `19.00` | 4 |
| `T7` | `23.40` | 3 |

The tier cadence is `1 → 2 → 3 → 4 → 3 → 4 → 4 → 3`. Forward gaps are `4.3, 3.9, 4.2, 3.6, 4.2, 3.8, 4.4` world units. This variation keeps the diagram from reading as graph paper populated at every intersection.

### Content exclusion zone

The grid, fog, and ambient background may continue behind the hero copy. Active diagram geometry may not.

- At viewport widths of 1200px and above, the projected bounding box of every node, connector turn, beam, packet, and node shadow must begin at least 100px to the right of the rendered `heroLead` bounding box.
- At 901–1199px, preserve at least 64px of clear space and keep all high-contrast activity outside the hero title and lead rectangles.
- At 621–900px, the workflow becomes supporting atmosphere. The existing shade may overlap its low-contrast grid, but nodes, bright beams, and progress effects must remain outside the readable copy column.
- At 620px and below, retain the existing mobile fallback strategy and prioritize text contrast. The fallback image must be regenerated from the approved topology in both themes.
- The 100px desktop gap is achieved with homepage flow coordinates and homepage visual placement, not with an opaque panel behind the copy.
- No connector may enter the exclusion zone merely to leave it again.

## Node Map

Reuse existing SVG assets and labels so the redesign changes composition rather than inventing product claims.

| Tier | Node | Column | Shape | Role |
| --- | --- | --- | --- | --- |
| `T0` | `core` | `C0` | hexagon | single source |
| `T1` | `vault` | `C0` | triangle | left source branch |
| `T1` | `library` | `C2` | square | right source branch |
| `T2` | `metrics` | `C0` | hexagon | left continuation |
| `T2` | `stack` | `C1` | triangle | inner-left continuation |
| `T2` | `secure` | `C3` | triangle | right split source |
| `T3` | `records` | `C0` | square | intentional early leaf |
| `T3` | `graph` | `C1` | triangle | left processing route |
| `T3` | `profile` | `C2` | square | center processing route |
| `T3` | `labels` | `C4` | circle | outer-right route |
| `T4` | `pipeline` | `C1` | square | left split source |
| `T4` | `policy` | `C2` | rectangle | center continuation |
| `T4` | `schedule` | `C4` | hexagon | outer-right continuation |
| `T5` | `build` | `C0` | rectangle | left output preparation |
| `T5` | `release` | `C1` | hexagon | inner-left output preparation |
| `T5` | `access` | `C2` | circle | center split source |
| `T5` | `events` | `C4` | rectangle | outer-right output preparation |
| `T6` | `deploy` | `C0` | circle | left terminal approach |
| `T6` | `identity` | `C1` | hexagon | first rejoin |
| `T6` | `signals` | `C3` | rectangle | center-right continuation |
| `T6` | `routes` | `C4` | hexagon | right terminal approach |
| `T7` | `publish` | `C0` | rectangle | explicit left output |
| `T7` | `govern` | `C2` | circle | explicit center output and second rejoin |
| `T7` | `stream` | `C4` | rectangle | explicit right output |

Node dimensions remain on the existing scale: `core` is `4.3 × 2.2`; `vault` and `library` are `3.2 × 1.8`; `metrics`, `stack`, and `secure` are `2.6 × 1.5`; every node in `T3` through `T7` is `2.15 × 1.25`. Shape diversity creates rhythm, but shape does not alter semantic importance or introduce additional color coding.

## Branch Topology

The exact homepage branch graph is:

```ts
{
  core: ['vault', 'library'],
  vault: ['metrics', 'stack'],
  library: ['secure'],
  metrics: ['records'],
  stack: ['graph'],
  secure: ['profile', 'labels'],
  graph: ['pipeline'],
  profile: ['policy'],
  labels: ['schedule'],
  pipeline: ['build', 'release'],
  policy: ['access'],
  schedule: ['events'],
  build: ['deploy'],
  release: ['identity'],
  access: ['identity', 'signals'],
  events: ['routes'],
  deploy: ['publish'],
  identity: ['govern'],
  signals: ['govern'],
  routes: ['stream'],
}
```

This creates 25 internal edges across 24 nodes.

- `records` is the single intentional early leaf.
- `identity` is the first rejoin, receiving routes from `release` and `access`.
- `govern` is the second rejoin, receiving routes from `identity` and `signals`.
- `publish`, `govern`, and `stream` are the only explicit final outputs.
- No other leaf receives an auxiliary continuation.

## Connector Routing

- Every connector is either a straight forward run between nodes in the same column or a three-segment orthogonal route with two rounded 90-degree turns.
- Lateral movement occurs at the midpoint between the source and target node-edge anchors.
- Diagonal source-to-target shortcuts are forbidden, including for small offsets.
- Authored shared columns must remain exactly aligned when collision resolution is unnecessary.
- Connector endpoints attach to the physical underside perimeter of each rendered node and remain tucked beneath the visible face.
- Connectors never render above node bodies and never cross through a node silhouette.
- A routing change may not create short horizontal corrective segments. If a connection is intended to read as vertical, its source and target must share a logical column in the data.
- The approved `pathCurve` value rounds orthogonal corners without changing the route topology.

## Beam and Progress Behavior

- A beam begins on the existing incoming auxiliary continuation and enters `core` through its node edge.
- Route selection continues to choose a valid root-to-leaf path and avoids immediately repeating the previous leaf when alternatives exist.
- A beam enters and resolves inside every visited node so node progress remains synchronized with arrival.
- A beam that reaches `records` ends inside `records`; it does not re-emit toward the global terminal boundary.
- A beam reaching `publish`, `govern`, or `stream` leaves through that node's visible auxiliary continuation.
- Only those three output nodes receive outgoing continuation connectors and terminal beam segments.
- Reduced-motion mode keeps the full static topology while suppressing travelling motion according to the existing runtime contract.

## Composition and Density Rules

- The graph uses 24 nodes, down from the current extended homepage topology.
- No tier contains more than four nodes.
- At least one logical column is empty in every tier except the root.
- Adjacent occupied columns maintain the existing rendered minimum gap after `nodeScale` is applied.
- Empty space alternates sides rather than accumulating only at the bottom or outer edge.
- The lower three tiers form three visually distinct output bands instead of six parallel chains.
- The active route uses the existing beam glow; inactive branches retain the current quieter connector treatment so all 25 edges do not compete simultaneously.
- Fog may soften the farthest upper nodes, but it must not erase the first split or the three terminal outputs.
- The illustration remains bottom-cropped at the existing hero boundary without a long node-free connector field below the last tier.

## Data Ownership and Integration

Create one shared homepage flow configuration under the `business-flow-3d` feature and consume that same object from:

- `HomepageBusinessFlow3D`;
- Storybook `Current App (Dark)`;
- Storybook `Current App (Light)`;
- deterministic mobile fallback capture tooling or fixtures.

The two Current App stories continue to own independent visual presets but must no longer rely on a different topology from the homepage. `Workflow 1` remains an independent general-purpose story.

The homepage component should stop constructing the graph by extending `defaultFlow` inline. The new homepage graph is complete and explicit so removed nodes and stale default branches cannot leak into it.

No public `BusinessFlow3DProps` change is required. If implementation reveals that homepage placement cannot meet the exclusion-zone acceptance criteria with existing camera and wrapper controls, prefer a homepage-only preset adjustment before proposing a reusable API.

## Theme and Storybook Parity

- Light and dark themes use identical nodes, branches, logical columns, tier coordinates, camera geometry, and crop.
- Theme changes affect only the existing palette, material, shadow, connector, and progress values.
- `Current App (Dark)` and `Current App (Light)` render the shared homepage flow by default.
- Storybook controls may still override visual props, but resetting either story restores the exact corresponding homepage preset and topology.
- Each Current App story retains its existing host frame and crop; parity assertions compare the shared scene topology and coordinates rather than the outer Storybook viewport.

## Responsive and Fallback Behavior

- Desktop WebGL preserves the complete eight-tier topology within the 840px hero crop.
- Vertical browser resizing must not rescale the graph; the existing fixed hero canvas behavior remains.
- Horizontal adaptation may shift or crop the graph, but it must not compress columns until nodes overlap or connectors become visually ambiguous.
- At intermediate widths, preserve the root, both rejoins, the early leaf, and all three outputs inside the crop.
- Mobile fallback assets are recaptured after implementation for light and dark themes at the existing intrinsic dimensions and source-set scales.
- Fallback imagery follows the same content hierarchy: readable copy first, diagram atmosphere second.

## Accessibility and Performance

- The hero workflow remains decorative and `aria-hidden`; visible marketing copy carries meaning independently.
- No new focusable or pointer-interactive elements are introduced.
- The node reduction should not increase draw calls, DOM-backed icon count, active beam count, texture count, or WebGL backing-buffer dimensions.
- Existing activity, load, display-resolution, page-visibility, cleanup, and reduced-motion behavior remains intact.
- Removing nodes must remove their associated SVG fetches, CSS3D objects, progress surfaces, and connector resources rather than leaving hidden graph artifacts.

## Testing Strategy

Implementation follows test-driven development.

Unit and contract tests verify:

- the shared homepage flow contains exactly 24 unique nodes and 25 valid internal edges;
- the tier count is `1, 2, 3, 4, 3, 4, 4, 3`;
- every branch target exists and no branch cycle is present;
- `records` is the only early leaf;
- `publish`, `govern`, and `stream` are the only terminal-tier outputs;
- `identity` and `govern` each have exactly two inbound branches;
- all same-column relationships remain aligned after row collision resolution at the homepage node scale;
- all offset edges produce orthogonal route points;
- only nodes with visible terminal continuations emit a beam beyond their center;
- homepage and both Current App stories consume the same flow object;
- light and dark presets do not alter topology or placement.

Browser verification covers:

- desktop light and dark screenshots at 1440×900 and 1920×1080;
- the 100px minimum copy-to-active-geometry gap at desktop widths;
- intermediate behavior at 1024×768;
- mobile light and dark fallback screenshots at 390×844;
- no node or high-contrast beam crossing the title, lead, actions, or protocol list;
- no diagonal connectors, short corrective jogs, node overlap, or connector-over-node rendering;
- visible beam termination at `records` and auxiliary continuation from each approved final output;
- stable composition during vertical viewport resizing and homepage scroll motion;
- parity between the homepage and both Current App stories.

Final verification runs the focused flow tests, the complete Vitest suite, ESLint, TypeScript, the Next.js production build, the Storybook production build, the Impeccable detector over changed UI files, `git diff --check`, and the bounded browser screenshot matrix above.

## Acceptance Criteria

- The homepage hero renders the approved 24-node, 25-edge Braided Delta graph.
- The graph contains eight tiers with the exact node-count cadence `1 → 2 → 3 → 4 → 3 → 4 → 4 → 3`.
- `records` visibly terminates its route; no beam or auxiliary connector continues beyond it.
- `publish`, `govern`, and `stream` are the only nodes with outgoing terminal continuations.
- `identity` and `govern` form the two visually legible convergence moments.
- No connector contains a diagonal segment or a short alignment-correction jog.
- No node, connector turn, beam, packet, progress effect, or node shadow enters the desktop hero-copy exclusion zone.
- At 1200px and wider, active geometry remains at least 100px beyond the hero lead's right edge.
- The graph ends close to the hero crop with no long empty lower connector field.
- Light mode, dark mode, Current App Storybook stories, and mobile fallbacks show the same topology and node/connector coordinates within their existing host frames.
- The redesign does not increase active node count, WebGL resolution, animation concurrency, or runtime resource leakage.
- All automated checks and the required browser screenshot matrix pass without unexplained findings.
