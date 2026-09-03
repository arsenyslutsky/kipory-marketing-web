import type { FlowPath3D, FlowPath3DPoint } from '../FlowPath3D/types';
import type { ResolvedTheme } from '@/theme/theme';
import type { Connector3DStroke } from '../Connector3D/types';
import type {
  Node3DIconFillMode,
  Node3DMode,
  Node3DProgressMode,
  Node3DResolvedGradient,
  Node3DShape,
} from '../Node3D/types';
import type { WorkflowRuntimeOptions } from '../workflow-runtime';

export type FlowLayer3DPoint = readonly [x: number, y: number];

export type NodeShadowProps = {
  nodeShadowBias?: number;
  nodeShadowBlurSamples?: number;
  nodeShadowColor?: string;
  nodeShadowLightX?: number;
  nodeShadowLightY?: number;
  nodeShadowLightZ?: number;
  nodeShadowNormalBias?: number;
  nodeShadowOpacity?: number;
  nodeShadowRadius?: number;
};

export type FlowLayer3DNode = {
  cardDepth: number;
  glowIntensity?: number;
  height: number;
  icon: string;
  iconColor: string;
  iconFillMode?: Node3DIconFillMode;
  iconGradient?: Node3DResolvedGradient;
  iconOpacity: number;
  iconStrokeColor?: string;
  iconStrokeOpacity?: number;
  iconStrokeWidth?: number;
  id: string;
  position: FlowLayer3DPoint;
  progress?: number;
  scale?: number;
  shape: Node3DShape;
  tier: number;
  width: number;
};

export type FlowLayer3DNodeStyle = {
  assetBasePath: string;
  frontGradient: Node3DResolvedGradient;
  mode?: Node3DMode;
  nodeCornerRadius: number;
  outlineOpacity: number;
  outlineWidth: number;
  progressBarHeight: number;
  progressMaxDelay?: number;
  progressMinDelay?: number;
  progressMode: Node3DProgressMode;
  progressPadding: number;
  sideXGradient: Node3DResolvedGradient;
  sideZGradient: Node3DResolvedGradient;
};

export type ResolvedFlowLayer3DNodeStyle = Omit<FlowLayer3DNodeStyle, 'mode'> & {
  mode: ResolvedTheme;
};

export type FlowLayer3DNodeFrame = {
  aspectRatio: number;
  viewportHeight: number;
  worldHeight?: number;
};

export type ResolvedFlowLayer3DNode = Omit<FlowLayer3DNode, 'position' | 'width' | 'cardDepth' | 'height'> & {
  cardDepth: number;
  height: number;
  position: readonly [x: number, z: number];
  width: number;
};

export type FlowLayer3DFrame = {
  aspectRatio: number;
  worldHeight?: number;
};

export type FlowLayer3DPath = {
  id: string;
  points: readonly FlowLayer3DPoint[];
  curve?: number;
  fading?: boolean;
};

export type ResolvedFlowLayer3DPath = {
  fading: boolean;
  id: string;
  path: FlowPath3D;
};

export type FlowLayer3DConnectorStyle = {
  color: string;
  opacity: number;
  stroke: Connector3DStroke;
  width: number;
};

export type FlowLayer3DBeamStyle = {
  beamColor: string;
  beamHighlightColor: string;
  beamWidth: number;
  enabled: boolean;
  glowIntensity: number;
  headGlowBlur?: number;
  headGlowOpacity?: number;
  headGlowRadius?: number;
  trailLength: number;
};

export type FlowLayer3DArrival = {
  id: string;
  point: FlowLayer3DPoint;
  processingDelayMs?: number;
  progress: number;
};

export type FlowLayer3DArrivalEvent = {
  arrival: FlowLayer3DArrival;
  generation: number;
  runId: string;
  slot: number;
};

export type FlowLayer3DBeamFade = {
  /** Normalized progress where continuation-edge fade-in reaches full opacity. */
  startUntilProgress?: number;
  /** Normalized progress where continuation-edge fade-out begins. */
  endFromProgress?: number;
};

export type FlowLayer3DBeamRun = {
  arrivals?: readonly FlowLayer3DArrival[];
  delayMs: number;
  durationMs: number;
  fade?: FlowLayer3DBeamFade;
  id: string;
  path: FlowLayer3DPath;
  /** Normalized fraction of the active path; falls back to the shared beam style. */
  trailLength?: number;
};

export type FlowLayer3DBeamSource = {
  slots: number;
  next: (slot: number, generation: number) => FlowLayer3DBeamRun | null;
};

export type FlowLayer3DProps = WorkflowRuntimeOptions & NodeShadowProps & {
  beam: FlowLayer3DBeamStyle;
  beamSource: FlowLayer3DBeamSource;
  className?: string;
  connector: FlowLayer3DConnectorStyle;
  mode?: ResolvedTheme;
  nodes?: readonly FlowLayer3DNode[];
  nodeStyle?: FlowLayer3DNodeStyle;
  onActivityChange?: (active: boolean) => void;
  onArrival?: (event: FlowLayer3DArrivalEvent) => void;
  paths: readonly FlowLayer3DPath[];
  reducedMotion?: boolean;
  worldHeight?: number;
};

export type FlowLayer3DSceneOptions = Omit<
  FlowLayer3DProps,
  'activityStrategy' | 'className' | 'loadStrategy' | 'nodeStyle' | 'onActivityChange' | 'preloadMargin'
> & {
  active?: boolean;
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  cssLayer: HTMLElement;
  nodeStyle?: ResolvedFlowLayer3DNodeStyle;
  onError?: (error: unknown) => void;
  onReady?: () => void;
};

export type FlowLayer3DSceneController = {
  destroy: () => void;
  setActive: (active: boolean) => void;
};

export type { FlowPath3DPoint };
