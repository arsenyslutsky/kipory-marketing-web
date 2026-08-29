import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { BusinessFlow3D } from '../components/BusinessFlow3D';
import { defaultColors } from '../config';
import { businessFlow3DHomepageProps } from '../presets';

function nodeGradientArgs(mode: 'light' | 'dark') {
  const scene = defaultColors[mode].scene;
  return {
    nodeFrontGradientStartColor: scene.cardHighlight,
    nodeFrontGradientMidColor: scene.card,
    nodeFrontGradientEndColor: scene.cardShadow,
    nodeSideXGradientStartColor: scene.cardSideHighlight,
    nodeSideXGradientMidColor: scene.cardSideMid,
    nodeSideXGradientEndColor: scene.cardSideShadow,
    nodeSideZGradientStartColor: scene.cardSideHighlight,
    nodeSideZGradientMidColor: scene.cardSideMid,
    nodeSideZGradientEndColor: scene.cardSideShadow,
  };
}

const darkNodeGradientArgs = nodeGradientArgs('dark');

const meta = {
  title: 'Animated Illustrations/BusinessFlow3D',
  component: BusinessFlow3D,
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <BusinessFlow3D
        {...args}
        onModeChange={(mode) => updateArgs({ mode })}
      />
    );
  },
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'none' },
  },
  argTypes: {
    variant: { table: { disable: true } },
    className: { table: { disable: true } },
    onModeChange: { table: { disable: true } },

    mode: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      table: { category: 'Presentation' },
    },
    showInterface: { control: 'boolean', table: { category: 'Presentation' } },
    interactive: {
      control: 'boolean',
      description: 'Enable pointer orbit controls and node hover effects.',
      table: { category: 'Presentation' },
    },
    reducedMotion: { control: 'boolean', table: { category: 'Presentation' } },

    emitterX: {
      control: { type: 'number', min: -20, max: 20, step: 0.1 },
      description: 'World-space X coordinate of the root emitter center.',
      table: { category: 'Placement & Camera' },
    },
    emitterY: {
      control: { type: 'number', min: -20, max: 20, step: 0.1 },
      description: 'World-space Y coordinate of the root emitter center on the flow plane.',
      table: { category: 'Placement & Camera' },
    },
    perspectiveEffect: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Placement & Camera' },
    },
    cameraPitch: {
      control: { type: 'range', min: 0, max: 65, step: 1 },
      table: { category: 'Placement & Camera' },
    },
    cameraYaw: {
      control: { type: 'range', min: -180, max: 180, step: 1 },
      table: { category: 'Placement & Camera' },
    },
    cameraZoom: {
      control: { type: 'range', min: 0.25, max: 2, step: 0.05 },
      table: { category: 'Placement & Camera' },
    },
    scrollTilt: {
      control: { type: 'range', min: -90, max: 90, step: 1 },
      table: { category: 'Placement & Camera' },
    },
    scrollZoom: {
      control: { type: 'range', min: 0.25, max: 2, step: 0.05 },
      table: { category: 'Placement & Camera' },
    },
    scrollRange: {
      control: { type: 'number', min: 1, step: 50 },
      table: { category: 'Placement & Camera' },
    },

    gridOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Grid & Fog' },
    },
    gridDensity: {
      control: { type: 'range', min: 8, max: 160, step: 1 },
      description: 'Target grid-cell spacing in CSS pixels.',
      table: { category: 'Grid & Fog' },
    },
    gridMaskRadius: {
      control: { type: 'range', min: 0, max: 1200, step: 10 },
      description: 'Radius of the white grid highlight in CSS pixels.',
      table: { category: 'Grid & Fog' },
    },
    gridMaskBlur: {
      control: { type: 'range', min: 0, max: 1200, step: 10 },
      description: 'Soft falloff beyond the white grid-highlight radius, in CSS pixels.',
      table: { category: 'Grid & Fog' },
    },
    fogEnabled: {
      control: 'boolean',
      description: 'Apply camera-distance fog to nodes, icons, progress indicators, grid, connectors, and beams.',
      table: { category: 'Grid & Fog' },
    },

    nodeShape: {
      control: {
        type: 'select',
        labels: {
          'square-triangle-circle': 'square + triangle + circle + hexagon',
          'square-rectangle-circle': 'squares + rectangles + circles + hexagons',
        },
      },
      options: [
        'rectangle',
        'circle',
        'square',
        'triangle',
        'hexagon',
        'custom',
        'all',
        'square-triangle-circle',
        'square-rectangle-circle',
      ],
      table: { category: 'Nodes' },
    },
    nodeScale: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.05 },
      description: 'Uniformly scale nodes around their fixed layout centers without changing connector paths.',
      table: { category: 'Nodes' },
    },
    nodeDepth: {
      control: { type: 'range', min: 1, max: 64, step: 1 },
      table: { category: 'Nodes' },
    },
    nodeDepthRandom: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Random per-node depth variation, from −N% to +N% of nodeDepth.',
      table: { category: 'Nodes' },
    },
    nodeCornerRadius: {
      control: { type: 'range', min: 0, max: 50, step: 1 },
      table: { category: 'Nodes' },
    },
    nodeIconOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Opacity of the SVG artwork on the icon-bearing node face.',
      table: { category: 'Nodes' },
    },
    nodeFrontGradientAngle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Gradient angle for the icon-bearing front face.',
      table: { category: 'Nodes' },
    },
    nodeSideXGradientAngle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Gradient angle for node sides aligned to the X axis.',
      table: { category: 'Nodes' },
    },
    nodeSideZGradientAngle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Gradient angle for node sides aligned to the Z axis.',
      table: { category: 'Nodes' },
    },
    nodeFrontGradientStartColor: { control: 'color', table: { category: 'Nodes' } },
    nodeFrontGradientMidColor: { control: 'color', table: { category: 'Nodes' } },
    nodeFrontGradientEndColor: { control: 'color', table: { category: 'Nodes' } },
    nodeSideXGradientStartColor: { control: 'color', table: { category: 'Nodes' } },
    nodeSideXGradientMidColor: { control: 'color', table: { category: 'Nodes' } },
    nodeSideXGradientEndColor: { control: 'color', table: { category: 'Nodes' } },
    nodeSideZGradientStartColor: { control: 'color', table: { category: 'Nodes' } },
    nodeSideZGradientMidColor: { control: 'color', table: { category: 'Nodes' } },
    nodeSideZGradientEndColor: { control: 'color', table: { category: 'Nodes' } },
    outlineOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Nodes' },
    },
    outlineWidth: {
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
      table: { category: 'Nodes' },
    },

    connectorStroke: {
      control: 'inline-radio',
      options: ['solid', 'dotted', 'dashed'],
      table: { category: 'Connectors' },
    },
    connectorWidth: {
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
      table: { category: 'Connectors' },
    },
    connectorOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Connectors' },
    },
    pathCurve: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Connectors' },
    },
    showContinuationConnectors: {
      control: 'boolean',
      description: 'Show incoming and terminal connectors that continue beyond the graph.',
      table: { category: 'Connectors' },
    },

    nodeProgressMode: {
      control: 'inline-radio',
      options: ['bar', 'outline'],
      table: { category: 'Progress' },
    },
    progressPadding: {
      control: { type: 'range', min: 0, max: 3, step: 0.1 },
      description: 'Relative inset from the node edge; 1 preserves the current spacing.',
      table: { category: 'Progress' },
    },
    progressBarHeight: {
      name: 'progressWidth',
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Thickness used by both bar and outline node progress modes.',
      table: { category: 'Progress' },
    },
    minDelay: {
      control: { type: 'number', min: 0, step: 100 },
      table: { category: 'Progress' },
    },
    maxDelay: {
      control: { type: 'number', min: 0, step: 100 },
      table: { category: 'Progress' },
    },

    speed: {
      control: { type: 'range', min: 0.1, max: 4, step: 0.1 },
      description: 'Multiplier for beam travel, pauses, emission cadence, and node effects.',
      table: { category: 'Beams & Timing' },
    },
    concurrentBeams: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      table: { category: 'Beams & Timing' },
    },
    minEmitDelay: {
      control: { type: 'number', min: 0, step: 100 },
      table: { category: 'Beams & Timing' },
    },
    maxEmitDelay: {
      control: { type: 'number', min: 0, step: 100 },
      table: { category: 'Beams & Timing' },
    },

    flow: { control: 'object', table: { category: 'Data & Assets' } },
    colors: { control: 'object', table: { category: 'Data & Assets' } },
    assetBasePath: { control: 'text', table: { category: 'Data & Assets' } },
  },
  args: {
    showInterface: true,
    interactive: true,
    emitterX: 0.45,
    emitterY: -4.25,
    perspectiveEffect: 0,
    cameraPitch: 45,
    cameraZoom: 1,
    scrollTilt: 0,
    scrollRange: 700,
    gridOpacity: 1,
    gridDensity: 30,
    gridMaskRadius: 320,
    gridMaskBlur: 240,
    fogEnabled: true,
    nodeShape: 'rectangle',
    nodeScale: 1,
    nodeDepth: 12,
    nodeDepthRandom: 0,
    nodeCornerRadius: 10,
    nodeIconOpacity: 0.9,
    nodeFrontGradientAngle: 32,
    nodeSideXGradientAngle: 18,
    nodeSideZGradientAngle: 18,
    ...darkNodeGradientArgs,
    outlineOpacity: 1,
    outlineWidth: 3,
    connectorStroke: 'solid',
    connectorWidth: 2,
    connectorOpacity: 0.82,
    pathCurve: 0,
    showContinuationConnectors: true,
    nodeProgressMode: 'bar',
    progressPadding: 1,
    progressBarHeight: 8,
    minDelay: 0,
    maxDelay: 0,
    speed: 1,
    concurrentBeams: 1,
    minEmitDelay: 0,
    maxEmitDelay: 0,
    assetBasePath: '/assets/nodes',
  },
} satisfies Meta<typeof BusinessFlow3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Workflow1: Story = {
  name: 'Workflow 1',
  args: {
    ...darkNodeGradientArgs,
    ...businessFlow3DHomepageProps,
    interactive: true,
    showInterface: true,
    cameraPitch: 45,
    cameraYaw: 0,
    cameraZoom: 1.4,
    emitterX: 5,
  },
};

export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: businessFlow3DHomepageProps,
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlow3DHomepageProps) },
  },
};
