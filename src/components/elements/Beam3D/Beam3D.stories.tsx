import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Beam3D } from './Beam3D';

const meta = {
  title: 'Elements/Beam3D',
  component: Beam3D,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    className: { table: { disable: true } },
    width: { control: 'text', table: { category: 'Layout' } },
    height: { control: 'text', table: { category: 'Layout' } },
    path: {
      control: false,
      description: 'Serializable FlowPath3D points shared with Connector3D.',
      table: { category: 'Path' },
    },
    direction: {
      control: 'inline-radio',
      options: ['forward', 'reverse'],
      table: { category: 'Path' },
    },
    delayBeforeDissapear: {
      control: { type: 'range', min: 0, max: 5, step: 0.05 },
      description: 'Seconds to hold at the path end before fading; 0 fades immediately.',
      table: { category: 'Animation' },
    },
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Controlled path progress when playing is disabled.',
      table: { category: 'Animation' },
    },
    playing: { control: 'boolean', table: { category: 'Animation' } },
    speed: {
      control: { type: 'range', min: 0.1, max: 4, step: 0.1 },
      table: { category: 'Animation' },
    },
    visibility: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Animation' },
    },
    startFade: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Animation' },
    },
    style: {
      control: 'inline-radio',
      options: ['ribbon', 'tube'],
      table: { category: 'Style' },
    },
    mode: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      table: { category: 'Style' },
    },
    beamColor: { control: 'color', table: { category: 'Style' } },
    highlightColor: { control: 'color', table: { category: 'Style' } },
    packetColor: { control: 'color', table: { category: 'Style' } },
    packetCoreShape: {
      control: 'inline-radio',
      options: ['circle', 'triangle', 'arrow'],
      description: 'Core silhouette; directional shapes follow the path tangent.',
      table: { category: 'Style' },
    },
    packetCoreSize: {
      control: { type: 'range', min: 0, max: 4, step: 0.05 },
      description: 'Multiplier applied only to the packet core.',
      table: { category: 'Style' },
    },
    packetHaloColor: { control: 'color', table: { category: 'Style' } },
    packetHaloSize: {
      control: { type: 'range', min: 0, max: 4, step: 0.05 },
      description: 'Multiplier applied to the packet halo radius.',
      table: { category: 'Style' },
    },
    packetHaloBlur: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Softens the packet halo edge without changing its size.',
      table: { category: 'Style' },
    },
    packetShadow: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Controls the opacity of the soft shadow behind the packet core.',
      table: { category: 'Style' },
    },
    flareColor: { control: 'color', table: { category: 'Style' } },
    beamWidth: {
      control: { type: 'range', min: 0.1, max: 4, step: 0.1 },
      table: { category: 'Style' },
    },
    glowIntensity: {
      control: { type: 'range', min: 0, max: 3, step: 0.05 },
      description: 'Controls beam glow spread and the packet halo/flare strength.',
      table: { category: 'Style' },
    },
    softness: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Style' },
    },
    trailLength: {
      control: { type: 'range', min: 0.02, max: 1, step: 0.01 },
      table: { category: 'Style' },
    },
    packetVisible: { control: 'boolean', table: { category: 'Style' } },
    interactive: { control: 'boolean', table: { category: 'Presentation' } },
    perspectiveEffect: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: { category: 'Presentation' },
    },
    cameraPitch: {
      control: { type: 'range', min: 0, max: 65, step: 1 },
      table: { category: 'Presentation' },
    },
    cameraYaw: {
      control: { type: 'range', min: -180, max: 180, step: 1 },
      table: { category: 'Presentation' },
    },
    cameraZoom: {
      control: { type: 'range', min: 0.25, max: 2, step: 0.05 },
      table: { category: 'Presentation' },
    },
  },
  args: {
    beamColor: '#449c40',
    beamWidth: 1,
    cameraPitch: 33.19,
    cameraYaw: 0,
    cameraZoom: 1,
    delayBeforeDissapear: 0,
    direction: 'forward',
    flareColor: '#ffffff',
    glowIntensity: 1,
    height: '28rem',
    highlightColor: '#c9ebc7',
    interactive: true,
    mode: 'dark',
    packetColor: '#f1fbf0',
    packetCoreShape: 'circle',
    packetCoreSize: 1,
    packetHaloBlur: 0,
    packetHaloColor: '#449c40',
    packetHaloSize: 1,
    packetShadow: 0,
    packetVisible: true,
    perspectiveEffect: 75,
    playing: true,
    progress: 0.62,
    softness: 0.05,
    speed: 1,
    startFade: 0,
    style: 'ribbon',
    trailLength: 0.38,
    visibility: 1,
    width: 'min(80vw, 48rem)',
  },
} satisfies Meta<typeof Beam3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
