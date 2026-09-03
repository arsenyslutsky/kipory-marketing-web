import colors from '@/data/colors.json';
import type { ResolvedTheme } from '@/theme/theme';

type FlareStops = readonly [string, string, string, string, string];

export interface BusinessFlowPalette {
  auxiliaryIconFill: string;
  beam: string;
  beamHighlight: string;
  black: string;
  centralIconFill: string;
  connector: string;
  flare: string;
  flareStops: FlareStops;
  frontGradient: NodeGradient;
  grid: string;
  horizontalAuxiliaryIconFill: string;
  horizontalCentralIconFill: string;
  horizontalIconStroke: string;
  iconStroke: string;
  nodeShadow: string;
  packetCore: string;
  packetHalo: string;
  sideXGradient: NodeGradient;
  sideZGradient: NodeGradient;
}

interface NodeGradient {
  end: string;
  mid: string;
  start: string;
}

interface PaletteOverrides {
  auxiliaryIconFill: string;
  centralIconFill: string;
  connector: string;
  frontGradient: NodeGradient;
  horizontalAuxiliaryIconFill: string;
  horizontalCentralIconFill: string;
  horizontalIconStroke: string;
  iconStroke: string;
  sideXGradient: NodeGradient;
  sideZGradient: NodeGradient;
}

type ColorTheme = (typeof colors)[ResolvedTheme];

function copyFlareStops(stops: readonly string[]): FlareStops {
  return [stops[0]!, stops[1]!, stops[2]!, stops[3]!, stops[4]!];
}

function createBusinessFlowPalette(theme: ColorTheme, overrides: PaletteOverrides): BusinessFlowPalette {
  return {
    auxiliaryIconFill: overrides.auxiliaryIconFill,
    beam: theme.effects.beam,
    beamHighlight: theme.effects.beamHighlight,
    black: theme.scene.bounce,
    centralIconFill: overrides.centralIconFill,
    connector: overrides.connector,
    flare: theme.effects.flare,
    flareStops: copyFlareStops(theme.effects.flareStops),
    frontGradient: { ...overrides.frontGradient },
    grid: theme.scene.gridMinor,
    horizontalAuxiliaryIconFill: overrides.horizontalAuxiliaryIconFill,
    horizontalCentralIconFill: overrides.horizontalCentralIconFill,
    horizontalIconStroke: overrides.horizontalIconStroke,
    iconStroke: overrides.iconStroke,
    nodeShadow: '#000000',
    packetCore: theme.effects.packetCore,
    packetHalo: theme.effects.packetHalo,
    sideXGradient: { ...overrides.sideXGradient },
    sideZGradient: { ...overrides.sideZGradient },
  };
}

export const businessFlowPalettes: Record<ResolvedTheme, BusinessFlowPalette> = {
  dark: createBusinessFlowPalette(colors.dark, {
    auxiliaryIconFill: '#212121',
    centralIconFill: '#1d281d',
    connector: colors.dark.effects.nodeStroke,
    frontGradient: { end: '#052f24', mid: '#03492b', start: '#066b43' },
    horizontalAuxiliaryIconFill: '#0b270e',
    horizontalCentralIconFill: '#1b4e13',
    horizontalIconStroke: '#9fb996',
    iconStroke: '#f3f5ef',
    sideXGradient: { end: '#5c899b', mid: colors.dark.scene.cardSideMid, start: colors.dark.scene.cardSideHighlight },
    sideZGradient: { end: '#0e4b81', mid: '#366480', start: '#427298' },
  }),
  light: createBusinessFlowPalette(colors.light, {
    auxiliaryIconFill: '#cfe0cf',
    centralIconFill: '#b7cfb8',
    connector: colors.light.scene.connector,
    frontGradient: { end: colors.light.scene.cardShadow, mid: colors.light.scene.card, start: colors.light.scene.cardHighlight },
    horizontalAuxiliaryIconFill: '#d9e7da',
    horizontalCentralIconFill: colors.light.scene.cardSide,
    horizontalIconStroke: colors.light.scene.edge,
    iconStroke: colors.light.scene.icon,
    sideXGradient: {
      end: colors.light.scene.cardSideShadow,
      mid: colors.light.scene.cardSideMid,
      start: colors.light.scene.cardSideHighlight,
    },
    sideZGradient: { end: colors.light.scene.cardSideShadow, mid: colors.light.scene.cardSide, start: '#d7e9d8' },
  }),
};

export function getBusinessFlowPalette(mode: ResolvedTheme): BusinessFlowPalette {
  return businessFlowPalettes[mode];
}

// Kept for existing workflow consumers until they resolve the active theme themselves.
export const businessFlowPalette = businessFlowPalettes.dark;
