import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BusinessFlowHorizontal } from '../components/BusinessFlowHorizontal';
import { businessFlowHorizontalHomepageProps } from '../presets';

const meta = {
  title: 'Animated Illustrations/BusinessFlowHorizontal',
  component: BusinessFlowHorizontal,
  parameters: {
    layout: 'centered',
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
    auxiliaryIconFillColor: {
      control: 'color',
      table: { category: 'Nodes' },
    },
    centralIconFillColor: {
      control: 'color',
      table: { category: 'Nodes' },
    },
    centralIconStrokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Nodes' },
    },
    color: {
      control: 'color',
      table: { category: 'Nodes' },
    },
    iconSize: {
      control: { type: 'range', min: 24, max: 80, step: 1 },
      table: { category: 'Nodes' },
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
    beamSpeed: {
      control: { type: 'range', min: 0.25, max: 3, step: 0.05 },
      table: { category: 'Beams' },
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
  args: businessFlowHorizontalHomepageProps,
} satisfies Meta<typeof BusinessFlowHorizontal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};

export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: businessFlowHorizontalHomepageProps,
  parameters: {
    homepagePreset: { keys: Object.keys(businessFlowHorizontalHomepageProps) },
  },
};
