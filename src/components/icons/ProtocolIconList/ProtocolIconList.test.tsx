import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { ProtocolIconList } from './ProtocolIconList';
import { protocolIconListHomepageProps } from './presets';

it('renders built-in protocol names in caller order', () => {
  render(<ProtocolIconList variants={['sockets', 'mcp', 'graphql']} />);
  const items = screen.getAllByRole('listitem');

  expect(items).toHaveLength(3);
  expect(within(items[0]).getByText('Sockets')).toBeInTheDocument();
  expect(within(items[1]).getByText('MCP')).toBeInTheDocument();
  expect(within(items[2]).getByText('GraphQL')).toBeInTheDocument();
});

it('shows one coming-soon marker at the requested human-friendly position', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={3}
      variants={['mcp', 'rest', 'graphql', 'grpc']}
    />,
  );
  const items = screen.getAllByRole('listitem');

  expect(within(items[0]).queryByText('Coming soon')).not.toBeInTheDocument();
  expect(within(items[1]).queryByText('Coming soon')).not.toBeInTheDocument();
  expect(within(items[2]).getByText('Coming soon')).toBeInTheDocument();
  expect(within(items[3]).queryByText('Coming soon')).not.toBeInTheDocument();
  expect(screen.getAllByText('Coming soon')).toHaveLength(1);
});

it('keeps coming-soon labels hidden when the position is zero', () => {
  render(<ProtocolIconList comingSoonFrom={0} variants={['mcp', 'rest']} />);

  expect(screen.queryByText('Coming soon')).not.toBeInTheDocument();
});

it('derives the coming-soon marker offset when no title is present', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={2}
      comingSoonTitleOpacity={0.35}
      data-testid="protocol-list"
      logoScale={0.5}
      scaleOfComingSoonItems={0.75}
      variants={['mcp', 'rest']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-status-offset')).toBe('15.6px');
  expect(root.style.getPropertyValue('--protocol-icon-list-status-opacity')).toBe('0.35');
});

it('matches the coming-soon marker typography to the list title', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={2}
      size={30}
      title="Connect & Deliver"
      variants={['mcp', 'rest']}
    />,
  );

  const title = screen.getByText('Connect & Deliver');
  const marker = screen.getByText('Coming soon');
  const titleStyle = getComputedStyle(title);
  const markerStyle = getComputedStyle(marker);

  expect(marker).toHaveStyle({ fontSize: '16px' });
  expect({
    fontFamily: markerStyle.fontFamily,
    fontWeight: markerStyle.fontWeight,
    lineHeight: markerStyle.lineHeight,
    letterSpacing: markerStyle.letterSpacing,
    textTransform: markerStyle.textTransform,
  }).toEqual({
    fontFamily: titleStyle.fontFamily,
    fontWeight: titleStyle.fontWeight,
    lineHeight: titleStyle.lineHeight,
    letterSpacing: titleStyle.letterSpacing,
    textTransform: titleStyle.textTransform,
  });
});

it('matches the homepage coming-soon marker intensity to its title', () => {
  render(
    <ProtocolIconList
      {...protocolIconListHomepageProps}
      data-testid="protocol-list"
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-status-opacity')).toBe(
    root.style.getPropertyValue('--protocol-icon-list-title-opacity'),
  );
  expect(root.style.getPropertyValue('--protocol-icon-list-status-color')).toBe(
    'var(--signal-copy)',
  );
  expect(root.style.getPropertyValue('--protocol-icon-list-status-offset')).toBe(
    '17.633px',
  );
});

it('colors the coming-soon marker independently from the main title', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={2}
      comingSoonTitleColor="#c0ffee"
      data-testid="protocol-list"
      title="Connect & Deliver"
      variants={['mcp', 'rest']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-status-color')).toBe('#c0ffee');
  expect(screen.getByText('Connect & Deliver').style.color).toBe('');
});

it('keeps the coming-soon marker out of the logo row height', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={2}
      title="Connect & Deliver"
      variants={['mcp', 'rest']}
    />,
  );

  const marker = screen.getByText('Coming soon');
  const item = marker.closest('li');

  expect(getComputedStyle(item!).position).toBe('relative');
  expect(getComputedStyle(marker).position).toBe('absolute');
  expect(getComputedStyle(marker).bottom).toBe(
    'calc(100% + var(--protocol-icon-list-status-offset, 6px))',
  );
});

it('starts coming-soon protocols on a second row when requested', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={3}
      comingSoonOnNextLine
      data-testid="protocol-list"
      title="Connect & Deliver"
      variants={['mcp', 'rest', 'graphql', 'grpc']}
    />,
  );

  expect(screen.getByTestId('protocol-list')).toHaveAttribute(
    'data-coming-soon-layout',
    'new-row',
  );
  const rows = screen.getAllByRole('list');

  expect(rows).toHaveLength(2);
  expect(within(rows[0]).getAllByRole('listitem').map((item) => item.textContent))
    .toEqual(['MCP', 'REST']);
  expect(within(rows[1]).getAllByRole('listitem').map((item) => item.textContent))
    .toEqual(['Coming soonGraphQL', 'gRPC']);
});

it('controls the gap between available and coming-soon rows independently', () => {
  render(
    <ProtocolIconList
      comingSoonFrom={2}
      comingSoonOnNextLine
      comingSoonRowGap={40}
      data-testid="protocol-list"
      variants={['mcp', 'rest']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-row-gap')).toBe('40px');
});

it.each([0, 1, 3])(
  'keeps one row when position %s has no preceding protocol group',
  (comingSoonFrom) => {
    render(
      <ProtocolIconList
        comingSoonFrom={comingSoonFrom}
        comingSoonOnNextLine
        data-testid="protocol-list"
        title="Connect & Deliver"
        variants={['mcp', 'rest']}
      />,
    );

    expect(screen.getByTestId('protocol-list')).toHaveAttribute(
      'data-coming-soon-layout',
      'overlay',
    );
    expect(screen.getAllByRole('list')).toHaveLength(1);
  },
);

it('dims every icon and name from the coming-soon position onward', () => {
  const { container } = render(
    <ProtocolIconList
      comingSoonFrom={3}
      comingSoonLogosOpacity={0.25}
      variants={['mcp', 'rest', 'graphql', 'grpc']}
    />,
  );

  expect(
    [...container.querySelectorAll('svg')].map((icon) => icon.parentElement?.style.opacity),
  ).toEqual(['', '', '0.25', '0.25']);
});

it('scales all coming-soon item content without changing available items', () => {
  const { container } = render(
    <ProtocolIconList
      comingSoonFrom={2}
      data-testid="protocol-list"
      scaleOfComingSoonItems={0.75}
      size={40}
      variants={['mcp', 'rest', 'graphql']}
    />,
  );

  const root = screen.getByTestId('protocol-list');
  const items = screen.getAllByRole('listitem');

  expect([...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('height')))
    .toEqual(['40', '30', '30']);
  expect(items[0].style.getPropertyValue('--protocol-icon-text-size')).toBe('');
  expect(items[1].style.getPropertyValue('--protocol-icon-text-size')).toBe('24px');
  expect(items[2].style.getPropertyValue('--protocol-icon-text-size')).toBe('24px');
  expect(items[1].style.getPropertyValue('--protocol-icon-logo-text-gap')).toBe('12px');
  expect(root.style.getPropertyValue('--protocol-icon-list-coming-soon-scale')).toBe('0.75');
});

it('clamps coming-soon opacity controls', () => {
  const { container } = render(
    <ProtocolIconList
      comingSoonFrom={1}
      comingSoonLogosOpacity={2}
      comingSoonTitleOpacity={-1}
      data-testid="protocol-list"
      variants={['mcp']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-status-opacity')).toBe('0');
  expect(container.querySelector('svg')?.parentElement).toHaveStyle({ opacity: '1' });
});

it.each([
  [0, '100%', '100cqi'],
  [0.4, '60%', '60cqi'],
  [1, '0%', '0cqi'],
  [-1, '100%', '100cqi'],
  [2, '0%', '0cqi'],
])(
  'maps fade length %s to a gradient start of %s and a rail width of %s',
  (fadeLength, fadeStart, lineWidth) => {
    render(
      <ProtocolIconList
        comingSoonLineFadeLength={fadeLength}
        data-testid="protocol-list"
        variants={['mcp']}
      />,
    );

    expect(
      screen.getByTestId('protocol-list').style.getPropertyValue(
        '--protocol-icon-list-status-fade-start',
      ),
    ).toBe(fadeStart);
    expect(
      screen.getByTestId('protocol-list').style.getPropertyValue(
        '--protocol-icon-list-status-line-width',
      ),
    ).toBe(lineWidth);
  },
);

it('renders the optional title only when supplied', () => {
  const { rerender } = render(
    <ProtocolIconList title="Adjustable Surface" variants={['rest']} />,
  );

  expect(screen.getByText('Adjustable Surface')).toBeInTheDocument();
  rerender(<ProtocolIconList variants={['rest']} />);
  expect(screen.queryByText('Adjustable Surface')).not.toBeInTheDocument();
});

it.each(['wrap', 'scroll'] as const)('selects the %s layout', (layout) => {
  render(<ProtocolIconList data-testid="protocol-list" layout={layout} variants={['sse']} />);

  expect(screen.getByTestId('protocol-list')).toHaveAttribute('data-layout', layout);
});

it('passes one shared size to every protocol icon', () => {
  const { container } = render(
    <ProtocolIconList size={32} variants={['grpc', 'jsonata']} />,
  );

  expect([...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('height')))
    .toEqual(['32', '32']);
});

it('scales the logo, label, and title independently from their size baselines', () => {
  const { container } = render(
    <ProtocolIconList
      data-testid="protocol-list"
      logoScale={0.7}
      size={30}
      textScale={1.2}
      title="Supports"
      titleScale={0.7}
      variants={['mcp']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(container.querySelector('svg')).toHaveAttribute('height', '21');
  expect(root.style.getPropertyValue('--protocol-icon-text-size')).toBe('28.8px');
  expect(screen.getByText('Supports').style.fontSize).toBe('11.2px');
});

it('scales the title treatment and its separation from the logos', () => {
  render(
    <ProtocolIconList
      data-testid="protocol-list"
      size={16}
      title="Adjustable Surface"
      variants={['mcp']}
    />,
  );

  const root = screen.getByTestId('protocol-list');
  const title = screen.getByText('Adjustable Surface');

  expect(title.style.fontSize).toBe('12px');
  expect(root.style.getPropertyValue('--protocol-icon-list-title-gap')).toBe('12px');
  expect(root.style.getPropertyValue('--protocol-icon-list-title-inline-gap')).toBe('8px');
  expect(root.style.getPropertyValue('--protocol-icon-list-title-rule-width')).toBe('24px');
});

it('reduces the inter-logo gap at small sizes without exceeding the default gap', () => {
  const { rerender } = render(
    <ProtocolIconList data-testid="protocol-list" size={16} variants={['mcp', 'rest']} />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-item-gap')).toBe('16px');

  rerender(
    <ProtocolIconList data-testid="protocol-list" size={96} variants={['mcp', 'rest']} />,
  );
  expect(root.style.getPropertyValue('--protocol-icon-list-item-gap')).toBe('48px');
});

it('scales the gap between entries independently from each logo-label gap', () => {
  render(
    <ProtocolIconList
      data-testid="protocol-list"
      scaleOfSpaceItems={0.5}
      scaleOfSpaceLogos={1.5}
      size={32}
      variants={['mcp', 'rest']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-list-item-gap')).toBe('16px');
  expect(root.style.getPropertyValue('--protocol-icon-logo-text-gap')).toBe('24px');
});

it('controls logo, text, and title opacity independently', () => {
  render(
    <ProtocolIconList
      data-testid="protocol-list"
      logoOpacity={0.2}
      textOpacity={0.45}
      title="Supports"
      titleOpacity={0.7}
      variants={['mcp']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-logo-opacity')).toBe('0.2');
  expect(root.style.getPropertyValue('--protocol-icon-text-opacity')).toBe('0.45');
  expect(root.style.getPropertyValue('--protocol-icon-list-title-opacity')).toBe('0.7');
});

it('clamps opacity values to the supported range', () => {
  render(
    <ProtocolIconList
      data-testid="protocol-list"
      logoOpacity={-0.5}
      textOpacity={1.5}
      title="Supports"
      titleOpacity={2}
      variants={['mcp']}
    />,
  );

  const root = screen.getByTestId('protocol-list');

  expect(root.style.getPropertyValue('--protocol-icon-logo-opacity')).toBe('0');
  expect(root.style.getPropertyValue('--protocol-icon-text-opacity')).toBe('1');
  expect(root.style.getPropertyValue('--protocol-icon-list-title-opacity')).toBe('1');
});

it('renders an empty semantic list for empty input', () => {
  render(<ProtocolIconList variants={[]} />);

  expect(screen.getByRole('list')).toBeEmptyDOMElement();
});
