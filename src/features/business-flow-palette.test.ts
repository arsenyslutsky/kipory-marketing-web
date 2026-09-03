import { expect, it } from 'vitest';
import {
  businessFlowPalette,
  businessFlowPalettes,
  getBusinessFlowPalette,
} from './business-flow-palette';

const flareStops = [
  'rgba(255,255,255,1)',
  'rgba(219,242,217,.96)',
  'rgba(68,156,64,.62)',
  'rgba(68,156,64,.18)',
  'rgba(68,156,64,0)',
] as const;

it('returns independent exact palettes for light and dark workflow scenes', () => {
  expect(getBusinessFlowPalette('dark')).toEqual({
    auxiliaryIconFill: '#212121',
    beam: '#449c40',
    beamHighlight: '#c9ebc7',
    black: '#000000',
    centralIconFill: '#1d281d',
    connector: '#ffffff',
    flare: '#ffffff',
    flareStops,
    frontGradient: { end: '#052f24', mid: '#03492b', start: '#066b43' },
    grid: '#39473f',
    horizontalAuxiliaryIconFill: '#0b270e',
    horizontalCentralIconFill: '#1b4e13',
    horizontalIconStroke: '#9fb996',
    iconStroke: '#f3f5ef',
    nodeShadow: '#000000',
    packetCore: '#f1fbf0',
    packetHalo: '#449c40',
    sideXGradient: { end: '#5c899b', mid: '#10402e', start: '#31775a' },
    sideZGradient: { end: '#0e4b81', mid: '#366480', start: '#427298' },
  });

  expect(getBusinessFlowPalette('light')).toMatchObject({
    beam: '#449c40',
    black: '#111511',
    connector: '#33453a',
    flareStops,
    grid: '#a7b5a8',
    iconStroke: '#182019',
    nodeShadow: '#000000',
  });
  expect(businessFlowPalettes.light).not.toBe(businessFlowPalettes.dark);
  expect(getBusinessFlowPalette('light')).toBe(businessFlowPalettes.light);
  expect(getBusinessFlowPalette('dark')).toBe(businessFlowPalettes.dark);
  expect(businessFlowPalette).toBe(businessFlowPalettes.dark);
});
