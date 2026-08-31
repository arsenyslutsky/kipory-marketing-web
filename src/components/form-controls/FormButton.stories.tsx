import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { FormControlStoryFrame } from './FormControlStoryFrame';
import { FormButton } from './FormButton';

const meta = {
  title: 'Form Controls/Button',
  component: FormButton,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    children: { control: 'text', table: { category: 'Content' } },
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'outline'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'radio',
      options: ['default', 'compact', 'small'],
      table: { category: 'Appearance' },
    },
    icon: {
      control: 'radio',
      options: ['arrow', 'none'],
      table: { category: 'Appearance' },
    },
    type: {
      control: 'radio',
      options: ['button', 'submit', 'reset'],
      table: { category: 'Native button' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    className: { table: { disable: true } },
    ref: { table: { disable: true } },
  },
  args: {
    children: 'Send message',
    variant: 'primary',
    size: 'default',
    icon: 'arrow',
    type: 'button',
    disabled: false,
  },
  render: (args) => (
    <FormControlStoryFrame>
      <FormButton {...args} />
    </FormControlStoryFrame>
  ),
} satisfies Meta<typeof FormButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
export const Secondary: Story = {
  name: 'Secondary',
  args: { variant: 'secondary' },
};
export const Outline: Story = {
  name: 'Outline',
  args: { variant: 'outline' },
};
export const CurrentNextjsApp: Story = {
  name: 'Current Next.js App',
  args: { type: 'submit' },
};
