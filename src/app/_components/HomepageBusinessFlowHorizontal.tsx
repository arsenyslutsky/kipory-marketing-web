'use client';

import {
  BusinessFlowHorizontal,
  businessFlowHorizontalHomepageDarkProps,
  businessFlowHorizontalHomepageLightProps,
} from '@/features/business-flow-horizontal';
import { useResolvedTheme } from '@/theme/ThemeProvider';

export function HomepageBusinessFlowHorizontal() {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlowHorizontalHomepageLightProps
    : businessFlowHorizontalHomepageDarkProps;

  return <BusinessFlowHorizontal {...preset} mode={mode} />;
}
