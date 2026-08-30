import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HomepageHero } from '@/app/_components/HomepageHero';
import pageStyles from '@/app/marketing.module.css';
import { HeroScrollEffects } from '@/components/site/HeroScrollEffects';
import { PageHero } from './PageHero';
import { pageHeroHomepageProps } from './presets';

const meta = {
  title: 'Marketing/PageHero',
  component: PageHero,
  parameters: { layout: 'fullscreen', controls: { sort: 'none' } },
  argTypes: {
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    titleId: { table: { disable: true } },
    paddingTop: { control: { type: 'range', min: 72, max: 260, step: 2 }, table: { category: 'Spacing' } },
    paddingBottom: { control: { type: 'range', min: 40, max: 180, step: 2 }, table: { category: 'Spacing' } },
    headingGap: { control: { type: 'range', min: 0, max: 80, step: 2 }, table: { category: 'Spacing' } },
    titleMaxWidth: { control: { type: 'range', min: 5, max: 24, step: .5 }, table: { category: 'Layout' } },
  },
  args: { ...pageHeroHomepageProps, title: 'Join the waiting list.', subtitle: 'SEE THE FLOW SOONER.' },
} satisfies Meta<typeof PageHero>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Foundation: Story = { args: { paddingTop: 140, paddingBottom: 80, headingGap: 20, titleMaxWidth: 12 } };
export const CurrentNextjsApp: Story = {
  name: 'Current Nextjs Pages',
  args: pageHeroHomepageProps,
  parameters: { homepagePreset: { keys: Object.keys(pageHeroHomepageProps) } },
};
export const Hero: Story = {
  name: 'Hero',
  render: () => (
    <HeroScrollEffects
      className={pageStyles.main}
      data-content-reveal-ready="false"
      data-workflows-ready="false"
      scrollRange={700}
    >
      <HomepageHero />
    </HeroScrollEffects>
  ),
  parameters: { controls: { disable: true } },
};
