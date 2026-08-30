import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ProtocolIcon } from './ProtocolIcon';

it.each([
  ['graphql', 'GraphQL'],
  ['grpc', 'gRPC'],
  ['jsonata', 'JSONata'],
  ['mcp', 'MCP'],
  ['rest', 'REST'],
  ['sockets', 'Sockets'],
  ['sse', 'SSE'],
  ['webhook', 'Webhook'],
] as const)('shows the built-in %s label beside the icon', (variant, label) => {
  const { container } = render(<ProtocolIcon variant={variant} withText />);
  const icon = container.querySelector('svg');
  const visibleLabel = screen.getByText(label);

  expect(visibleLabel).toBeInTheDocument();
  expect(icon).toHaveAttribute('aria-hidden', 'true');
  expect(icon).not.toHaveAttribute('role');
  expect(icon?.parentElement).toContainElement(visibleLabel);
});

it('shows a custom title while keeping presentation props on the SVG', () => {
  render(
    <ProtocolIcon
      data-testid="protocol-icon-with-text"
      variant="mcp"
      title="Model Context Protocol"
      withText
      width={48}
      height={52}
      className="custom-icon"
      color="rgb(68, 156, 64)"
    />,
  );
  const icon = screen.getByTestId('protocol-icon-with-text');

  expect(screen.getByText('Model Context Protocol')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(icon).toHaveAttribute('width', '48');
  expect(icon).toHaveAttribute('height', '52');
  expect(icon).toHaveAttribute('color', 'rgb(68, 156, 64)');
  expect(icon).toHaveClass('custom-icon');
});

it('applies opacity at the whole visible component boundary', () => {
  const { rerender } = render(
    <ProtocolIcon data-testid="opacity-icon" variant="sockets" opacity={0.35} withText />,
  );
  const iconWithText = screen.getByTestId('opacity-icon');

  expect(iconWithText.parentElement).toHaveStyle({ opacity: '0.35' });
  expect(iconWithText).not.toHaveAttribute('opacity');

  rerender(<ProtocolIcon data-testid="opacity-icon" variant="sockets" opacity={0.35} />);
  const iconOnly = screen.getByTestId('opacity-icon');

  expect(iconOnly).toHaveAttribute('opacity', '0.35');
});

it.each([
  [50, '50px'],
  ['3rem', '3rem'],
  ['48', '48px'],
] as const)('sizes a visible title to 80%% of an icon with height %s', (height, wrapperFontSize) => {
  render(
    <ProtocolIcon
      data-testid="sized-protocol-icon"
      variant="graphql"
      height={height}
      withText
    />,
  );

  const icon = screen.getByTestId('sized-protocol-icon');
  const label = screen.getByText('GraphQL');

  expect(icon.parentElement).toHaveStyle({ fontSize: wrapperFontSize });
  expect(label).toHaveStyle({ fontSize: 'var(--protocol-icon-text-size, 0.8em)' });
});

it('keeps the icon-to-title gap proportional when the icon height changes', () => {
  const { rerender } = render(
    <ProtocolIcon data-testid="scalable-gap-icon" variant="mcp" height={48} withText />,
  );
  const largeWrapper = screen.getByTestId('scalable-gap-icon').parentElement;

  expect(getComputedStyle(largeWrapper!).gap)
    .toBe('var(--protocol-icon-logo-text-gap, min(0.625em, 1rem))');

  rerender(<ProtocolIcon data-testid="scalable-gap-icon" variant="mcp" height={16} withText />);
  const smallWrapper = screen.getByTestId('scalable-gap-icon').parentElement;

  expect(getComputedStyle(smallWrapper!).gap)
    .toBe('var(--protocol-icon-logo-text-gap, min(0.625em, 1rem))');
});

it('renders gRPC as a current-color glyph with a transparent counter', () => {
  const { container } = render(<ProtocolIcon variant="grpc" title="gRPC" />);
  const icon = screen.getByRole('img', { name: 'gRPC' });
  const paths = container.querySelectorAll('path');
  const polygons = container.querySelectorAll('polygon');

  expect(icon).toHaveAttribute('viewBox', '0 0 447 447');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '1em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(paths).toHaveLength(2);
  expect(polygons).toHaveLength(3);
  expect(paths[0]).toHaveAttribute('d', expect.stringMatching(/^M134\.89,0/));
  expect(paths[1]).toHaveAttribute('fill-rule', 'evenodd');
  expect(paths[1]).toHaveAttribute('clip-rule', 'evenodd');
  expect(paths[1]).toHaveAttribute('d', expect.stringContaining('M284.81,318.42'));
  expect(polygons[0]).toHaveAttribute('points', expect.stringMatching(/^341\.47 98\.65/));
});

it('renders the GraphQL protocol with transparent current-color cutouts', () => {
  const { container } = render(<ProtocolIcon variant="graphql" title="GraphQL" />);
  const icon = screen.getByRole('img', { name: 'GraphQL' });
  const path = container.querySelector('path');

  expect(icon).toHaveAttribute('viewBox', '0 0 445.82 500.45');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '0.891em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(container.querySelectorAll('path')).toHaveLength(1);
  expect(path).toHaveAttribute('fill-rule', 'evenodd');
  expect(path).toHaveAttribute('clip-rule', 'evenodd');
  expect(path).toHaveAttribute('d', expect.stringMatching(/^M245\.9,494\.28/));
  expect(path?.getAttribute('d')?.match(/M/g)).toHaveLength(5);
});

it('renders the JSONata protocol geometry with an accessible name', () => {
  const { container } = render(<ProtocolIcon variant="jsonata" title="JSONata" />);
  const icon = screen.getByRole('img', { name: 'JSONata' });

  expect(icon).toHaveAttribute('viewBox', '0 0 212.94 358.52');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '0.594em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(container.querySelectorAll('path')).toHaveLength(1);
  expect(container.querySelectorAll('circle')).toHaveLength(2);
  expect(container.querySelector('circle[cx="194.4"][cy="198.63"][r="18.54"]')).toBeInTheDocument();
  expect(container.querySelector('circle[cx="194.39"][cy="102.5"][r="18.55"]')).toBeInTheDocument();
});

it('renders the MCP protocol geometry at its intrinsic aspect ratio', () => {
  const { container } = render(<ProtocolIcon variant="mcp" title="MCP" />);
  const icon = screen.getByRole('img', { name: 'MCP' });
  const paths = container.querySelectorAll('path');

  expect(icon).toHaveAttribute('viewBox', '0 0 393.4 426.58');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '0.922em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(paths).toHaveLength(2);
  expect(paths[0]).toHaveAttribute('d', expect.stringMatching(/^M288,131\.95/));
  expect(paths[1]).toHaveAttribute('d', expect.stringMatching(/^M313\.59,151\.64/));
});

it('renders the REST protocol geometry at its intrinsic aspect ratio', () => {
  const { container } = render(<ProtocolIcon variant="rest" title="REST" />);
  const icon = screen.getByRole('img', { name: 'REST' });

  expect(icon).toHaveAttribute('viewBox', '0 0 179.06 149.63');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '1.197em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(container.querySelectorAll('path')).toHaveLength(2);
  expect(container.querySelectorAll('circle')).toHaveLength(3);
  expect(container.querySelector('circle[cx="53.51"][cy="74.75"][r="10.03"]')).toBeInTheDocument();
  expect(container.querySelector('circle[cx="89.54"][cy="74.75"][r="10.03"]')).toBeInTheDocument();
  expect(container.querySelector('circle[cx="125.56"][cy="74.75"][r="10.03"]')).toBeInTheDocument();
});

it('renders the SSE protocol as rounded current-color strokes', () => {
  const { container } = render(<ProtocolIcon variant="sse" title="SSE" />);
  const icon = screen.getByRole('img', { name: 'SSE' });
  const glyph = container.querySelector('g');
  const paths = container.querySelectorAll('path');
  const lines = container.querySelectorAll('line');

  expect(icon).toHaveAttribute('viewBox', '0 0 32 32');
  expect(icon).toHaveAttribute('width', '1em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(glyph).toHaveAttribute('fill', 'none');
  expect(glyph).toHaveAttribute('stroke', 'currentColor');
  expect(glyph).toHaveAttribute('stroke-width', '2');
  expect(glyph).toHaveAttribute('stroke-linecap', 'round');
  expect(glyph).toHaveAttribute('stroke-linejoin', 'round');
  expect(paths).toHaveLength(3);
  expect(lines).toHaveLength(2);
  expect(paths[1]).toHaveAttribute('d', 'M18 11 A 6 6 0 0 1 18 21');
  expect(paths[2]).toHaveAttribute('d', 'M23 8 A 11 11 0 0 1 23 24');
  expect(lines[0]).toHaveAttribute('stroke-width', '1.5');
  expect(lines[1]).toHaveAttribute('stroke-width', '1.5');
});

it('renders the sockets protocol geometry as a current-color glyph', () => {
  const { container } = render(<ProtocolIcon variant="sockets" title="Sockets" />);
  const icon = screen.getByRole('img', { name: 'Sockets' });
  const paths = container.querySelectorAll('path');

  expect(icon).toHaveAttribute('viewBox', '0 0 801.87 601');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '1.334em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(paths).toHaveLength(2);
  expect(container.querySelectorAll('circle')).toHaveLength(0);
  expect(paths[0]).toHaveAttribute('d', expect.stringMatching(/^M349\.16,0/));
  expect(paths[1]).toHaveAttribute('d', expect.stringMatching(/^M276\.67,415\.33/));
});

it('renders the webhook geometry at its intrinsic aspect ratio', () => {
  const { container } = render(<ProtocolIcon variant="webhook" title="Webhook" />);
  const icon = screen.getByRole('img', { name: 'Webhook' });
  const paths = container.querySelectorAll('path');

  expect(icon).toHaveAttribute('viewBox', '0 0 1142.54 1055.83');
  expect(icon).toHaveAttribute('fill', 'currentColor');
  expect(icon).toHaveAttribute('width', '1.082em');
  expect(icon).toHaveAttribute('height', '1em');
  expect(paths).toHaveLength(3);
  expect(paths[0]).toHaveAttribute('d', expect.stringMatching(/^M585\.21,0/));
  expect(paths[1]).toHaveAttribute('d', expect.stringMatching(/^M1142\.31,771\.3/));
  expect(paths[2]).toHaveAttribute('d', expect.stringMatching(/^M285\.64,1055\.83/));
});

it('stays decorative without a title and forwards SVG presentation props', () => {
  render(
    <ProtocolIcon
      data-testid="protocol-icon"
      variant="jsonata"
      width={48}
      height={81}
      className="custom-icon"
      style={{ color: 'rgb(68, 156, 64)' }}
    />,
  );
  const icon = screen.getByTestId('protocol-icon');

  expect(icon).toHaveAttribute('aria-hidden', 'true');
  expect(icon).not.toHaveAttribute('role');
  expect(icon).toHaveAttribute('width', '48');
  expect(icon).toHaveAttribute('height', '81');
  expect(icon).toHaveClass('custom-icon');
  expect(icon).toHaveStyle({ color: 'rgb(68, 156, 64)' });
});
