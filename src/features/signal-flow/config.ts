import flowJson from '@/data/flow.json';
import colorsJson from '@/data/colors.json';
import type { CSSProperties } from 'react';
import type { FlowConfig, SignalFlowColors, SignalFlowTheme } from './types';

export const defaultFlow = flowJson as unknown as FlowConfig;
export const defaultColors = colorsJson as unknown as SignalFlowColors;

export function cssVariablesForTheme(theme: SignalFlowTheme) {
  return Object.fromEntries(
    Object.entries(theme.ui).map(([name, value]) => [
      `--ui-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
      value,
    ]),
  ) as CSSProperties;
}
