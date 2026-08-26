import type * as THREE from 'three';

export type FlowPath3DPoint = readonly [x: number, y: number, z: number];
export type FlowPath3DDirection = 'forward' | 'reverse';
export type FlowPath3DInterpolation = 'linear' | 'smooth';

export type FlowPath3D = {
  points: readonly FlowPath3DPoint[];
  /** Corner rounding from 0–100. */
  curve?: number;
  interpolation?: FlowPath3DInterpolation;
};

export type ResolvedFlowPath3D = {
  curve: THREE.Curve<THREE.Vector3>;
  direction: FlowPath3DDirection;
  points: THREE.Vector3[];
};
