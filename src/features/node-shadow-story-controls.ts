export const nodeShadowArgTypes = {
  nodeShadowColor: {
    control: 'color',
    description: 'Color of the shadows cast beneath the 3D nodes.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowOpacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.01 },
    description: 'Opacity of the transparent plane that receives node shadows.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowLightX: {
    control: { type: 'range', min: -20, max: 20, step: 0.5 },
    description: 'X component of the directional light used to cast node shadows.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowLightY: {
    control: { type: 'range', min: -20, max: 30, step: 0.5 },
    description: 'Y component of the directional light used to cast node shadows.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowLightZ: {
    control: { type: 'range', min: -20, max: 20, step: 0.5 },
    description: 'Z component of the directional light used to cast node shadows.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowRadius: {
    control: { type: 'range', min: 0, max: 24, step: 0.5 },
    description: 'VSM shadow radius used to soften node-shadow edges.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowBlurSamples: {
    control: { type: 'range', min: 1, max: 32, step: 1 },
    description: 'Number of VSM blur samples; higher values are smoother but cost more GPU time.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowBias: {
    control: { type: 'number', min: -0.01, max: 0.01, step: 0.0001 },
    description: 'Depth offset used to reduce shadow acne and detached shadow artifacts.',
    table: { category: 'Node Shadows' },
  },
  nodeShadowNormalBias: {
    control: { type: 'number', min: 0, max: 0.1, step: 0.001 },
    description: 'Surface-normal offset used to prevent self-shadowing on node faces.',
    table: { category: 'Node Shadows' },
  },
} as const;
