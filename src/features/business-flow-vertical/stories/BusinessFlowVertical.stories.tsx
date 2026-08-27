import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BusinessFlowVertical } from '../components/BusinessFlowVertical';
import { businessFlowVerticalHomepageProps } from '../presets';

const meta = {
  title: 'Animated Illustrations/BusinessFlowVertical',
  component: BusinessFlowVertical,
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'none' },
  },
  argTypes: {
    className: { table: { disable: true } },

    width: {
      control: 'text',
      table: { category: 'Layout' },
    },
    height: {
      control: 'text',
      table: { category: 'Layout' },
    },

    numberOfNodesTop: {
      control: { type: 'range', min: 0, max: 30, step: 1 },
      description: 'Number of evenly spaced auxiliary nodes in the top row.',
      table: { category: 'Auxiliary Nodes' },
    },
    numberOfNodesBottom: {
      control: { type: 'range', min: 0, max: 30, step: 1 },
      description: 'Number of evenly spaced auxiliary nodes in the bottom row.',
      table: { category: 'Auxiliary Nodes' },
    },
    auxiliaryNodeSpacing: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description:
        'Horizontal row spacing. Lower values tighten node gaps toward the center and increase left/right padding.',
      table: { category: 'Auxiliary Nodes' },
    },
    auxiliaryIconFillColor: {
      control: 'color',
      description: 'Fill color applied to the single-color auxiliary icons.',
      table: { category: 'Auxiliary Nodes' },
    },

    iconSize: {
      control: { type: 'range', min: 32, max: 200, step: 1 },
      table: { category: 'Central Nodes' },
    },
    strokeWidth: {
      control: { type: 'range', min: 1, max: 10, step: 0.25 },
      table: { category: 'Central Nodes' },
    },
    color: {
      control: 'color',
      table: { category: 'Central Nodes' },
    },
    centralIconFillMode: {
      control: 'radio',
      options: ['gradient', 'black'],
      description: 'Fill treatment for the four central pillar icons.',
      table: { category: 'Central Nodes' },
    },
    centralIconFillColor: {
      control: 'color',
      description: 'Solid fill color used when centralIconFillMode is black.',
      table: { category: 'Central Nodes' },
    },
    centralIconStrokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Stroke opacity of the four central pillar icons.',
      table: { category: 'Central Nodes' },
    },
    gradientStartColor: {
      control: 'color',
      table: { category: 'Central Nodes' },
    },
    gradientMidColor: {
      control: 'color',
      table: { category: 'Central Nodes' },
    },
    gradientEndColor: {
      control: 'color',
      table: { category: 'Central Nodes' },
    },

    connectorColor: {
      control: 'color',
      table: { category: 'Connectors' },
    },
    connectorOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Connectors' },
    },
    connectorRadius: {
      control: { type: 'range', min: 0, max: 10, step: 0.25 },
      description: 'Corner radius of connector and beam paths in illustration coordinates.',
      table: { category: 'Connectors' },
    },
    connectorWidth: {
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
      table: { category: 'Connectors' },
    },
    showContinuationConnectors: {
      control: 'boolean',
      description:
        'Show off-canvas incoming connectors above the top row and outgoing connectors below the bottom row. Beams traverse them when enabled.',
      table: { category: 'Connectors' },
    },

    beamEnabled: {
      control: 'boolean',
      table: { category: 'Beams' },
    },
    beamSpeed: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
      table: { category: 'Beams' },
    },
    beamEmissionRandomness: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description:
        'Amount of beam-emission timing randomization. Use 0 for deterministic staggering and 100 for fully randomized pauses.',
      table: { category: 'Beams' },
    },
    beamHeadGlowRadius: {
      control: { type: 'range', min: 0, max: 64, step: 1 },
      description:
        'Radius of the radial halo around the leading beam orb, in CSS pixels. Use 0 to hide the additional halo.',
      table: { category: 'Beams' },
    },
    beamHeadGlowOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Opacity of the radial halo around the leading beam orb.',
      table: { category: 'Beams' },
    },
    beamHeadGlowBlur: {
      control: { type: 'range', min: 0, max: 32, step: 1 },
      description: 'Additional CSS blur applied to the leading beam halo, in pixels.',
      table: { category: 'Beams' },
    },
    beamTrailLength: {
      control: { type: 'range', min: 0, max: 40, step: 0.5 },
      description:
        'Length of the glowing trail behind each beam, measured along its connector path in illustration units. Use 0 for an orb only.',
      table: { category: 'Beams' },
    },
    maxConcurrentBeams: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Maximum number of animated beam routes, distributed across the network.',
      table: { category: 'Beams' },
    },
    beamColor: {
      control: 'color',
      table: { category: 'Beams' },
    },
    beamHighlightColor: {
      control: 'color',
      table: { category: 'Beams' },
    },

    burstFadeTime: {
      control: { type: 'range', min: 100, max: 5000, step: 50 },
      description: 'Node-arrival burst decay time in milliseconds.',
      table: { category: 'Arrival Bursts' },
    },
    burstRadius: {
      control: { type: 'range', min: 0, max: 128, step: 1 },
      description: 'Radius of each node-arrival burst in CSS pixels.',
      table: { category: 'Arrival Bursts' },
    },
    burstStrength: {
      control: { type: 'range', min: 0, max: 3, step: 0.1 },
      description: 'Brightness multiplier applied to each node-arrival burst.',
      table: { category: 'Arrival Bursts' },
    },

    gridOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Grid' },
    },
    gridDensity: {
      control: { type: 'range', min: 8, max: 160, step: 1 },
      table: { category: 'Grid' },
    },
    gridColor: {
      control: 'color',
      table: { category: 'Grid' },
    },
  },
  args: businessFlowVerticalHomepageProps,
} satisfies Meta<typeof BusinessFlowVertical>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  name: 'Foundation',
};

export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: businessFlowVerticalHomepageProps,
};
