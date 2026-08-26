import type { FlowPath3D, FlowPath3DPoint } from '../FlowPath3D/types';

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

export type { FlowPath3DPoint };
