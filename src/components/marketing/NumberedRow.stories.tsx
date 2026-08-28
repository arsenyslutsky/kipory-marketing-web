import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MarketingSection } from './MarketingSection';
import { NumberedRow } from './NumberedRow';
import { SiteContainer } from './SiteContainer';
import { numberedRowHomepageProps, siteContainerHomepageProps } from './presets';

const meta = {
  title: 'Marketing/NumberedRow',
  component: NumberedRow,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    number: { control: 'text', table: { category: 'Content' } },
    title: { control: 'text', table: { category: 'Content' } },
    accent: { control: 'text', table: { category: 'Content' } },
    body: { control: 'text', table: { category: 'Content' } },
    href: { control: 'text', table: { category: 'Content' } },
    rowPadding: { control: { type: 'range', min: 0, max: 64, step: 2 }, table: { category: 'Spacing' } },
    minHeight: { control: { type: 'range', min: 48, max: 220, step: 2 }, table: { category: 'Layout' } },
    numberColumnWidth: { control: { type: 'range', min: 24, max: 120, step: 2 }, table: { category: 'Layout' } },
    gap: { control: { type: 'range', min: 0, max: 80, step: 2 }, table: { category: 'Spacing' } },
  },
  args: { ...numberedRowHomepageProps, number: '01', title: 'One hybrid data platform', accent: 'for your domain', body: 'Push or connect datasets, documents and media into a governed operational flow.' },
  render: (args) => <MarketingSection tone="alternate" paddingTop={60} paddingBottom={60}><SiteContainer {...siteContainerHomepageProps}><NumberedRow {...args} /></SiteContainer></MarketingSection>,
} satisfies Meta<typeof NumberedRow>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundation: Story = { args: { rowPadding: 20, minHeight: 96, numberColumnWidth: 44, gap: 16 } };
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: numberedRowHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(numberedRowHomepageProps) } },
};
