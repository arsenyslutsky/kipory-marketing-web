import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { expect, it } from 'vitest';

import { ProtocolIcon } from './ProtocolIcon';
import meta, {
  Graphql,
  Grpc,
  Jsonata,
  Mcp,
  Rest,
  Sockets,
  Sse,
  Webhook,
} from './ProtocolIcon.stories';

it.each([
  [Graphql, 'GraphQL'],
  [Grpc, 'gRPC'],
  [Jsonata, 'JSONata'],
  [Mcp, 'MCP'],
  [Rest, 'REST'],
  [Sockets, 'Sockets'],
  [Sse, 'SSE'],
  [Webhook, 'Webhook'],
] as const)('shows only the protocol name in each Storybook example', (story, name) => {
  const args = { ...meta.args, ...story.args } as ComponentProps<typeof ProtocolIcon>;

  render(<ProtocolIcon {...args} />);

  expect(screen.getByText(name)).toBeInTheDocument();
  expect(screen.queryByText(/protocol/i)).not.toBeInTheDocument();
});

it.each([
  [Graphql, '0.891em'],
  [Grpc, '1em'],
  [Jsonata, '0.594em'],
  [Mcp, '0.922em'],
  [Rest, '1.197em'],
  [Sockets, '1.334em'],
  [Sse, '1em'],
  [Webhook, '1.082em'],
] as const)('derives each Storybook icon width from its height', (story, expectedWidth) => {
  const args = { ...meta.args, ...story.args } as ComponentProps<typeof ProtocolIcon>;
  const { container } = render(<ProtocolIcon {...args} height={16} />);

  expect(container.querySelector('svg')).toHaveAttribute('width', expectedWidth);
});
