import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/preview-api';
import { SignalFlowIllustration } from '../components/SignalFlowIllustration';

const meta = {
  title: 'Animated Illustrations/Signal Flow',
  component: SignalFlowIllustration,
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <SignalFlowIllustration
        {...args}
        onModeChange={(mode) => updateArgs({ mode })}
      />
    );
  },
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { table: { disable: true } },
    mode: { control: 'inline-radio', options: ['light', 'dark'] },
    showInterface: { control: 'boolean' },
    gridOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    connectorOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    connectorStroke: { control: 'inline-radio', options: ['solid', 'dotted', 'dashed'] },
    connectorWidth: { control: { type: 'range', min: 0, max: 5, step: 0.25 } },
    pathCurve: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    outlineOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    outlineWidth: { control: { type: 'range', min: 0, max: 5, step: 0.25 } },
    nodeDepth: { control: { type: 'range', min: 1, max: 64, step: 1 } },
    nodeCornerRadius: { control: { type: 'range', min: 0, max: 50, step: 1 } },
    perspectiveEffect: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    minDelay: { control: { type: 'number', min: 0, step: 100 } },
    maxDelay: { control: { type: 'number', min: 0, step: 100 } },
    progressBarHeight: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    concurrentBeams: { control: { type: 'range', min: 1, max: 10, step: 1 } },
    minEmitDelay: { control: { type: 'number', min: 0, step: 100 } },
    maxEmitDelay: { control: { type: 'number', min: 0, step: 100 } },
    reducedMotion: { control: 'boolean' },
    flow: { control: 'object' },
    colors: { control: 'object' },
    assetBasePath: { control: 'text' },
  },
  args: {
    showInterface: true,
    connectorStroke: 'solid',
    connectorWidth: 2,
    pathCurve: 0,
    outlineOpacity: 1,
    outlineWidth: 3,
    nodeDepth: 12,
    nodeCornerRadius: 10,
    perspectiveEffect: 0,
    minDelay: 0,
    maxDelay: 0,
    progressBarHeight: 8,
    concurrentBeams: 1,
    minEmitDelay: 0,
    maxEmitDelay: 0,
    assetBasePath: '/assets/nodes',
  },
} satisfies Meta<typeof SignalFlowIllustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variant2Light: Story = {
  name: 'Variant 2 / Light',
  args: {
    mode: 'light',
    gridOpacity: 1,
    connectorOpacity: 0.5,
    showInterface: false,
    connectorStroke: 'dotted',
    nodeDepth: 27,
    outlineOpacity: 0.55,
    perspectiveEffect: 33,
  },
};

export const Variant2Dark: Story = {
  name: 'Variant 2 / Dark',
  args: { mode: 'dark', gridOpacity: 0.68, connectorOpacity: 0.92 },
};

export const IllustrationOnly: Story = {
  args: { mode: 'dark', showInterface: false, gridOpacity: 0.68, connectorOpacity: 0.92 },
};
