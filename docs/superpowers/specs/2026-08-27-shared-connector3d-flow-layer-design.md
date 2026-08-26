# Shared Connector3D Flow Layer Design

## Summary

BusinessFlowHorizontal and BusinessFlowVertical will replace their bespoke SVG connector and beam renderers with one shared, top-down Three.js layer per illustration. The layer will construct connectors through the existing Connector3D object factory and animated pulses through the existing Beam3D object factory. BusinessFlow3D will continue consuming the same factories directly.

The horizontal and vertical illustrations will preserve their current flat compositions, SVG icon artwork, sizing, responsive behavior, and public props. This is a rendering-layer migration, not a visual redesign.

## Goals

- Reuse the Connector3D implementation in BusinessFlow3D, BusinessFlowHorizontal, and BusinessFlowVertical.
- Reuse Beam3D for connector pulses in the horizontal and vertical illustrations.
- Preserve the current top-view layouts and icon styling of the horizontal and vertical illustrations.
- Use one WebGL canvas and one animation loop per illustration.
- Preserve existing connector, beam, timing, grid, and layout controls.
- Keep icons and their accessible descriptions in the DOM.
- Dispose all Three.js resources and observers when an illustration unmounts.

## Non-goals

- Do not convert the horizontal or vertical icons into Node3D objects.
- Do not add perspective, camera tilt, orbit controls, lighting, or dimensional node styling to the horizontal or vertical illustrations.
- Do not embed one React Connector3D component per route; that would create multiple canvases and render loops.
- Do not redesign the flow topology or change marketing copy.
- Do not change BusinessFlow3D's visual behavior as part of this migration.

## Architecture

### Shared FlowLayer3D

Add a reusable FlowLayer3D component and scene controller under `src/components/elements/FlowLayer3D/`.

FlowLayer3D owns:

- one transparent WebGL canvas;
- one orthographic camera looking straight down at the X/Z flow plane;
- one renderer and animation frame loop;
- responsive resize observation;
- Connector3D object creation for every route;
- Beam3D object creation and animation for active routes;
- graceful WebGL initialization failure;
- complete resource disposal.

FlowLayer3D consumes renderer-independent route data. It must not know about horizontal or vertical feature names, icon components, or page layout.

### Route model

Each route contains:

- a stable identifier;
- an ordered array of normalized two-dimensional points;
- optional rounded-corner strength;
- emission delay and travel timing;
- optional arrival identifiers used for burst synchronization;
- optional continuation-edge fading.

The scene controller maps normalized `[x, y]` points to Three.js `[x, 0, z]` coordinates. The orthographic camera and mapping preserve the source aspect ratio, so DOM icons and WebGL paths stay aligned at every responsive size.

### Feature integration

BusinessFlowHorizontal will replace its connector and beam SVG groups with FlowLayer3D. Its existing DOM burst and icon layers remain. The hard-coded SVG path strings will become normalized point-based route definitions with equivalent curves and delays.

BusinessFlowVertical will replace PillarsConnectors and its internal PillarsBeam renderer with FlowLayer3D. Its existing route topology and randomized scheduling logic will be separated into renderer-independent route-generation utilities. Central and surrounding SVG icons remain unchanged.

BusinessFlow3D will continue calling Connector3D, Beam3D, and FlowPath3D object factories from its existing scene. FlowLayer3D establishes the same factory boundary for the two top-view illustrations.

## Rendering and styling

- The canvas is decorative and must be hidden from assistive technology.
- The canvas sits behind the DOM icon and arrival-burst layers.
- The renderer uses an alpha background and no perspective.
- Connector color, opacity, width, corner radius, and continuation fading come from existing feature props.
- Beam enabled state, speed, color, highlight color, trail length, glow, concurrency, randomness, and emission timing come from existing feature props where available.
- Existing CSS grids remain CSS backgrounds; FlowLayer3D renders only connectors and beams.
- Reduced-motion mode freezes or disables beam animation while leaving connectors visible.

## Data flow

1. A feature computes normalized route data from its current topology and props.
2. The feature renders FlowLayer3D with routes and connector/beam configuration.
3. FlowLayer3D creates shared Connector3D and Beam3D objects in one scene.
4. The scene loop updates beam position and visibility.
5. Arrival callbacks update the feature's existing DOM burst layer when required.
6. Resize observation recomputes the camera framing without changing route topology.
7. Unmount cancels animation, disconnects observers, and disposes objects, textures, materials, geometries, and the renderer.

## Failure handling

If WebGL initialization fails, FlowLayer3D must keep the DOM icon composition visible and expose a non-blocking diagnostic message for development. It must not throw through the React tree or prevent page rendering.

Invalid or empty route data is ignored safely. A route with fewer than two distinct points does not create a connector or beam.

## Testing strategy

Development follows test-driven development.

Unit tests cover:

- normalized-to-world coordinate mapping;
- aspect-ratio-preserving orthographic framing;
- horizontal SVG-route conversion to equivalent point routes;
- vertical route generation and continuation paths;
- rounded-path creation through the shared FlowPath3D utility;
- deterministic emission timing when randomness is disabled;
- invalid-route filtering;
- scene disposal.

Component tests cover:

- one FlowLayer3D instance per horizontal or vertical illustration;
- forwarding existing connector and beam props;
- keeping accessible DOM icon content present;
- graceful initialization failure;
- cleanup on unmount.

Storybook verification covers BusinessFlow3D, BusinessFlowHorizontal, BusinessFlowVertical, Connector3D, and Beam3D. The horizontal and vertical stories must retain their current top-view compositions at desktop and narrow viewports.

Final verification runs the unit test suite, TypeScript, ESLint, the Next.js production build, the Storybook production build, direct browser inspection, console-error checks, and Storybook accessibility scans.

## Migration sequence

1. Add test infrastructure if the repository still lacks a unit-test command.
2. Add and test renderer-independent route types and mapping utilities.
3. Add and test the shared FlowLayer3D scene controller and React component.
4. Migrate BusinessFlowHorizontal route data and rendering.
5. Extract BusinessFlowVertical route generation and migrate its rendering.
6. Remove obsolete SVG connector and beam implementation code.
7. Verify all Storybook stories and production pages.

## Acceptance criteria

- All three animated business-flow illustrations construct connectors through the Connector3D object factory.
- Horizontal and vertical flows construct pulses through the Beam3D object factory.
- Horizontal and vertical stories retain a flat orthographic top view and visually equivalent topology.
- Existing public illustration props remain source-compatible.
- Each migrated illustration owns exactly one canvas, renderer, and animation loop.
- Icons remain DOM/SVG content and retain accessible labeling.
- No WebGL, React, or Storybook console errors occur during normal rendering or unmount.
- Unit tests, typecheck, lint, Next.js build, and Storybook build pass.
