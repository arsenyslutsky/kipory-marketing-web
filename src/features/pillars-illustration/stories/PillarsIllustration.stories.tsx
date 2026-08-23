import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PillarsIllustration } from '../components/PillarsIllustration';

const meta = {
  title: 'Animated Illustrations/Pillars',
  component: PillarsIllustration,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    auxiliaryIconCount: {
      control: { type: 'range', min: 0, max: 60, step: 1 },
      description: 'Number of single-color auxiliary icons distributed around the perimeter.',
    },
    beamColor: { control: 'color' },
    beamEnabled: { control: 'boolean' },
    beamHighlightColor: { control: 'color' },
    beamSpeed: { control: { type: 'range', min: 0.1, max: 3, step: 0.1 } },
    maxConcurrentBeams: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'Maximum number of animated beam routes, distributed across the network.',
    },
    color: { control: 'color' },
    connectorColor: { control: 'color' },
    connectorOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    connectorRadius: {
      control: { type: 'range', min: 0, max: 10, step: 0.25 },
      description: 'Corner radius of connector and beam paths in illustration coordinates.',
    },
    connectorWidth: { control: { type: 'range', min: 0, max: 5, step: 0.25 } },
    gradientStartColor: { control: 'color' },
    gradientMidColor: { control: 'color' },
    gradientEndColor: { control: 'color' },
    gridColor: { control: 'color' },
    gridDensity: { control: { type: 'range', min: 8, max: 160, step: 1 } },
    gridOpacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    width: { control: 'text' },
    height: { control: 'text' },
    iconSize: { control: { type: 'range', min: 32, max: 200, step: 1 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 10, step: 0.25 } },
    className: { table: { disable: true } },
  },
  args: {
    auxiliaryIconCount: 7,
    beamColor: '#449c40',
    beamEnabled: true,
    beamHighlightColor: '#c9ebc7',
    beamSpeed: 1.4,
    maxConcurrentBeams: 4,
    color: '#f3f5ef',
    connectorColor: '#ffffff',
    connectorOpacity: 0.62,
    connectorRadius: 10,
    connectorWidth: 1.25,
    gradientStartColor: '#066b43',
    gradientMidColor: '#03492b',
    gradientEndColor: '#052f24',
    gridColor: '#39473f',
    gridDensity: 30,
    gridOpacity: 0.2,
    width: '20rem',
    height: '38rem',
    iconSize: 40,
    strokeWidth: 2.25,
  },
} satisfies Meta<typeof PillarsIllustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {
  name: 'Foundation',
};
