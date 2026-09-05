import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HomepageBusinessFlow3D } from '@/app/_components/HomepageBusinessFlow3D';
import heroStyles from '@/app/marketing.module.css';
import { MobileWorkflowFallback } from '@/components/media/MobileWorkflowFallback';
import { MaskedBackground, type MaskedBackgroundProps } from './MaskedBackground';
import { HeroBaseBackground, type HeroBaseBackgroundProps } from './HeroBaseBackground';
import { deliveryBackgroundHomepageProps, heroBackgroundHomepageProps, pillarsBackgroundHomepageProps, heroBaseBackgroundDarkProps, heroBaseBackgroundLightProps } from './MaskedBackground.presets';
import styles from './MaskedBackground.stories.module.css';

type StoryArgs = MaskedBackgroundProps & HeroBaseBackgroundProps;

const meta = {
  title: 'Marketing/Masked Background',
  component: MaskedBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Light and Dark stories for each landing-page background. Save to Next.js updates only its corresponding section. Mask and grid settings are shared by both themes; Hero base colors and gradient settings save independently per theme.',
      },
    },
  },
  argTypes: {
    colorFrom: { table: { disable: true } },
    colorTo: { table: { disable: true } },
    style: { table: { disable: true } },
    angle: { table: { disable: true } },
    variant: { control: false, table: { disable: true } },
    maskSize: { control: false, table: { disable: true } },
    maskWidth: { control: { type: 'range', min: 50, max: 500, step: 1 }, table: { category: 'Mask', disable: false } },
    maskHeight: { control: { type: 'range', min: 50, max: 500, step: 1 }, table: { category: 'Mask', disable: false } },
    invert: { control: 'boolean', table: { category: 'Mask', disable: false } },
    maskShape: { control: 'select', options: ['rectangle', 'ellipsis'], table: { category: 'Mask', disable: false } },
    maskOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, table: { category: 'Mask', disable: false } },
    maskCenterX: { control: { type: 'range', min: 0, max: 100, step: 1 }, table: { category: 'Mask', disable: false } },
    maskCenterY: { control: { type: 'range', min: 0, max: 100, step: 1 }, table: { category: 'Mask', disable: false } },
    gridSize: { control: { type: 'range', min: 8, max: 64, step: 1 }, table: { category: 'Grid', disable: false } },
    gridOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, table: { category: 'Grid', disable: false } },
    className: { table: { disable: true } },
  },
  args: { variant: 'pillars', gridSize: 20 },
  render: (args) => (
    <div className={styles.stage}>
      {args.variant === 'hero' && <HeroBaseBackground colorFrom={args.colorFrom} colorTo={args.colorTo} style={args.style} angle={args.angle} />}
      {args.variant === 'hero' && (
        <div className={heroStyles.heroVisual} aria-hidden="true">
          <MobileWorkflowFallback
            alt=""
            darkSrc="/images/workflows/mobile/hero-flow.png"
            lightSrc="/images/workflows/mobile/hero-flow-light.png"
            fill
            fit="cover"
            height={780}
            name="hero"
            width={390}
          >
            <HomepageBusinessFlow3D />
          </MobileWorkflowFallback>
        </div>
      )}
      <MaskedBackground {...args} />
    </div>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Hero: Story = {
  name: 'Hero (Dark)',
  globals: { theme: 'dark' },
  args: { ...heroBackgroundHomepageProps, ...heroBaseBackgroundDarkProps, variant: 'hero' },
  argTypes: {
    gridSize: { table: { disable: true } }, gridOpacity: { table: { disable: true } },
    colorFrom: { control: 'color', description: 'Unmasked base color beneath the illustration. Does not recolor its opaque ground.', table: { category: 'Base background', disable: false } },
    colorTo: { control: 'color', description: 'Gradient end color; unused for solid backgrounds.', table: { category: 'Base background', disable: false } },
    style: { control: { type: 'select', labels: { solid: 'Solid', linear: 'Linear gradient', circle: 'Circle gradient' } }, options: ['solid', 'linear', 'circle'], table: { category: 'Base background', disable: false } },
    angle: { control: { type: 'range', min: 0, max: 360, step: 1 }, if: { arg: 'style', eq: 'linear' }, table: { category: 'Base background', disable: false } },
  },
  parameters: { homepagePreset: { keys: [...Object.keys(heroBackgroundHomepageProps), ...Object.keys(heroBaseBackgroundDarkProps)] } },
  render: (args) => meta.render({ ...args, variant: 'hero' }),
};
export const HeroLight: Story = {
  ...Hero,
  name: 'Hero (Light)',
  globals: { theme: 'light' },
  args: { ...heroBackgroundHomepageProps, ...heroBaseBackgroundLightProps, variant: 'hero' },
};
export const OurPillars: Story = {
  name: 'Our Pillars (Dark)',
  globals: { theme: 'dark' },
  args: { ...pillarsBackgroundHomepageProps, variant: 'pillars' },
  parameters: { homepagePreset: { keys: Object.keys(pillarsBackgroundHomepageProps) } },
  render: (args) => meta.render({ ...args, variant: 'pillars' }),
};
export const OurPillarsLight: Story = {
  ...OurPillars,
  name: 'Our Pillars (Light)',
  globals: { theme: 'light' },
};
export const Delivery: Story = {
  name: 'Everything Your Team Needs (Dark)',
  globals: { theme: 'dark' },
  args: { ...deliveryBackgroundHomepageProps, variant: 'delivery' },
  parameters: { homepagePreset: { keys: Object.keys(deliveryBackgroundHomepageProps) } },
  render: (args) => meta.render({ ...args, variant: 'delivery' }),
};
export const DeliveryLight: Story = {
  ...Delivery,
  name: 'Everything Your Team Needs (Light)',
  globals: { theme: 'light' },
};
