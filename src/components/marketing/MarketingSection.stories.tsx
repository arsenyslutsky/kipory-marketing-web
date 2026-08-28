import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MarketingSection } from './MarketingSection';
import { SiteContainer } from './SiteContainer';
import { marketingSectionHomepageProps, siteContainerHomepageProps } from './presets';

const meta = {
  title: 'Marketing/Section',
  component: MarketingSection,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    children: { control: false, table: { disable: true } },
    tone: { control: 'inline-radio', options: ['base', 'alternate', 'alternate-to-base'], table: { category: 'Surface' } },
    grid: { control: 'boolean', table: { category: 'Grid' } },
    gridFade: { control: 'inline-radio', options: ['none', 'left-to-right', 'right-to-left'], table: { category: 'Grid' } },
    paddingTop: { control: { type: 'range', min: 0, max: 240, step: 2 }, table: { category: 'Spacing' } },
    paddingBottom: { control: { type: 'range', min: 0, max: 240, step: 2 }, table: { category: 'Spacing' } },
    gridSize: { control: { type: 'range', min: 8, max: 64, step: 1 }, table: { category: 'Grid' } },
    gridOpacity: { control: { type: 'range', min: 0, max: 1, step: .01 }, table: { category: 'Grid' } },
  },
  args: marketingSectionHomepageProps,
  render: (args) => (
    <MarketingSection {...args}>
      <SiteContainer {...siteContainerHomepageProps}>
        <p className="eyebrow">Adjustable surface</p>
        <h2 style={{ margin: 0 }}>Marketing section</h2>
      </SiteContainer>
    </MarketingSection>
  ),
} satisfies Meta<typeof MarketingSection>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundation: Story = { args: { tone: 'base', grid: false, gridFade: 'none', paddingTop: 80, paddingBottom: 80 } };
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: marketingSectionHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(marketingSectionHomepageProps) } },
};
