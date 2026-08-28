import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MarketingSection } from './MarketingSection';
import { SiteContainer } from './SiteContainer';
import { SplitLayout } from './SplitLayout';
import { siteContainerHomepageProps, splitLayoutHomepageProps } from './presets';

const meta = {
  title: 'Marketing/SplitLayout',
  component: SplitLayout,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    content: { control: false, table: { disable: true } },
    visual: { control: false, table: { disable: true } },
    contentRatio: { control: { type: 'range', min: 1, max: 6, step: .1 }, table: { category: 'Columns' } },
    visualRatio: { control: { type: 'range', min: 1, max: 6, step: .1 }, table: { category: 'Columns' } },
    gap: { control: { type: 'range', min: 0, max: 160, step: 2 }, table: { category: 'Spacing' } },
    reversed: { control: 'boolean', table: { category: 'Columns' } },
  },
  args: { ...splitLayoutHomepageProps, content: null, visual: null },
  render: (args) => (
    <MarketingSection tone="alternate" paddingTop={80} paddingBottom={80}>
      <SiteContainer {...siteContainerHomepageProps}>
        <SplitLayout
          {...args}
          content={<div style={{ minHeight: 280, padding: 28, border: '1px solid var(--surface-alternate-line)' }}>Content column</div>}
          visual={<div style={{ minHeight: 280, padding: 28, background: 'color-mix(in srgb, var(--accent) 16%, transparent)' }}>Visual column</div>}
        />
      </SiteContainer>
    </MarketingSection>
  ),
} satisfies Meta<typeof SplitLayout>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundation: Story = { args: { contentRatio: 1, visualRatio: 1, gap: 32, reversed: false } };
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: splitLayoutHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(splitLayoutHomepageProps) } },
};
