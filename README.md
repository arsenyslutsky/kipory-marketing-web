# Kipory Marketing Website

A static-exportable Next.js marketing site for Kipory, with the reusable animated Signal Flow illustration and its Storybook controls included in the same project.

Requires Node.js 20.19 or newer. Node.js 22 LTS is recommended; an `.nvmrc` is included.

## Included pages

- `/` — WebGL-led landing page
- `/product` — product capabilities and workflow overview
- `/about` — company approach and principles
- `/contact` — static contact and access-request page

## Run the website

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The production build is emitted to `out/`.

## Run Storybook

```bash
npm run storybook
```

Open `http://localhost:6006` and browse **Animated Illustrations / Signal Flow**. Both light and dark stories expose the illustration controls.

## Reuse the component

```tsx
import { VariantTwoSignalFlow } from '@/features/signal-flow';

export default function Example() {
  return <VariantTwoSignalFlow mode="dark" />;
}
```

The component accepts the flow graph, theme tokens, asset path, animation timing, geometry, connector, outline, and progress-bar controls as props:

```tsx
import { SignalFlowIllustration } from '@/features/signal-flow';

<SignalFlowIllustration
  mode="dark"
  flow={myFlowConfig}
  colors={myColorConfig}
  assetBasePath="/assets/my-illustration"
/>
```

## Extend the illustration system

1. Copy `src/data/flow.json` and edit node positions, sizes, labels, SVG filenames, and branches.
2. Copy `src/data/colors.json` and adjust the shared Light and Dark design tokens.
3. Put transparent node SVGs in `public/assets/...`.
4. Pass the new data and asset path into `SignalFlowIllustration`.
5. Add stories beside `SignalFlowIllustration.stories.tsx`.

The renderer supports variable route depth, concurrent beams, randomized delays and leaf selection, responsive resizing, orbit controls, hover elevation, node-aware pulse fading, shared path curvature, and complete teardown when a story unmounts.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
npm run build-storybook
```
