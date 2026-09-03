'use client';

import {
  BusinessFlow3D,
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
  defaultFlow,
  type FlowConfig,
} from '@/features/business-flow-3d';
import { useResolvedTheme } from '@/theme/ThemeProvider';

const homepageFlow = {
  ...defaultFlow,
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

  return <BusinessFlow3D {...preset} flow={homepageFlow} mode={mode} />;
}
