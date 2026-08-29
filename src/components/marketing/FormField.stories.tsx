import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FormField } from './FormField';
import { MarketingSection } from './MarketingSection';
import { SiteContainer } from './SiteContainer';
import { formFieldHomepageProps, siteContainerHomepageProps } from './presets';

const meta = {
  title: 'Marketing/FormField',
  component: FormField,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    children: { control: false, table: { disable: true } },
    label: { control: 'text', table: { category: 'Content' } },
    htmlFor: { table: { disable: true } },
    wide: { control: 'boolean', table: { category: 'Layout' } },
    fieldGap: { control: { type: 'range', min: 0, max: 40, step: 1 }, table: { category: 'Spacing' } },
    controlPadding: { control: { type: 'range', min: 0, max: 40, step: 1 }, table: { category: 'Spacing' } },
    textareaHeight: { control: { type: 'range', min: 48, max: 320, step: 4 }, table: { category: 'Layout' } },
  },
  args: { ...formFieldHomepageProps, label: 'Work email', htmlFor: 'storybook-email', wide: false },
  render: (args) => <MarketingSection tone="alternate" paddingTop={80} paddingBottom={80}><SiteContainer {...siteContainerHomepageProps}><div style={{ maxWidth: 520 }}><FormField {...args}><input id="storybook-email" type="email" placeholder="name@company.com" /></FormField></div></SiteContainer></MarketingSection>,
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundation: Story = { args: { fieldGap: 8, controlPadding: 12, textareaHeight: 110 } };
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: formFieldHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(formFieldHomepageProps) } },
};
