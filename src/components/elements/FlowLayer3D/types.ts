import type { FlowPath3D, FlowPath3DPoint } from '../FlowPath3D/types';
import type { Connector3DStroke } from '../Connector3D/types';

export type FlowLayer3DPoint = readonly [x: number, y: number];

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
  trailLength: number;
};

export type FlowLayer3DArrival = {
  id: string;
  point: FlowLayer3DPoint;
  progress: number;
};

export type FlowLayer3DArrivalEvent = {
  arrival: FlowLayer3DArrival;
  generation: number;
  runId: string;
  slot: number;
};

export type FlowLayer3DBeamRun = {
  arrivals?: readonly FlowLayer3DArrival[];
  delayMs: number;
  durationMs: number;
  id: string;
  path: FlowLayer3DPath;
};

export type FlowLayer3DBeamSource = {
  slots: number;
  next: (slot: number, generation: number) => FlowLayer3DBeamRun | null;
};

export type FlowLayer3DProps = {
  beam: FlowLayer3DBeamStyle;
  beamSource: FlowLayer3DBeamSource;
  className?: string;
  connector: FlowLayer3DConnectorStyle;
  onArrival?: (event: FlowLayer3DArrivalEvent) => void;
  paths: readonly FlowLayer3DPath[];
  reducedMotion?: boolean;
  worldHeight?: number;
};

export type FlowLayer3DSceneOptions = Omit<FlowLayer3DProps, 'className'> & {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
};

export type FlowLayer3DSceneController = { destroy: () => void };

export type { FlowPath3DPoint };
