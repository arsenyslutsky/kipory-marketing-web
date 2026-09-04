'use client';

import {
  BusinessFlowVertical,
  businessFlowVerticalHomepageDarkProps,
  businessFlowVerticalHomepageLightProps,
  type BusinessFlowVerticalProps,
} from '@/features/business-flow-vertical';
import { useResolvedTheme } from '@/theme/ThemeProvider';

export function HomepageBusinessFlowVertical({
  className,
}: Pick<BusinessFlowVerticalProps, 'className'>) {
  const mode = useResolvedTheme();
  const preset = mode === 'light'
    ? businessFlowVerticalHomepageLightProps
    : businessFlowVerticalHomepageDarkProps;

  return <BusinessFlowVertical {...preset} className={className} mode={mode} />;
}
