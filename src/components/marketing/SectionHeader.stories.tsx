import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MarketingSection } from './MarketingSection';
import { SectionHeader } from './SectionHeader';
import { SiteContainer } from './SiteContainer';
import { sectionHeaderHomepageProps, siteContainerHomepageProps } from './presets';

const meta = {
  title: 'Marketing/SectionHeader',
  component: SectionHeader,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    eyebrow: { control: 'text', table: { category: 'Content' } },
    title: { control: 'text', table: { category: 'Content' } },
    titleId: { table: { disable: true } },
    headerGap: { control: { type: 'range', min: 0, max: 80, step: 2 }, table: { category: 'Spacing' } },
    titleWidth: { control: { type: 'range', min: 280, max: 1000, step: 10 }, table: { category: 'Layout' } },
  },
  args: { ...sectionHeaderHomepageProps, eyebrow: 'Designed to fit and accelerate', title: 'Everything your team needs to run ahead without compromises.' },
  render: (args) => <MarketingSection tone="alternate" paddingTop={80} paddingBottom={80}><SiteContainer {...siteContainerHomepageProps}><SectionHeader {...args} /></SiteContainer></MarketingSection>,
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundation: Story = { args: { headerGap: 16, titleWidth: 560 } };
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: sectionHeaderHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(sectionHeaderHomepageProps) } },
};
