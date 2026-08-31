import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FormField } from '@/components/marketing';
import { formFieldHomepageProps } from '@/components/marketing/presets';
import { FormControlStoryFrame } from './FormControlStoryFrame';
import { FormTextarea } from './FormTextarea';
import {
  formControlCurrentNextjsAppArgs,
  formControlVisualArgs,
  formControlVisualArgTypes,
} from './formControlStoryConfig';

const textareaId = 'storybook-form-textarea';

const meta = {
  title: 'Form Controls/Textarea',
  component: FormTextarea,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    ...formControlVisualArgTypes,
    placeholder: { control: 'text', table: { category: 'Content' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'State' } },
    rows: { control: { type: 'range', min: 2, max: 12, step: 1 }, table: { category: 'Layout' } },
    id: { table: { disable: true } },
    name: { table: { disable: true } },
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
  args: {
    ...formControlVisualArgs,
    id: textareaId,
    name: 'comments',
    placeholder: 'Share a little context…',
    disabled: false,
    required: false,
  },
  render: (args) => (
    <FormControlStoryFrame>
      <FormField {...formFieldHomepageProps} label="Comments" htmlFor={textareaId} wide>
        <FormTextarea {...args} id={textareaId} />
      </FormField>
    </FormControlStoryFrame>
  ),
} satisfies Meta<typeof FormTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: formControlCurrentNextjsAppArgs,
};
