'use client';

import {
  BusinessFlow3D,
  businessFlow3DHomepageDarkProps,
  businessFlow3DHomepageLightProps,
  homepageFlow,
} from '@/features/business-flow-3d';
import { useResolvedTheme } from '@/theme/ThemeProvider';

export function HomepageBusinessFlow3D() {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlow3DHomepageLightProps
    : businessFlow3DHomepageDarkProps;

  return <BusinessFlow3D {...preset} flow={homepageFlow} mode={mode} />;
}
