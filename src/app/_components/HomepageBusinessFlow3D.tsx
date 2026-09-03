'use client';

import {
  BusinessFlow3D,
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
  defaultFlow,
  type FlowConfig,
  type FlowNodeConfig,
} from '@/features/business-flow-3d';
import { useResolvedTheme } from '@/theme/ThemeProvider';

const homepageExtensionNodes = [
  { id: 'publish', position: [-2.7, 19.7], label: 'PUBLISH', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'rectangle' },
  { id: 'permissions', position: [-0.3, 19.7], label: 'PERMISSIONS', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 7, shape: 'hexagon' },
  { id: 'govern', position: [2.1, 19.7], label: 'GOVERN', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'circle' },
  { id: 'stream', position: [4.5, 19.7], label: 'STREAM', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'rectangle' },
  { id: 'history', position: [6.9, 19.7], label: 'HISTORY', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 7, shape: 'circle' },
  { id: 'location', position: [9.3, 19.7], label: 'LOCATION', svg: 'square_default.svg', size: [2.15, 1.25], tier: 7, shape: 'square' },
  { id: 'endpoint', position: [-2.7, 23.2], label: 'ENDPOINT', svg: 'circle_default.svg', size: [2.15, 1.25], tier: 8, shape: 'circle' },
  { id: 'workspace', position: [-0.3, 23.2], label: 'WORKSPACE', svg: 'square_default.svg', size: [2.15, 1.25], tier: 8, shape: 'square' },
  { id: 'review', position: [2.1, 23.2], label: 'REVIEW', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 8, shape: 'hexagon' },
  { id: 'notify', position: [4.5, 23.2], label: 'NOTIFY', svg: 'triangle_default.svg', size: [2.15, 1.25], tier: 8, shape: 'triangle' },
  { id: 'archive', position: [6.9, 23.2], label: 'ARCHIVE', svg: 'rectangle_default.svg', size: [2.15, 1.25], tier: 8, shape: 'rectangle' },
  { id: 'territory', position: [9.3, 23.2], label: 'TERRITORY', svg: 'hexagon_default.svg', size: [2.15, 1.25], tier: 8, shape: 'hexagon' },
] satisfies FlowNodeConfig[];

const homepageFlow = {
  ...defaultFlow,
  nodes: [...defaultFlow.nodes, ...homepageExtensionNodes],
  branches: {
    ...defaultFlow.branches,
    deploy: ['publish'],
    publish: ['endpoint'],
    identity: ['permissions'],
    permissions: ['workspace'],
    audit: ['govern'],
    govern: ['review'],
    signals: ['stream'],
    stream: ['notify'],
    timeline: ['history'],
    history: ['archive'],
    maps: ['location'],
    location: ['territory'],
  },
  variants: {
    ...defaultFlow.variants,
    'variant-2': {
      ...defaultFlow.variants?.['variant-2'],
      hiddenNodes: [
        ...(defaultFlow.variants?.['variant-2']?.hiddenNodes ?? []),
        'compile',
        'artifacts',
      ],
    },
  },
} satisfies FlowConfig;

export function HomepageBusinessFlow3D() {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlow3DHomepageLightProps
    : businessFlow3DHomepageDarkProps;

  return <BusinessFlow3D {...preset} emitterY={-3.5} flow={homepageFlow} mode={mode} />;
}
