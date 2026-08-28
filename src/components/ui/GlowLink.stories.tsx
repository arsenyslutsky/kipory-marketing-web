import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { GlowLink } from './GlowLink';
import { glowLinkHomepageProps } from './GlowLink.presets';

const meta = {
  title: 'UI/GlowLink',
  component: GlowLink,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    children: { control: false, table: { disable: true } },
    href: { control: 'text', table: { category: 'Content' } },
    glowActive: {
      control: 'boolean',
      description: 'Keeps the hover glow and orbit animation active while tuning.',
      table: { category: 'Glow' },
    },
    glowColor: { control: 'color', table: { category: 'Glow' } },
    glowEdgeColor: { control: 'color', table: { category: 'Glow' } },
    glowIdleOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Glow' },
    },
    glowHoverOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Glow' },
    },
    glowBlur: {
      control: { type: 'range', min: 0, max: 40, step: 1 },
      table: { category: 'Glow' },
    },
    glowSpread: {
      control: { type: 'range', min: 0, max: 32, step: 1 },
      table: { category: 'Glow' },
    },
    glowDuration: {
      control: { type: 'range', min: 0.25, max: 12, step: 0.05 },
      table: { category: 'Animation' },
    },
    glowEdgeDuration: {
      control: { type: 'range', min: 0.25, max: 12, step: 0.05 },
      table: { category: 'Animation' },
    },
  },
  args: {
    ...glowLinkHomepageProps,
    children: <>Join waiting list <span>↗</span></>,
    href: '/waitlist',
  },
} satisfies Meta<typeof GlowLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  args: { glowActive: true },
};

export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: glowLinkHomepageProps,
  parameters: {
    homepagePreset: { keys: Object.keys(glowLinkHomepageProps) },
  },
};
