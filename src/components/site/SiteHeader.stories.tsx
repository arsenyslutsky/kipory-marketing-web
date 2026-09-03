import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiteHeader } from './SiteHeader';

const meta = {
  title: 'Marketing/SiteHeader',
  component: SiteHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ minHeight: 320, background: 'var(--ink)' }}><Story /></div>],
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;
export const CurrentNextjsApp: Story = { name: 'Current Next.js App' };
