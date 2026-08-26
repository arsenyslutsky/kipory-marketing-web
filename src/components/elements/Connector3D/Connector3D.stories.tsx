import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Connector3D } from './Connector3D';

const meta = {
  title: 'Elements/Connector3D',
  component: Connector3D,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    className: { table: { disable: true } },
    width: { control: 'text', table: { category: 'Layout' } },
    height: { control: 'text', table: { category: 'Layout' } },
    stroke: {
      control: 'inline-radio',
      options: ['solid', 'dotted', 'dashed'],
      table: { category: 'Connector' },
    },
    color: { control: 'color', table: { category: 'Connector' } },
    connectorWidth: {
      control: { type: 'range', min: 0, max: 5, step: 0.1 },
      table: { category: 'Connector' },
    },
    direction: {
      control: 'inline-radio',
      options: ['forward', 'reverse'],
      table: { category: 'Connector' },
    },
    path: {
      control: false,
      description: 'Serializable FlowPath3D points shared with Beam3D.',
      table: { category: 'Connector' },
    },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Connector' },
    },
    pathCurve: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Rounds the stepped path using the same curve treatment as BusinessFlow3D.',
      table: { category: 'Connector' },
    },
    fading: {
      control: 'boolean',
      description: 'Preview the segmented opacity ramp used by incoming continuation connectors.',
      table: { category: 'Connector' },
    },
    interactive: { control: 'boolean', table: { category: 'Presentation' } },
    perspectiveEffect: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Presentation' },
    },
    cameraPitch: {
      control: { type: 'range', min: 0, max: 65, step: 1 },
      table: { category: 'Presentation' },
    },
    cameraYaw: {
      control: { type: 'range', min: -180, max: 180, step: 1 },
      table: { category: 'Presentation' },
    },
    cameraZoom: {
      control: { type: 'range', min: 0.25, max: 2, step: 0.05 },
      table: { category: 'Presentation' },
    },
  },
  args: {
    cameraPitch: 33.19,
    cameraYaw: 0,
    cameraZoom: 1,
    color: '#ffffff',
    connectorWidth: 1,
    direction: 'forward',
    fading: false,
    height: '28rem',
    interactive: true,
    opacity: 0.32,
    pathCurve: 38,
    perspectiveEffect: 75,
    stroke: 'dashed',
    width: 'min(80vw, 48rem)',
  },
} satisfies Meta<typeof Connector3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
