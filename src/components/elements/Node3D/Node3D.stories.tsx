import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Node3D } from './Node3D';

const meta = {
  title: 'Elements/Node3D',
  component: Node3D,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
  },
  argTypes: {
    className: { table: { disable: true } },
    width: { control: 'text', table: { category: 'Layout' } },
    height: { control: 'text', table: { category: 'Layout' } },

    mode: {
      control: 'inline-radio',
      options: ['light', 'dark'],
      table: { category: 'Presentation' },
    },
    interactive: {
      control: 'boolean',
      description: 'Enable the same constrained orbit and hover lift used by BusinessFlow3D.',
      table: { category: 'Presentation' },
    },
    floating: {
      control: 'boolean',
      description: 'Apply the subtle idle float from BusinessFlow3D.',
      table: { category: 'Presentation' },
    },
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

    shape: {
      control: 'select',
      options: ['rectangle', 'circle', 'square', 'triangle', 'hexagon'],
      table: { category: 'Geometry' },
    },
    nodeWidth: {
      control: { type: 'range', min: 0.5, max: 8, step: 0.1 },
      description: 'Configured node width before shape-specific equal-area conversion.',
      table: { category: 'Geometry' },
    },
    depth: {
      control: { type: 'range', min: 0.5, max: 6, step: 0.1 },
      description: 'Configured node depth before shape-specific equal-area conversion.',
      table: { category: 'Geometry' },
    },
    nodeDepth: {
      control: { type: 'range', min: 1, max: 64, step: 1 },
      description: 'Vertical extrusion depth using the same pixel-to-world conversion as BusinessFlow3D.',
      table: { category: 'Geometry' },
    },
    nodeScale: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.05 },
      table: { category: 'Geometry' },
    },
    nodeCornerRadius: {
      control: { type: 'range', min: 0, max: 50, step: 1 },
      table: { category: 'Geometry' },
    },

    icon: {
      control: 'select',
      options: [
        'rectangle_default.svg',
        'circle_default.svg',
        'square_default.svg',
        'triangle_default.svg',
        'hexagon_default.svg',
      ],
      table: { category: 'Icon' },
    },
    assetBasePath: { control: 'text', table: { category: 'Icon' } },
    iconColor: { control: 'color', table: { category: 'Icon' } },
    iconOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Icon' },
    },
    iconStrokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Icon' },
    },
    iconStrokeWidth: {
      control: { type: 'range', min: 0, max: 12, step: 0.25 },
      table: { category: 'Icon' },
    },

    frontGradientAngle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      table: { category: 'Front Gradient' },
    },
    frontGradientStartColor: { control: 'color', table: { category: 'Front Gradient' } },
    frontGradientMidColor: { control: 'color', table: { category: 'Front Gradient' } },
    frontGradientEndColor: { control: 'color', table: { category: 'Front Gradient' } },

    sideXGradientAngle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      table: { category: 'X-Side Gradient' },
    },
    sideXGradientStartColor: { control: 'color', table: { category: 'X-Side Gradient' } },
    sideXGradientMidColor: { control: 'color', table: { category: 'X-Side Gradient' } },
    sideXGradientEndColor: { control: 'color', table: { category: 'X-Side Gradient' } },

    sideZGradientAngle: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      table: { category: 'Z-Side Gradient' },
    },
    sideZGradientStartColor: { control: 'color', table: { category: 'Z-Side Gradient' } },
    sideZGradientMidColor: { control: 'color', table: { category: 'Z-Side Gradient' } },
    sideZGradientEndColor: { control: 'color', table: { category: 'Z-Side Gradient' } },

    outlineOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Outline' },
    },
    outlineWidth: {
      control: { type: 'range', min: 0, max: 5, step: 0.25 },
      table: { category: 'Outline' },
    },

    showProgress: { control: 'boolean', table: { category: 'Progress' } },
    progressMode: {
      control: 'inline-radio',
      options: ['bar', 'outline'],
      table: { category: 'Progress' },
    },
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      table: { category: 'Progress' },
    },
    progressPadding: {
      control: { type: 'range', min: 0, max: 3, step: 0.1 },
      table: { category: 'Progress' },
    },
    progressBarHeight: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Stroke width in outline mode and bar thickness in bar mode.',
      table: { category: 'Progress' },
    },

    glowIntensity: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Static preview of the arrival glow driven by BusinessFlow3D beam state.',
      table: { category: 'Glow' },
    },
  },
  args: {
    assetBasePath: '/assets/nodes',
    cameraPitch: 33.19,
    cameraYaw: 28,
    cameraZoom: 1,
    depth: 2.2,
    floating: true,
    frontGradientAngle: 117,
    frontGradientEndColor: '#052f24',
    frontGradientMidColor: '#03492b',
    frontGradientStartColor: '#066b43',
    glowIntensity: 0.55,
    height: '38rem',
    icon: 'hexagon_default.svg',
    iconOpacity: 0.5,
    interactive: true,
    nodeCornerRadius: 10,
    nodeDepth: 20,
    nodeScale: 1,
    nodeWidth: 4.3,
    outlineOpacity: 0,
    outlineWidth: 1,
    perspectiveEffect: 75,
    progress: 0.64,
    progressBarHeight: 15,
    progressMode: 'outline',
    progressPadding: 1,
    shape: 'hexagon',
    showProgress: true,
    sideXGradientAngle: 360,
    sideXGradientEndColor: '#5c899b',
    sideXGradientMidColor: '#10402e',
    sideXGradientStartColor: '#31775a',
    sideZGradientAngle: 177,
    sideZGradientEndColor: '#0e4b81',
    sideZGradientMidColor: '#366480',
    sideZGradientStartColor: '#427298',
    width: 'min(80vw, 48rem)',
  },
} satisfies Meta<typeof Node3D>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Foundation: Story = {};
