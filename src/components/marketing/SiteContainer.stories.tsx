import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiteContainer } from './SiteContainer';
import { siteContainerHomepageProps } from './presets';

const meta = {
  title: 'Marketing/SiteContainer',
  component: SiteContainer,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    children: { control: false, table: { disable: true } },
    maxWidth: { control: { type: 'range', min: 640, max: 1600, step: 10 }, table: { category: 'Layout' } },
    gutter: { control: { type: 'range', min: 0, max: 96, step: 2 }, table: { category: 'Layout' } },
    compactGutter: { control: { type: 'range', min: 0, max: 48, step: 2 }, table: { category: 'Responsive' } },
  },
  args: siteContainerHomepageProps,
  render: (args) => (
    <SiteContainer {...args}>
      <div style={{ minHeight: 260, padding: 32, background: 'var(--surface-alternate)', border: '1px solid var(--surface-alternate-line)' }}>
        Adjustable site container
      </div>
    </SiteContainer>
  ),
} satisfies Meta<typeof SiteContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = { args: { maxWidth: 960, gutter: 32, compactGutter: 18 } };
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: siteContainerHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(siteContainerHomepageProps) } },
};
