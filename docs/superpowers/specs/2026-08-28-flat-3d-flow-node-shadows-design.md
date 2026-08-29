# Flat 3D Flow Node Shadows Design

## Goal

Give the nodes in both shared 2D-perspective flow illustrations a soft, shape-aware cast shadow so their existing extruded geometry reads as flat 3D against the grid surface.

## Scope

- Apply the effect to every node rendered by `FlowLayer3D`.
- Cover both `BusinessFlowVertical` and `BusinessFlowHorizontal` without adding illustration-specific shadow implementations.
- Preserve all current node gradients, icons, progress indicators, glows, connectors, beams, and arrival bursts.
- Keep the shadow styling internal to the shared scene; no new public component props are required.

## Rendering Design

`createNode3DObject` already marks each node body as a shadow caster. `createFlowLayer3DScene` will activate and complete that existing path by:

1. Enabling the WebGL renderer shadow map with `VSMShadowMap` for soft edges.
2. Adding one directional light positioned above and toward the upper-left of the top-down scene. Its projected shadows will fall slightly toward the lower-right in screen space.
3. Adding a transparent `ShadowMaterial` plane below the node bodies. The plane receives shadows but does not introduce a visible surface or obscure the existing grid.
4. Keeping the light and receiver out of connector, beam, icon, glow, and progress rendering so only node bodies cast the depth cue.

The light uses a bounded orthographic shadow camera and a moderate texture size, radius, and blur-sample count. The shadow opacity stays subtle enough for the dark green surface while remaining visible beneath inactive nodes. Because the existing geometry casts the shadow, square, rectangular, circular, triangular, and hexagonal nodes retain their own silhouettes.

## Lifecycle and Performance

- One light and one receiver serve the complete flow scene, regardless of node count.
- Shadow rendering is initialized once with the scene rather than rebuilt during animation.
- Node rebuilding on resize continues to reuse the same light and receiver.
- Scene destruction disposes the receiver geometry and material and removes the new objects before disposing the renderer.
- No extra React renders or per-frame DOM work are introduced.

## Error Handling

Shadow setup remains inside the existing guarded scene initialization. If renderer or scene construction fails, the existing cleanup and `onError` path remain responsible for stopping the scene. Explicit receiver cleanup prevents GPU resources from surviving a normal destroy or an initialization failure after creation.

## Testing

- Add a `createFlowLayer3DScene` regression test proving that shadow maps are enabled with the intended soft-shadow type.
- Assert that the rendered scene contains a shadow-casting directional light and a transparent receiving plane below the nodes.
- Assert receiver geometry and material disposal during scene teardown.
- Run the complete unit-test, lint, and TypeScript suites.
- Verify both homepage flow illustrations in the live browser: shadows are visible beneath node bodies, fall in the same direction, do not affect connectors or beams, and are not clipped.

## Non-Goals

- Adding user-facing Storybook controls for shadow direction or intensity.
- Changing standalone `Node3D`, which already has its own shadow scene.
- Adding shadows to connector paths, beams, glow sprites, icons, or arrival bursts.
- Introducing multiple lights, environment maps, or physically based scene lighting.
