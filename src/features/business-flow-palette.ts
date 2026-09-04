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
  homepageNodeFrontStart: string;
  horizontalAuxiliaryIconFill: string;
  horizontalCentralIconFill: string;
  horizontalIconStroke: string;
  iconStroke: string;
  nodeShadow: string;
  packetCore: string;
  packetHalo: string;
  sideXGradient: NodeGradient;
  sideZGradient: NodeGradient;
  white: string;
}

interface NodeGradient {
  end: string;
  mid: string;
  start: string;
}

export interface BusinessFlowHeroTreatment {
  connectorColor: string;
  connectorStroke: 'dashed' | 'solid';
  frontGradient: NodeGradient;
  iconFill: string;
  iconStroke: string;
  nodeCornerRadius: number;
  nodeShadowLightX: number;
  nodeShadowLightY: number;
  nodeShadowLightZ: number;
  nodeShadowOpacity: number;
  nodeShadowRadius: number;
  outlineOpacity: number;
  outlineWidth: number;
  sideXGradient: NodeGradient;
  sideZGradient: NodeGradient;
}

interface PaletteOverrides {
  auxiliaryIconFill: string;
  centralIconFill: string;
  connector: string;
  frontGradient: NodeGradient;
  homepageNodeFrontStart: string;
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
    homepageNodeFrontStart: overrides.homepageNodeFrontStart,
    horizontalAuxiliaryIconFill: overrides.horizontalAuxiliaryIconFill,
    horizontalCentralIconFill: overrides.horizontalCentralIconFill,
    horizontalIconStroke: overrides.horizontalIconStroke,
    iconStroke: overrides.iconStroke,
    nodeShadow: '#000000',
    packetCore: theme.effects.packetCore,
    packetHalo: theme.effects.packetHalo,
    sideXGradient: { ...overrides.sideXGradient },
    sideZGradient: { ...overrides.sideZGradient },
    white: theme.scene.sky,
  };
}

export const businessFlowPalettes: Record<ResolvedTheme, BusinessFlowPalette> = {
  dark: createBusinessFlowPalette(colors.dark, {
    auxiliaryIconFill: '#212121',
    centralIconFill: '#1d281d',
    connector: colors.dark.effects.nodeStroke,
    frontGradient: { end: '#052f24', mid: '#03492b', start: '#066b43' },
    homepageNodeFrontStart: '#066b43',
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
    homepageNodeFrontStart: '#98c496',
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

export const businessFlowHeroTreatments: Record<ResolvedTheme, BusinessFlowHeroTreatment> = {
  dark: {
    connectorColor: businessFlowPalettes.dark.connector,
    connectorStroke: 'dashed',
    frontGradient: { ...businessFlowPalettes.dark.frontGradient },
    iconFill: businessFlowPalettes.dark.iconStroke,
    iconStroke: businessFlowPalettes.dark.iconStroke,
    nodeCornerRadius: 10,
    nodeShadowLightX: -6,
    nodeShadowLightY: 14,
    nodeShadowLightZ: -5,
    nodeShadowOpacity: 0.5,
    nodeShadowRadius: 8,
    outlineOpacity: 0,
    outlineWidth: 1,
    sideXGradient: { ...businessFlowPalettes.dark.sideXGradient },
    sideZGradient: { ...businessFlowPalettes.dark.sideZGradient },
  },
  light: {
    connectorColor: businessFlowPalettes.light.beam,
    connectorStroke: 'solid',
    frontGradient: {
      end: businessFlowPalettes.light.beam,
      mid: businessFlowPalettes.light.beam,
      start: businessFlowPalettes.light.homepageNodeFrontStart,
    },
    iconFill: businessFlowPalettes.light.iconStroke,
    iconStroke: businessFlowPalettes.light.white,
    nodeCornerRadius: 0,
    nodeShadowLightX: -6,
    nodeShadowLightY: 14,
    nodeShadowLightZ: -5,
    nodeShadowOpacity: 0.38,
    nodeShadowRadius: 8,
    outlineOpacity: 0.3,
    outlineWidth: 1.25,
    sideXGradient: {
      end: businessFlowPalettes.light.beam,
      mid: businessFlowPalettes.light.beam,
      start: businessFlowPalettes.light.beam,
    },
    sideZGradient: {
      end: businessFlowPalettes.light.beam,
      mid: businessFlowPalettes.light.beam,
      start: businessFlowPalettes.light.beam,
    },
  },
};

export function getBusinessFlowPalette(mode: ResolvedTheme): BusinessFlowPalette {
  return businessFlowPalettes[mode];
}

export function getBusinessFlowHeroTreatment(mode: ResolvedTheme): BusinessFlowHeroTreatment {
  return businessFlowHeroTreatments[mode];
}

// Kept for existing workflow consumers until they resolve the active theme themselves.
export const businessFlowPalette = businessFlowPalettes.dark;
