import type { Connector3DStroke } from '@/components/elements/Connector3D/types';
import type { WorkflowRuntimeOptions } from '@/components/elements/workflow-runtime';
import type { ResolvedTheme } from '@/theme/theme';

export type SignalFlowVariant = 'variant-2';
export type SignalFlowMode = ResolvedTheme;
export type ConnectorStrokeType = Connector3DStroke;
export type NodeGeometryShape = 'rectangle' | 'circle' | 'square' | 'triangle' | 'hexagon';
export type NodeShape =
  | NodeGeometryShape
  | 'custom'
  | 'all'
  | 'square-triangle-circle'
  | 'square-rectangle-circle';
export type NodeProgressMode = 'bar' | 'outline';

export interface FlowNodeConfig {
  id: string;
  position: [number, number];
  label: string;
  svg: string;
  size: [number, number];
  tier: number;
  shape: NodeGeometryShape;
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

export interface BusinessFlow3DProps extends WorkflowRuntimeOptions {
  variant?: SignalFlowVariant;
  mode?: SignalFlowMode;
  flow?: FlowConfig;
  colors?: SignalFlowColors;
  assetBasePath?: string;
  className?: string;
  showInterface?: boolean;
  /** Enable pointer-driven orbit controls and node hover effects. */
  interactive?: boolean;
  gridOpacity?: number;
  /** Apply camera-distance fog to the complete flow scene. */
  fogEnabled?: boolean;
  /** Target grid-cell spacing in CSS pixels at the initial camera framing. */
  gridDensity?: number;
  /** Radius of the white grid highlight in CSS pixels at the initial camera framing. */
  gridMaskRadius?: number;
  /** Soft falloff beyond the white grid-highlight radius, in CSS pixels. */
  gridMaskBlur?: number;
  connectorOpacity?: number;
  connectorStroke?: ConnectorStrokeType;
  connectorWidth?: number;
  /** Show incoming and terminal connectors that continue beyond the graph. */
  showContinuationConnectors?: boolean;
  pathCurve?: number;
  outlineOpacity?: number;
  outlineWidth?: number;
  /** Uniform visual scale applied to each node without changing its layout position. */
  nodeScale?: number;
  nodeDepth?: number;
  /** Per-node random depth variation, expressed as ± a percentage of nodeDepth. */
  nodeDepthRandom?: number;
  nodeShape?: NodeShape;
  nodeCornerRadius?: number;
  /** Opacity of the SVG artwork on the icon-bearing node face. */
  nodeIconOpacity?: number;
  /** Gradient angle for the icon-bearing node face, in degrees. */
  nodeFrontGradientAngle?: number;
  /** Gradient angle for node sides aligned to the X axis, in degrees. */
  nodeSideXGradientAngle?: number;
  /** Gradient angle for node sides aligned to the Z axis, in degrees. */
  nodeSideZGradientAngle?: number;
  nodeFrontGradientStartColor?: string;
  nodeFrontGradientMidColor?: string;
  nodeFrontGradientEndColor?: string;
  nodeSideXGradientStartColor?: string;
  nodeSideXGradientMidColor?: string;
  nodeSideXGradientEndColor?: string;
  nodeSideZGradientStartColor?: string;
  nodeSideZGradientMidColor?: string;
  nodeSideZGradientEndColor?: string;
  perspectiveEffect?: number;
  cameraPitch?: number;
  cameraYaw?: number;
  cameraZoom?: number;
  /** World-space X coordinate of the root emitter center. */
  emitterX?: number;
  /** World-space Y coordinate of the root emitter center on the flow plane. */
  emitterY?: number;
  scrollTilt?: number;
  scrollZoom?: number;
  scrollRange?: number;
  minDelay?: number;
  maxDelay?: number;
  /** Multiplier applied to the complete flow-animation timebase. */
  speed?: number;
  nodeProgressMode?: NodeProgressMode;
  /** Relative inset of node progress from the shape edge; 1 preserves the default spacing. */
  progressPadding?: number;
  /** Thickness used by both bar and outline node progress modes. */
  progressBarHeight?: number;
  concurrentBeams?: number;
  minEmitDelay?: number;
  maxEmitDelay?: number;
  reducedMotion?: boolean;
  onModeChange?: (mode: SignalFlowMode) => void;
}
