export type SignalFlowVariant = 'variant-2';
export type SignalFlowMode = 'light' | 'dark';
export type ConnectorStrokeType = 'solid' | 'dotted' | 'dashed';

export interface FlowNodeConfig {
  id: string;
  position: [number, number];
  label: string;
  svg: string;
  size: [number, number];
  tier: number;
}

export interface FlowConfig {
  root: string;
  nodes: FlowNodeConfig[];
  branches: Record<string, string[]>;
  variants?: Partial<Record<SignalFlowVariant, { hiddenNodes?: string[] }>>;
}

export interface SceneColorTokens {
  background: string;
  ground: string;
  fog: string;
  sky: string;
  bounce: string;
  key: string;
  gridMajor: string;
  gridMinor: string;
  gridOpacity: number;
  icon: string;
  card: string;
  cardHighlight: string;
  cardShadow: string;
  cardSide: string;
  cardSideHighlight: string;
  cardSideMid: string;
  cardSideShadow: string;
  cardBase: string;
  edge: string;
  connector: string;
  junction: string;
}

export interface EffectColorTokens {
  greenLight: string;
  nodeGlow: string;
  nodeEmissive: string;
  nodeStroke: string;
  beam: string;
  beamHighlight: string;
  packetCore: string;
  packetHalo: string;
  flare: string;
  flareStops: [string, string, string, string, string];
  nodeProgressTrack: string;
  nodeProgressFill: string;
}

export interface SignalFlowTheme {
  scene: SceneColorTokens;
  effects: EffectColorTokens;
  ui: Record<string, string>;
}

export type SignalFlowColors = Record<SignalFlowMode, SignalFlowTheme>;

export interface SignalFlowIllustrationProps {
  variant?: SignalFlowVariant;
  mode?: SignalFlowMode;
  flow?: FlowConfig;
  colors?: SignalFlowColors;
  assetBasePath?: string;
  className?: string;
  showInterface?: boolean;
  gridOpacity?: number;
  /** Target grid-cell spacing in CSS pixels at the initial camera framing. */
  gridDensity?: number;
  connectorOpacity?: number;
  connectorStroke?: ConnectorStrokeType;
  connectorWidth?: number;
  pathCurve?: number;
  outlineOpacity?: number;
  outlineWidth?: number;
  nodeDepth?: number;
  nodeCornerRadius?: number;
  perspectiveEffect?: number;
  cameraPitch?: number;
  cameraYaw?: number;
  cameraZoom?: number;
  scrollTilt?: number;
  scrollZoom?: number;
  scrollRange?: number;
  minDelay?: number;
  maxDelay?: number;
  progressBarHeight?: number;
  concurrentBeams?: number;
  minEmitDelay?: number;
  maxEmitDelay?: number;
  reducedMotion?: boolean;
  onModeChange?: (mode: SignalFlowMode) => void;
}
