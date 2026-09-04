import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProtocolIconList } from './ProtocolIconList';
import { protocolIconListHomepageProps } from './presets';

const variants = [
  'mcp',
  'rest',
  'graphql',
  'grpc',
  'jsonata',
  'sse',
  'sockets',
  'webhook',
] as const;

const meta = {
  title: 'Icons/ProtocolIconList',
  component: ProtocolIconList,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    comingSoonFrom: {
      control: { type: 'range', min: 0, max: variants.length, step: 1 },
      description: 'Show “Coming soon” from this logo position onward; 0 hides it.',
      table: { category: 'Content' },
    },
    comingSoonOnNextLine: {
      control: 'boolean',
      description: 'Start coming-soon protocols on a new row.',
      table: { category: 'Layout' },
    },
    comingSoonRowGap: {
      control: { type: 'range', min: 28, max: 96, step: 1 },
      description: 'Vertical distance between available and coming-soon protocol rows.',
      table: { category: 'Spacing' },
    },
    comingSoonTitleOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Opacity of the “Coming soon” marker and its line.',
      table: { category: 'Opacity' },
    },
    comingSoonTitleColor: {
      control: 'color',
      description: 'Color of the “Coming soon” marker and its line.',
      table: { category: 'Appearance' },
    },
    comingSoonLogosOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Combined opacity of icons and names from the coming-soon position onward.',
      table: { category: 'Opacity' },
    },
    comingSoonLineFadeLength: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Portion of the status line that fades to transparent.',
      table: { category: 'Appearance' },
    },
    variants: {
      control: 'object',
      table: { category: 'Content' },
    },
    title: {
      control: 'text',
      table: { category: 'Content' },
    },
    layout: {
      control: 'inline-radio',
      options: ['wrap', 'scroll'],
      table: { category: 'Layout' },
    },
    size: {
      control: { type: 'range', min: 16, max: 96, step: 1 },
      table: { category: 'Size' },
    },
    logoScale: {
      control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
      table: { category: 'Scale' },
    },
    scaleOfComingSoonItems: {
      control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
      description: 'Scale icons and names from the coming-soon position onward.',
      table: { category: 'Scale' },
    },
    textScale: {
      control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
      table: { category: 'Scale' },
    },
    titleScale: {
      control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
      table: { category: 'Scale' },
    },
    scaleOfSpaceItems: {
      control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
      table: { category: 'Spacing' },
    },
    scaleOfSpaceLogos: {
      control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
      table: { category: 'Spacing' },
    },
    logoOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Opacity' },
    },
    textOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Opacity' },
    },
    titleOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Opacity' },
    },
  },
  args: {
    comingSoonFrom: 0,
    comingSoonOnNextLine: false,
    comingSoonRowGap: 40,
    comingSoonTitleColor: '#449c40',
    comingSoonTitleOpacity: 0.8,
    comingSoonLogosOpacity: 1,
    comingSoonLineFadeLength: 0.4,
    layout: 'wrap',
    logoOpacity: 1,
    logoScale: 1,
    scaleOfComingSoonItems: 1,
    scaleOfSpaceItems: 1,
    scaleOfSpaceLogos: 1,
    size: 48,
    textOpacity: 1,
    textScale: 1,
    title: 'Adjustable Surface',
    titleOpacity: 1,
    titleScale: 1,
    variants,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(1100px, calc(100vw - 64px))' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProtocolIconList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wrapped: Story = {
  args: {
    comingSoonFrom: 0,
    comingSoonTitleOpacity: 0.8,
    comingSoonLogosOpacity: 1,
    comingSoonLineFadeLength: 0.4,
    size: 23,
    title: "Connect & Deliver",
    logoOpacity: 0.5,
    textOpacity: 0.3,
    scaleOfSpaceLogos: 0.5,
    scaleOfSpaceItems: 1.25
  }
};

export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: protocolIconListHomepageProps,
  parameters: {
    controls: { disableSaveFromUI: true },
    homepagePreset: { keys: Object.keys(protocolIconListHomepageProps) },
  },
};

export const Scrollable: Story = {
  args: {
    layout: 'scroll',
  },
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
  },
};
