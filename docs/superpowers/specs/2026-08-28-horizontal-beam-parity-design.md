# Horizontal Beam Parity Design

## Goal

Make the homepage horizontal flow in “Everything your team needs to run ahead without compromises.” use the complete beam effect currently configured for the vertical “Our Pillars” flow.

## Scope

- Add horizontal controls for emission randomness, beam head glow, route-relative trail length, maximum concurrent beams, and arrival-burst timing, radius, and strength.
- Copy the current vertical homepage values into the horizontal homepage preset: randomness `100`, head glow blur `32`, head glow opacity `0`, head glow radius `0`, trail length `0`, maximum concurrent beams `5`, burst fade time `1700`, burst radius `25`, and burst strength `0.5`.
- Make horizontal beam width follow the same connector-width relationship as vertical: `max(1.25, connectorWidth * 1.4)`.
- Limit horizontal animation to the requested concurrent beam count while rotating those slots across all twelve routes.
- Apply the vertical emission-delay policy: deterministic staggering at `0%`, seeded first-generation randomness, and injected/random later-generation delays at `100%`.
- Convert horizontal trail length from illustration pixels into normalized progress per route.
- Replace the horizontal flow's scheduled infinite CSS pulses with one-shot bursts emitted from real `FlowLayer3D` arrival events.
- Expose every new property in the horizontal Storybook story.

## Compatibility

- Preserve the horizontal component's existing visual defaults except where the new props add previously unavailable behavior.
- Keep all twelve connector paths unchanged.
- The `Foundation` story continues to use component defaults; the `Current Next.js App` story and homepage consume the shared homepage preset.
- Reduced motion and disabled beams must suppress and clear arrival bursts.

## Verification

- Route-source unit tests cover concurrency limits, route rotation, randomness, speed scaling, invalid slots, arrivals, and trail conversion.
- Component tests cover beam-style propagation, homepage preset parity, real arrival-burst lifecycle, and motion suppression.
- Run the focused Vitest suites, full test suite, typecheck, lint, production build, Storybook build, and browser inspection of Storybook plus the homepage.
