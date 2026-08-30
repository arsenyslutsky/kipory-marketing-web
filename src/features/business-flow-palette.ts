import colors from '@/data/colors.json';

const darkTheme = colors.dark;
const flareStops = darkTheme.effects.flareStops;

export const businessFlowPalette = {
  auxiliaryIconFill: '#212121',
  beam: darkTheme.effects.beam,
  beamHighlight: darkTheme.effects.beamHighlight,
  black: darkTheme.scene.bounce,
  centralIconFill: '#1d281d',
  connector: darkTheme.effects.nodeStroke,
  flare: darkTheme.effects.flare,
  flareStops: [flareStops[0], flareStops[1], flareStops[2], flareStops[3], flareStops[4]] as const,
  frontGradient: {
    end: '#052f24',
    mid: '#03492b',
    start: '#066b43',
  },
  grid: darkTheme.scene.gridMinor,
  horizontalAuxiliaryIconFill: '#0b270e',
  horizontalCentralIconFill: '#1b4e13',
  horizontalIconStroke: '#9fb996',
  iconStroke: '#f3f5ef',
  packetCore: darkTheme.effects.packetCore,
  packetHalo: darkTheme.effects.packetHalo,
  sideXGradient: {
    end: '#5c899b',
    mid: darkTheme.scene.cardSideMid,
    start: darkTheme.scene.cardSideHighlight,
  },
  sideZGradient: {
    end: '#0e4b81',
    mid: '#366480',
    start: '#427298',
  },
} as const;
