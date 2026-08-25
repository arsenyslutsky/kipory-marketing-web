'use client';

import { BusinessFlow3D } from './BusinessFlow3D';
import type { BusinessFlow3DProps } from '../types';

type VariantProps = Omit<BusinessFlow3DProps, 'variant'>;

export function BusinessFlow3DVariantTwo(props: VariantProps) {
  return <BusinessFlow3D {...props} variant="variant-2" />;
}
