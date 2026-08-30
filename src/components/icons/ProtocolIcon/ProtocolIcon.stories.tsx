import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ProtocolIcon } from './ProtocolIcon';

const meta = {
  title: 'Icons/ProtocolIcon',
  component: ProtocolIcon,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['graphql', 'grpc', 'jsonata', 'mcp', 'rest', 'sockets', 'sse', 'webhook'],
      table: { category: 'Icon' },
    },
    title: {
      control: 'text',
      description: 'Accessible name and optional visible label.',
      table: { category: 'Accessibility' },
    },
    withText: {
      control: 'boolean',
      description: 'Shows the title beside the icon.',
      table: { category: 'Presentation' },
    },
    color: { control: 'color', table: { category: 'Presentation' } },
    opacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Sets the opacity of the icon and its optional visible label.',
      table: { category: 'Presentation' },
    },
    width: { control: 'number', table: { category: 'Size' } },
    height: { control: 'number', table: { category: 'Size' } },
    className: { table: { disable: true } },
  },
  args: {
    variant: 'jsonata',
    withText: true,
    color: '#f3f5ef',
    height: 48,
    opacity: 1,
  },
} satisfies Meta<typeof ProtocolIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Graphql: Story = {
  name: 'GraphQL',
  args: {
    variant: 'graphql',
    height: 48,
  },
};

export const Grpc: Story = {
  name: 'gRPC',
  args: {
    variant: 'grpc',
    height: 48,
  },
};

export const Jsonata: Story = {
  name: 'JSONata',
};

export const Mcp: Story = {
  name: 'MCP',
  args: {
    variant: 'mcp',
    height: 48,
  },
};

export const Rest: Story = {
  name: 'REST',
  args: {
    variant: 'rest',
    height: 48,
  },
};

export const Sockets: Story = {
  args: {
    variant: 'sockets',
    height: 48,
  },
};

export const Sse: Story = {
  name: 'SSE',
  args: {
    variant: 'sse',
    height: 48,
  },
};

export const Webhook: Story = {
  args: {
    variant: 'webhook',
    height: 48,
  },
};
