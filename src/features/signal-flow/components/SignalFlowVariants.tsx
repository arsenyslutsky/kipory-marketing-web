'use client';

import { SignalFlowIllustration } from './SignalFlowIllustration';
import type { SignalFlowIllustrationProps } from '../types';

type VariantProps = Omit<SignalFlowIllustrationProps, 'variant'>;

export function VariantTwoSignalFlow(props: VariantProps) {
  return <SignalFlowIllustration {...props} variant="variant-2" />;
}
