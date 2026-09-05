import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { nodeShadowArgTypes } from '@/features/node-shadow-story-controls';
import { iconColorArgTypes } from '@/features/icon-color-story-controls';
import { nodeAppearanceArgTypes } from '@/features/node-appearance-story-controls';
import { BusinessCoreNodeFlow } from '../components/BusinessCoreNodeFlow';
import { businessCoreNodeFlowIconOptions } from '../nodes';
import {
  businessCoreNodeFlowContactProps,
  businessCoreNodeFlowFoundationProps,
  businessCoreNodeFlowWaitlistProps,
} from '../presets';

const meta = {
  title: 'Animated Illustrations/BusinessCoreNodeFlow',
  component: BusinessCoreNodeFlow,
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
    activityStrategy: {
      control: 'inline-radio',
      options: ['visible', 'always'],
      description: 'Run animation only while visible or continuously after initialization.',
      table: { category: 'Runtime' },
    },
    loadStrategy: {
      control: 'inline-radio',
      options: ['eager', 'near-viewport'],
      description: 'Initialize immediately or shortly before the illustration enters the viewport.',
      table: { category: 'Runtime' },
    },
    resolutionScale: {
      control: 'select',
      options: ['display', 0.5, 0.75, 1, 1.5, 2],
      description: 'Match display density or apply a fixed renderer pixel-density multiplier.',
      table: { category: 'Runtime' },
    },
    size: { control: 'text', table: { category: 'Layout' } },
    numberOfAuxiliaryConnections: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Number of evenly distributed radial routes leaving the center core.',
      table: { category: 'Auxiliary Connections' },
    },
    showAuxiliaryNodes: {
      control: 'boolean',
      description: 'Show one processing node on each radial route without removing the route itself.',
      table: { category: 'Auxiliary Connections' },
    },
    connectorColor: { control: 'color', table: { category: 'Connectors' } },
    connectorOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Connectors' },
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
    beamEnabled: { control: 'boolean', table: { category: 'Beams' } },
    beamColor: { control: 'color', table: { category: 'Beams' } },
    beamHighlightColor: { control: 'color', table: { category: 'Beams' } },
    beamGlowIntensity: {
      control: { type: 'range', min: 0, max: 3, step: 0.05 },
      table: { category: 'Beams' },
    },
    beamWidth: {
      control: { type: 'range', min: 0.1, max: 4, step: 0.1 },
      table: { category: 'Beams' },
    },
    beamSpeed: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
      table: { category: 'Beams' },
    },
    beamEmissionRandomness: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Amount of timing randomization between outward beam emissions.',
      table: { category: 'Beams' },
    },
    beamHeadGlowRadius: {
      control: { type: 'range', min: 0, max: 64, step: 1 },
      table: { category: 'Beams' },
    },
    beamHeadGlowOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Beams' },
    },
    beamHeadGlowBlur: {
      control: { type: 'range', min: 0, max: 32, step: 1 },
      table: { category: 'Beams' },
    },
    beamTrailLength: {
      control: { type: 'range', min: 0, max: 720, step: 1 },
      description: 'Glowing trail length in square illustration pixels.',
      table: { category: 'Beams' },
    },
    maxConcurrentBeams: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      table: { category: 'Beams' },
    },
    centralIcon: {
      control: 'select',
      options: businessCoreNodeFlowIconOptions,
      table: { category: 'Nodes' },
    },
    auxiliaryIcon: {
      control: 'select',
      options: ['mixed', ...businessCoreNodeFlowIconOptions],
      table: { category: 'Nodes' },
    },
    auxiliaryIconFillColor: { control: 'color', table: { category: 'Nodes' } },
    centralIconFillColor: { control: 'color', table: { category: 'Nodes' } },
    centralIconStrokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Nodes' },
    },
    color: { table: { disable: true } },
    iconSize: {
      control: { type: 'range', min: 24, max: 80, step: 1 },
      table: { category: 'Nodes' },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.25 },
      table: { category: 'Nodes' },
    },
    nodeProgressMode: {
      control: 'inline-radio',
      options: ['bar', 'outline'],
      table: { category: 'Progress' },
    },
    nodeProgressSize: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Progress' },
    },
    nodeProgressMinDelay: {
      control: { type: 'number', min: 0, step: 100 },
      table: { category: 'Progress' },
    },
    nodeProgressMaxDelay: {
      control: { type: 'number', min: 0, step: 100 },
      table: { category: 'Progress' },
    },
    burstFadeTime: {
      control: { type: 'range', min: 100, max: 5000, step: 50 },
      table: { category: 'Arrival Bursts' },
    },
    burstRadius: {
      control: { type: 'range', min: 0, max: 128, step: 1 },
      table: { category: 'Arrival Bursts' },
    },
    burstStrength: {
      control: { type: 'range', min: 0, max: 3, step: 0.1 },
      table: { category: 'Arrival Bursts' },
    },
    gridColor: { control: 'color', table: { category: 'Grid' } },
    gridDensity: {
      control: { type: 'range', min: 12, max: 80, step: 1 },
      table: { category: 'Grid' },
    },
    gridOpacity: {
      control: { type: 'range', min: 0, max: 0.5, step: 0.01 },
      table: { category: 'Grid' },
    },
  },
  args: businessCoreNodeFlowFoundationProps,
} satisfies Meta<typeof BusinessCoreNodeFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  args: {
    loadStrategy: "near-viewport",
    showAuxiliaryNodes: false,
    size: "min(22rem, 90vw)"
  }
};

export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: businessCoreNodeFlowContactProps,
  parameters: {
    homepagePreset: { keys: Object.keys(businessCoreNodeFlowContactProps) },
  },
};

export const CurrentNextjsApp2: Story = {
  name: 'Current Next.js App 2',
  args: businessCoreNodeFlowWaitlistProps,
  parameters: {
    homepagePreset: { keys: Object.keys(businessCoreNodeFlowWaitlistProps) },
  },
};
