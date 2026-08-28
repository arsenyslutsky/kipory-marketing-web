import type { ComponentType } from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

type Blocks = Record<string, ComponentType<Record<string, unknown>>>;

it('provides adjustable semantic marketing building blocks', async () => {
  const modulePath = './index';
  const blocks = await import(/* @vite-ignore */ modulePath).catch(() => undefined);

  expect(blocks, 'the marketing building-block module should exist').toBeDefined();
  if (!blocks) return;

  const {
    MarketingSection,
    SiteContainer,
  } = blocks as unknown as Blocks;

  const { unmount } = render(
    <SiteContainer
      data-testid="container"
      maxWidth={960}
      gutter={30}
      compactGutter={18}
    >
      Container content
    </SiteContainer>,
  );
  expect(screen.getByTestId('container')).toHaveStyle({
    '--site-container-max-width': '960px',
    '--site-container-gutter': '30px',
    '--site-container-compact-gutter': '18px',
  });
  unmount();

  render(
    <MarketingSection
      aria-label="Adjustable section"
      tone="alternate"
      grid
      gridFade="left-to-right"
      paddingTop={84}
      paddingBottom={92}
      gridSize={24}
      gridOpacity={0.3}
    >
      Section content
    </MarketingSection>,
  );
  const section = screen.getByRole('region', { name: 'Adjustable section' });
  expect(section).toHaveAttribute('data-tone', 'alternate');
  expect(section).toHaveAttribute('data-grid-fade', 'left-to-right');
  expect(section).toHaveStyle({
    '--marketing-section-padding-top': '84px',
    '--marketing-section-padding-bottom': '92px',
    '--marketing-grid-size': '24px',
    '--marketing-grid-opacity': '0.3',
  });
});

it('composes split layouts, headings, numbered rows, and fields without page CSS', async () => {
  const modulePath = './index';
  const blocks = await import(/* @vite-ignore */ modulePath).catch(() => undefined);

  expect(blocks, 'the marketing building-block module should exist').toBeDefined();
  if (!blocks) return;

  const {
    FormField,
    NumberedRow,
    PageHero,
    SectionHeader,
    SplitLayout,
  } = blocks as unknown as Blocks;

  render(
    <>
      <PageHero
        title="Join the waiting list."
        subtitle="See the flow sooner."
        paddingTop={140}
        paddingBottom={88}
        headingGap={20}
        titleMaxWidth={10}
      />
      <SectionHeader eyebrow="Designed to fit" title="A connected operating system." />
      <SplitLayout
        aria-label="Split preview"
        content={<div>Primary content</div>}
        visual={<div>Visual content</div>}
        contentRatio={3}
        visualRatio={2}
        gap={64}
        reversed
      />
      <NumberedRow
        number="01"
        title="Velocity with flexibility"
        accent="where your business runs"
        body="Supporting explanation"
        href="/waitlist"
      />
      <FormField label="Work email" htmlFor="email" wide>
        <input id="email" name="email" />
      </FormField>
    </>,
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Join the waiting list.' })).toBeInTheDocument();
  expect(screen.getByText('See the flow sooner.')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'A connected operating system.' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Split preview' })).toHaveAttribute('data-reversed', 'true');
  expect(screen.getByRole('heading', { level: 3, name: 'Velocity with flexibility where your business runs' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Velocity with flexibility/i })).toHaveAttribute('href', '/waitlist');
  expect(screen.getByRole('textbox', { name: 'Work email' })).toBeInTheDocument();
});
