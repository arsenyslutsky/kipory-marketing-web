import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FormField } from '@/components/marketing';
import { formFieldHomepageProps } from '@/components/marketing/presets';
import { FormControlStoryFrame } from './FormControlStoryFrame';
import { FormInput } from './FormInput';
import {
  formControlCurrentNextjsAppArgs,
  formControlVisualArgs,
  formControlVisualArgTypes,
} from './formControlStoryConfig';

const inputId = 'storybook-form-input';

const meta = {
  title: 'Form Controls/Input',
  component: FormInput,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    ...formControlVisualArgTypes,
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url'],
      table: { category: 'Native input' },
    },
    placeholder: { control: 'text', table: { category: 'Content' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
  args: {
    ...formControlVisualArgs,
    id: inputId,
    name: 'email',
    type: 'email',
    placeholder: 'name@company.com',
    disabled: false,
    required: false,
  },
  render: (args) => (
    <FormControlStoryFrame>
      <FormField {...formFieldHomepageProps} label="Work email" htmlFor={inputId}>
        <FormInput {...args} id={inputId} />
      </FormField>
    </FormControlStoryFrame>
  ),
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: {
    ...formControlCurrentNextjsAppArgs,
    required: true,
  },
};
