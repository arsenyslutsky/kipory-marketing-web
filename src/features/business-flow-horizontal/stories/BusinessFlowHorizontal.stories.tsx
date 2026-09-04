import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { nodeShadowArgTypes } from '@/features/node-shadow-story-controls';
import { iconColorArgTypes } from '@/features/icon-color-story-controls';
import { nodeAppearanceArgTypes } from '@/features/node-appearance-story-controls';
import { BusinessFlowHorizontal } from '../components/BusinessFlowHorizontal';
import {
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from '../presets';

const meta = {
  title: 'Animated Illustrations/BusinessFlowHorizontal',
  component: BusinessFlowHorizontal,
  decorators: [
    (Story) => (
      <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'none' },
  },
  argTypes: {
    ...nodeShadowArgTypes,
    ...iconColorArgTypes,
    ...nodeAppearanceArgTypes,
    className: { table: { disable: true } },
    mode: { table: { disable: true } },
    width: {
      control: 'text',
      table: { category: 'Layout' },
    },
    height: {
      control: 'text',
      table: { category: 'Layout' },
    },
    numberOfNodesLeft: {
      control: { type: 'range', min: 0, max: 12, step: 1 },
      description: 'Number of evenly spaced terminal nodes on the left side.',
      table: { category: 'Auxiliary Nodes' },
    },
    numberOfNodesRight: {
      control: { type: 'range', min: 0, max: 12, step: 1 },
      description: 'Number of evenly spaced incoming nodes on the right side.',
      table: { category: 'Auxiliary Nodes' },
    },
    auxiliaryIconFillColor: {
      control: 'color',
      table: { category: 'Nodes' },
    },
    auxiliaryIconOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Nodes' },
    },
    centralIconFillColor: {
      control: 'color',
      table: { category: 'Nodes' },
    },
    centralIconOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Nodes' },
    },
    centralIconStrokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Nodes' },
    },
    outlineOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Nodes' },
    },
    outlineWidth: {
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
      table: { category: 'Nodes' },
    },
    color: { table: { disable: true } },
    iconSize: {
      control: { type: 'range', min: 24, max: 80, step: 1 },
      table: { category: 'Nodes' },
    },
    nodeProgressMode: {
      control: 'inline-radio',
      options: ['bar', 'outline'],
      description: 'Shape of the processing indicator shown while a beam pauses at a node.',
      table: { category: 'Progress' },
    },
    nodeProgressSize: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Thickness of the bar or outline processing indicator.',
      table: { category: 'Progress' },
    },
    nodeProgressMinDelay: {
      control: { type: 'number', min: 0, step: 100 },
      description: 'Minimum time in milliseconds that a beam pauses at a processing node.',
      table: { category: 'Progress' },
    },
    nodeProgressMaxDelay: {
      control: { type: 'number', min: 0, step: 100 },
      description: 'Maximum time in milliseconds that a beam pauses at a processing node.',
      table: { category: 'Progress' },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.25 },
      table: { category: 'Nodes' },
    },
    connectorColor: {
      control: 'color',
      table: { category: 'Connectors' },
    },
    connectorOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Connectors' },
    },
    connectorWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.25 },
      table: { category: 'Connectors' },
    },
    beamEnabled: {
      control: 'boolean',
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
    beamWidth: {
      control: { type: 'range', min: 0.1, max: 4, step: 0.1 },
      table: { category: 'Beams' },
    },
    beamGlowIntensity: {
      control: { type: 'range', min: 0, max: 3, step: 0.05 },
      description: 'Controls beam glow spread and the leading-packet halo strength.',
      table: { category: 'Beams' },
    },
    beamSpeed: {
      control: { type: 'range', min: 0.25, max: 3, step: 0.05 },
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
      control: { type: 'range', min: 0, max: 320, step: 1 },
      description:
        'Length of the glowing trail behind each beam, measured along its connector path in CSS pixels. Use 0 for an orb only.',
      table: { category: 'Beams' },
    },
    maxConcurrentBeams: {
      control: { type: 'range', min: 0, max: 12, step: 1 },
      description: 'Maximum number of animated beam routes, rotated across the connector network.',
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
    gridColor: {
      control: 'color',
      table: { category: 'Grid' },
    },
    gridDensity: {
      control: { type: 'range', min: 12, max: 80, step: 1 },
      table: { category: 'Grid' },
    },
    gridOpacity: {
      control: { type: 'range', min: 0, max: 0.5, step: 0.01 },
      table: { category: 'Grid' },
    },
  },
} satisfies Meta<typeof BusinessFlowHorizontal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};

export const CurrentNextjsApp: Story = {
  name: 'Current App (Dark)',
  globals: { theme: 'dark' },
  args: { ...businessFlowHorizontalHomepageDarkProps, mode: 'dark' },
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageDarkProps) },
  },
};

export const CurrentAppLight: Story = {
  name: 'Current App (Light)',
  globals: { theme: 'light' },
  args: { ...businessFlowHorizontalHomepageLightProps, mode: 'light' },
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageLightProps) },
  },
};
