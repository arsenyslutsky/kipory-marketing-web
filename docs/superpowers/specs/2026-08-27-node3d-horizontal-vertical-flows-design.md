# Shared Node3D Horizontal and Vertical Flow Design

## Summary

BusinessFlowHorizontal and BusinessFlowVertical will replace their visible flat SVG node layers with Node3D objects rendered inside their existing shared FlowLayer3D scene. Each illustration will continue to use one orthographic WebGL renderer, one CSS3D renderer, one camera, one resize observer, and one animation loop for nodes, connectors, and beams.

The layouts remain flat and top-down. This change adds dimensional node faces and the selected role-based visual hierarchy without changing the route topology, beam scheduling, illustration dimensions, or public component call sites.

## Goals

- Reuse `createNode3DObject` for every visible node in BusinessFlowHorizontal and BusinessFlowVertical.
- Preserve one shared rendering lifecycle per illustration instead of mounting one standalone Node3D component per node.
- Preserve the existing seven business icons: server, graph, vector, intelligence, download, profile, and profile-alt.
- Keep node centers and connector endpoints aligned through one normalized coordinate model.
- Apply the approved role-based node hierarchy consistently across both flows.
- Preserve current beam, connector, arrival-burst, responsive, reduced-motion, and accessibility behavior.
- Preserve existing public props and component call sites.
- Keep a lightweight visible DOM fallback when WebGL or CSS3D scene creation fails.
- Dispose all WebGL, CSS3D, observer, animation, and DOM resources on rebuild or unmount.

## Non-goals

- Do not mount the standalone `<Node3D>` React component once per node.
- Do not introduce multiple WebGL canvases, cameras, resize observers, or animation loops per illustration.
- Do not tilt the camera, add orbit controls, or change the flows from their current orthographic top-down presentation.
- Do not redesign route topology, beam timing, marketing copy, grid styling, or illustration dimensions.
- Do not migrate the existing DOM arrival-burst animations into Node3D glow state in this change.
- Do not enable Node3D progress indicators in these illustrations.
- Do not change BusinessFlow3D behavior.

## Selected Approach

Extend FlowLayer3D with a renderer-independent node model. FlowLayer3D will construct nodes through `createNode3DObject` in the same Three.js scene that already owns Connector3D and Beam3D objects. A single CSS3DRenderer will render every node-face icon from the same scene and camera.

This approach was selected over:

- a new composite scene abstraction, which would duplicate most of FlowLayer3D and require a second migration; and
- one `<Node3D>` component per node, which would create many canvases and independent rendering lifecycles and would make exact connector alignment fragile.

## Architecture

### FlowLayer3D node model

FlowLayer3D gains normalized node descriptors alongside its existing normalized path descriptors. Each descriptor contains:

- a stable node identifier;
- normalized `[x, y]` position;
- Node3D shape;
- node width and depth in illustration-relative units;
- extrusion height;
- icon asset name and base path;
- icon color and opacity;
- visual tier;
- scale;
- front and side gradient settings;
- corner radius and outline settings; and
- optional initial glow and progress values, which remain disabled by the two migrated flows.

Feature components generate these descriptors from the same constants or memoized layout data that generate connector routes. FlowLayer3D does not know about collectors, relays, pillars, or satellites; it only consumes generic node descriptors.

### Shared scene ownership

FlowLayer3D remains the lifecycle owner for the illustration. Its React markup gains one CSS3D layer adjacent to its existing canvas. Its scene controller creates:

- one transparent WebGLRenderer;
- one CSS3DRenderer mounted in the CSS3D layer;
- one orthographic camera looking down at the X/Z plane;
- shared node objects through `createNode3DObject`;
- shared connector objects through Connector3D factories; and
- shared beam objects through the Beam3D factory.

WebGL and CSS3D render once per animation frame with the same scene and camera. The CSS3D layer is pointer-inert and hidden from assistive technology.

### Business icon assets

The seven existing business icons become reusable SVG assets under the public node asset tree. Their path geometry remains equivalent to the current PillarIcon and PillarSurroundingIcon artwork.

`createNode3DObject` gains icon presentation controls needed by the flow components, including per-node icon color and stroke treatment. The standalone Node3D component receives source-compatible optional props for those controls and keeps its current defaults when they are omitted.

### Role-based visual hierarchy

The approved geometry system is:

- BusinessFlowHorizontal collector: one large hexagonal Node3D object.
- BusinessFlowHorizontal relays: three medium rounded-square Node3D objects.
- BusinessFlowHorizontal terminals: six small document-shaped rectangular Node3D objects.
- BusinessFlowVertical central pillars: four medium rounded-square Node3D objects.
- BusinessFlowVertical top and bottom satellites: small document-shaped rectangular Node3D objects.

`iconSize` remains the base sizing control. Role multipliers derive the final footprint so existing story controls continue to scale the entire composition coherently.

## Feature Integration

### BusinessFlowHorizontal

The existing hard-coded node array remains the source of stable IDs, roles, icons, normalized positions, and burst delays. It will also produce FlowLayer3D node descriptors.

The visible `iconLayer` and its PillarIcon/PillarSurroundingIcon instances are removed. The existing CSS burst layer remains above the shared flow scene and retains its current timing. The figure label continues to describe the complete illustration; horizontal node faces remain decorative to assistive technology as they are today.

Horizontal props map as follows:

- `iconSize` sets the base node footprint.
- `centralIconFillColor` and `centralIconStrokeOpacity` style collector and relay face icons.
- `auxiliaryIconFillColor` styles terminal face icons.
- `strokeWidth` controls the business-icon stroke treatment.
- Existing flow, connector, grid, layout, and color props retain their current behavior.
- Node faces use the Node3D default green gradients because the horizontal component does not currently expose gradient props.

### BusinessFlowVertical

The memoized central and surrounding layout data produces both routes and node descriptors. The visible `composition` and `surroundingLayer` icon artwork is replaced by Node3D objects. The four central semantic items remain in the DOM as visually hidden list content, preserving the existing Server, Graph, Vector, and Intelligence descriptions without duplicating visible SVGs.

The existing DOM burst layer remains above the shared scene and continues to consume FlowLayer3D arrival events.

Vertical props map as follows:

- `iconSize` sets the base node footprint.
- `centralIconFillColor`, `centralIconFillMode`, `centralIconStrokeOpacity`, and `strokeWidth` continue to control central icon presentation.
- `auxiliaryIconFillColor` controls satellite icon presentation.
- `gradientStartColor`, `gradientMidColor`, and `gradientEndColor` style central and satellite Node3D front faces.
- Existing flow, connector, burst, grid, layout, and color props retain their current behavior.

## Coordinate and Rendering Data Flow

1. A feature computes normalized node positions and normalized route points.
2. The feature passes both collections to FlowLayer3D.
3. FlowLayer3D measures the container and establishes an aspect-correct orthographic frame.
4. The same normalized-to-world mapping converts node centers and connector points into the X/Z plane.
5. Node3D, Connector3D, and Beam3D factories construct their objects inside one scene.
6. The WebGL renderer draws geometry and the CSS3D renderer draws icon faces with the same camera.
7. Beam arrivals continue to notify feature-level DOM burst handling.
8. A resize recomputes camera framing and rebuilds nodes and connectors from normalized data while updating active beam paths without resetting their schedules.

Node bodies sit above connectors in world Y so node faces visually cover connector endpoints. Existing burst layers remain above both renderer layers in CSS stacking order.

## Responsive Behavior

Node positions and route points remain normalized to the illustration container. On resize:

- the camera frustum updates to the new aspect ratio;
- WebGL and CSS3D renderer sizes update together;
- node and connector objects rebuild only when the aspect ratio changes materially;
- active beam objects receive new resolved paths while preserving run generation and elapsed time; and
- DOM burst and fallback coordinates remain normalized and aligned.

The existing `width` and `height` props remain the only outer-layout controls.

## Accessibility

- Each CSS3D icon face is decorative and `aria-hidden`.
- BusinessFlowHorizontal retains its descriptive figure role and label.
- BusinessFlowVertical retains its section label and a visually hidden semantic list for its four named central nodes.
- DOM fallback nodes are decorative; semantic labels remain separate so fallback activation does not duplicate announcements.
- The canvas and CSS3D layer remain hidden from assistive technology.

## Reduced Motion

Reduced-motion behavior remains unchanged:

- animated beams do not run;
- arrival bursts remain hidden;
- nodes and connectors remain statically visible; and
- no new idle floating, hover, orbit, or progress animation is enabled.

## Failure Handling

### Icon asset failure

Node3D keeps its existing mask fallback while attempting to inline an SVG asset. An invalid or unavailable icon does not prevent the node body from rendering.

### Scene initialization failure

FlowLayer3D catches scene initialization errors and reports them only in development. It renders a lightweight normalized DOM fallback for the supplied nodes so the illustration remains understandable even when WebGL or CSS3D is unavailable. The feature's semantic label or hidden list remains present.

### Partial construction failure

If node, connector, or beam construction fails after scene creation, the controller disposes every already-created object and renderer before returning the error to the FlowLayer3D React component, which activates the fallback. No partial animation loop or observer remains active.

Invalid node positions or non-positive dimensions are skipped safely with a development diagnostic. Invalid routes retain the existing safe filtering behavior.

## Resource Lifecycle

The scene controller owns all created resources. Rebuild and destroy paths must:

- cancel animation frames;
- disconnect ResizeObserver;
- remove the CSS3D renderer element;
- remove CSS3D node-face elements;
- clear node, connector, and beam groups;
- dispose geometries, materials, shader-uniform textures, and flare textures;
- reference-count or explicitly clear Node3D's cached per-renderer gradient textures so an aspect-ratio rebuild never reuses a disposed texture and final scene destruction releases the cache;
- clear references used by active beam slots; and
- dispose the WebGLRenderer exactly once.

Aspect-ratio rebuilds dispose replaced node and connector objects but leave the renderer, observer, timer, and active beam schedule intact.

## Testing Strategy

Development follows red-green-refactor.

Unit tests cover:

- normalized node-to-world coordinate conversion;
- invalid node filtering;
- role-to-shape and role-to-size mappings for both features;
- icon-asset mappings for all seven business icons;
- Node3D factory calls from the shared object composer;
- node and connector rebuilds after aspect-ratio changes;
- active beam path updates without schedule reset; and
- complete disposal of node WebGL and CSS3D resources.

Component tests cover:

- exactly one FlowLayer3D, one canvas, and one CSS3D layer per illustration;
- horizontal and vertical node descriptor counts and role mappings;
- removal of duplicate visible SVG icon layers;
- preserved horizontal labeling and vertical semantic list content;
- reduced-motion forwarding;
- existing burst behavior; and
- DOM fallback visibility after scene initialization failure.

Regression verification runs:

- focused Node3D, FlowLayer3D, horizontal-flow, and vertical-flow tests;
- the full Vitest suite;
- TypeScript checking;
- ESLint;
- the Next.js production build;
- the Storybook production build;
- direct browser inspection of both flow stories at desktop and narrow sizes;
- browser console-error inspection; and
- Storybook accessibility checks for both stories.

## Implementation Sequence

1. Add business icon assets and the Node3D icon-presentation controls, with tests.
2. Add the renderer-independent FlowLayer3D node model and coordinate resolution, with tests.
3. Extend the shared object composer and scene controller to create, render, rebuild, and dispose Node3D objects and one CSS3DRenderer.
4. Add FlowLayer3D fallback and component-level lifecycle behavior.
5. Migrate BusinessFlowHorizontal to node descriptors and remove its visible SVG icon layer.
6. Migrate BusinessFlowVertical to node descriptors, replace its visible SVG layers, and retain a hidden semantic list.
7. Verify both Storybook stories visually and run the complete regression suite.

## Acceptance Criteria

- Every visible horizontal and vertical flow node is constructed through `createNode3DObject`.
- Each illustration owns exactly one WebGL canvas, one CSS3D renderer, one orthographic camera, one ResizeObserver, and one animation loop.
- The approved role hierarchy is visible in both illustrations.
- All seven current business icons appear on the corresponding Node3D faces.
- Node centers, connector endpoints, beams, and DOM bursts remain aligned at desktop and narrow widths.
- Existing component call sites and public props remain source-compatible.
- Existing beam scheduling, route topology, continuation fading, reduced-motion behavior, and burst behavior remain intact.
- Horizontal and vertical accessibility labels remain meaningful without duplicate announcements.
- Scene or icon failure does not crash the React tree and leaves a visible node fallback.
- No replaced scene resources, observers, animation frames, or CSS3D elements leak after resize or unmount.
- Focused tests, the full test suite, type checking, lint, Next.js build, Storybook build, browser inspection, console checks, and accessibility checks pass.
