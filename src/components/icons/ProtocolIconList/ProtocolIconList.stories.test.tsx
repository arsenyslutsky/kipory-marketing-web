import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { expect, it } from 'vitest';

import { ProtocolIconList } from './ProtocolIconList';
import meta, {
  CurrentNextjsApp,
  Scrollable,
  WithoutTitle,
  Wrapped,
} from './ProtocolIconList.stories';
import * as protocolIconListStories from './ProtocolIconList.stories';
import { protocolIconListHomepageProps } from './presets';

function renderStory(story: { args?: Partial<ComponentProps<typeof ProtocolIconList>> }) {
  const args = { ...meta.args, ...story.args } as ComponentProps<typeof ProtocolIconList>;

  return render(<ProtocolIconList {...args} />);
}

it('keeps the configured logo order in the wrapped story', () => {
  renderStory(Wrapped);

  expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
    'MCP',
    'REST',
    'GraphQL',
    'gRPC',
    'JSONata',
    'SSE',
    'Sockets',
    'Webhook',
  ]);
});

it('renders the Current Next.js protocol set in the approved order', () => {
  renderStory(CurrentNextjsApp);

  const labels = screen.getAllByRole('listitem').map((item) => {
    const spans = item.querySelectorAll('span');

    return spans.item(spans.length - 1).textContent;
  });

  expect(labels).toEqual(['REST', 'SSE', 'JSONata', 'MCP', 'Webhook', 'GraphQL']);
});

it('provides the horizontal scrolling story', () => {
  renderStory(Scrollable);

  expect(screen.getByRole('list').parentElement).toHaveAttribute('data-layout', 'scroll');
});

it('provides a story without the optional title', () => {
  renderStory(WithoutTitle);

  expect(screen.queryByText('Adjustable Surface')).not.toBeInTheDocument();
});

it('uses the canonical homepage preset in the Next.js-sync story', () => {
  const currentNextjsApp = (
    protocolIconListStories as typeof protocolIconListStories & {
      CurrentNextjsApp?: {
        args?: typeof Wrapped.args;
        name?: string;
        parameters?: {
          controls?: { disableSaveFromUI?: boolean };
          homepagePreset?: { keys?: string[] };
        };
      };
    }
  ).CurrentNextjsApp;

  expect(currentNextjsApp).toBeDefined();
  expect(currentNextjsApp?.name).toBe('Current Next.js App');
  expect(currentNextjsApp?.args).toEqual(protocolIconListHomepageProps);
  expect(currentNextjsApp?.args?.comingSoonOnNextLine).toBe(false);
  expect(currentNextjsApp?.args?.comingSoonRowGap).toBe(49);
  expect(currentNextjsApp?.args?.comingSoonTitleColor).toBe('var(--signal-copy)');
  expect(currentNextjsApp?.args?.comingSoonTitleOpacity).toBe(1);
  expect(currentNextjsApp?.parameters).toEqual({
    controls: { disableSaveFromUI: true },
    homepagePreset: {
      keys: [
        'comingSoonFrom',
        'comingSoonOnNextLine',
        'comingSoonRowGap',
        'comingSoonTitleColor',
        'comingSoonTitleOpacity',
        'comingSoonLogosOpacity',
        'comingSoonLineFadeLength',
        'size',
        'title',
        'logoOpacity',
        'textOpacity',
        'scaleOfComingSoonItems',
        'scaleOfSpaceLogos',
        'scaleOfSpaceItems',
        'variants',
      ],
    },
  });
});

it('exposes a coming-soon item scale control', () => {
  expect(meta.args.scaleOfComingSoonItems).toBe(1);
  expect(meta.argTypes.scaleOfComingSoonItems).toEqual({
    control: { type: 'range', min: 0.5, max: 1.5, step: 0.05 },
    description: 'Scale icons and names from the coming-soon position onward.',
    table: { category: 'Scale' },
  });
});

it('exposes the coming-soon row gap control', () => {
  expect(meta.args.comingSoonRowGap).toBe(40);
  expect(meta.argTypes.comingSoonRowGap).toEqual({
    control: { type: 'range', min: 28, max: 96, step: 1 },
    description: 'Vertical distance between available and coming-soon protocol rows.',
    table: { category: 'Spacing' },
  });
});

it('exposes the coming-soon line layout control', () => {
  expect(meta.args.comingSoonOnNextLine).toBe(false);
  expect(meta.argTypes.comingSoonOnNextLine).toEqual({
    control: 'boolean',
    description: 'Start coming-soon protocols on a new row.',
    table: { category: 'Layout' },
  });
});

it('exposes the coming-soon line fade length control', () => {
  expect(meta.args.comingSoonLineFadeLength).toBe(0.4);
  expect(meta.argTypes.comingSoonLineFadeLength).toEqual({
    control: { type: 'range', min: 0, max: 1, step: 0.05 },
    description: 'Portion of the status line that fades to transparent.',
    table: { category: 'Appearance' },
  });
});

it('exposes a human-friendly coming-soon position control', () => {
  expect(meta.args.comingSoonFrom).toBe(0);
  expect(meta.argTypes.comingSoonFrom).toEqual({
    control: { type: 'range', min: 0, max: 8, step: 1 },
    description: 'Show “Coming soon” from this logo position onward; 0 hides it.',
    table: { category: 'Content' },
  });
});

it('exposes coming-soon opacity controls without a manual marker gap', () => {
  expect(meta.args).toMatchObject({
    comingSoonLogosOpacity: 1,
    comingSoonTitleOpacity: 0.8,
  });
  expect(meta.args).not.toHaveProperty('comingSoonGap');
  expect(meta.argTypes).not.toHaveProperty('comingSoonGap');
  expect(meta.argTypes.comingSoonTitleOpacity).toEqual({
    control: { type: 'range', min: 0, max: 1, step: 0.05 },
    description: 'Opacity of the “Coming soon” marker and its line.',
    table: { category: 'Opacity' },
  });
  expect(meta.argTypes.comingSoonLogosOpacity).toEqual({
    control: { type: 'range', min: 0, max: 1, step: 0.05 },
    description: 'Combined opacity of icons and names from the coming-soon position onward.',
    table: { category: 'Opacity' },
  });
});

it('exposes a coming-soon title color control', () => {
  expect(meta.args.comingSoonTitleColor).toBe('#449c40');
  expect(meta.argTypes.comingSoonTitleColor).toEqual({
    control: 'color',
    description: 'Color of the “Coming soon” marker and its line.',
    table: { category: 'Appearance' },
  });
});
