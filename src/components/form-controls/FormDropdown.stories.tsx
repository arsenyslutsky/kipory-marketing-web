import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FormField } from '@/components/marketing';
import { formFieldHomepageProps } from '@/components/marketing/presets';
import { FormControlStoryFrame } from './FormControlStoryFrame';
import { FormDropdown } from './FormDropdown';
import {
  formControlCurrentNextjsAppArgs,
  formControlVisualArgs,
  formControlVisualArgTypes,
} from './formControlStoryConfig';

const dropdownId = 'storybook-form-dropdown';

const meta = {
  title: 'Form Controls/Dropdown',
  component: FormDropdown,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    ...formControlVisualArgTypes,
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
    defaultValue: { table: { disable: true } },
    children: { control: false, table: { disable: true } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
  args: {
    ...formControlVisualArgs,
    id: dropdownId,
    name: 'role',
    defaultValue: '',
    disabled: false,
    required: false,
  },
  render: (args) => (
    <FormControlStoryFrame>
      <FormField {...formFieldHomepageProps} label="Role" htmlFor={dropdownId}>
        <FormDropdown {...args} id={dropdownId}>
          <option value="" disabled>Select your role</option>
          <option value="development-engineering">Development / Engineering</option>
          <option value="management-leadership">Management / Leadership</option>
          <option value="product">Product</option>
          <option value="data-analytics">Data / Analytics</option>
          <option value="operations">Operations</option>
          <option value="other">Other</option>
        </FormDropdown>
      </FormField>
    </FormControlStoryFrame>
  ),
} satisfies Meta<typeof FormDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: {
    ...formControlCurrentNextjsAppArgs,
    required: false,
  },
};
