const gradientAngleControl = {
  control: { type: 'range', min: 0, max: 360, step: 1 },
} as const;

const colorControl = { control: 'color' } as const;

export const nodeAppearanceArgTypes = {
  nodeBodyColor: {
    ...colorControl,
    description: 'Color of the bottom/base face of each node body.',
    table: { category: 'Node Body' },
  },
  nodeFrontGradientAngle: {
    ...gradientAngleControl,
    description: 'Gradient angle for the icon-bearing front face.',
    table: { category: 'Node Front Gradient' },
  },
  nodeFrontGradientStartColor: {
    ...colorControl,
    table: { category: 'Node Front Gradient' },
  },
  nodeFrontGradientMidColor: {
    ...colorControl,
    table: { category: 'Node Front Gradient' },
  },
  nodeFrontGradientEndColor: {
    ...colorControl,
    table: { category: 'Node Front Gradient' },
  },
  nodeSideXGradientAngle: {
    ...gradientAngleControl,
    description: 'Gradient angle for the pair of sides aligned to the X axis.',
    table: { category: 'Node X-Side Gradient' },
  },
  nodeSideXGradientStartColor: {
    ...colorControl,
    table: { category: 'Node X-Side Gradient' },
  },
  nodeSideXGradientMidColor: {
    ...colorControl,
    table: { category: 'Node X-Side Gradient' },
  },
  nodeSideXGradientEndColor: {
    ...colorControl,
    table: { category: 'Node X-Side Gradient' },
  },
  nodeSideZGradientAngle: {
    ...gradientAngleControl,
    description: 'Gradient angle for the pair of sides aligned to the Z axis.',
    table: { category: 'Node Z-Side Gradient' },
  },
  nodeSideZGradientStartColor: {
    ...colorControl,
    table: { category: 'Node Z-Side Gradient' },
  },
  nodeSideZGradientMidColor: {
    ...colorControl,
    table: { category: 'Node Z-Side Gradient' },
  },
  nodeSideZGradientEndColor: {
    ...colorControl,
    table: { category: 'Node Z-Side Gradient' },
  },
} as const;
