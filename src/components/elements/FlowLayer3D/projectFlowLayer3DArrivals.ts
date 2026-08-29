import * as THREE from 'three';
import type { ResolvedFlowPath3D } from '../FlowPath3D/types';
import { normalizedPointToWorld } from './resolveFlowLayer3D';
import type { FlowLayer3DArrival, FlowLayer3DFrame } from './types';

function projectPointOntoPath(point: THREE.Vector3, path: ResolvedFlowPath3D) {
  const segmentLengths = path.points.slice(1).map((end, index) => (
    end.distanceTo(path.points[index])
  ));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  if (totalLength <= 0 || !Number.isFinite(totalLength)) return 0;

  let distanceBeforeSegment = 0;
  let closestDistanceSquared = Number.POSITIVE_INFINITY;
  let closestDistanceAlongPath = 0;
  path.points.slice(1).forEach((end, index) => {
    const start = path.points[index];
    const length = segmentLengths[index];
    if (length <= 0 || !Number.isFinite(length)) return;
    const direction = end.clone().sub(start);
    const fraction = THREE.MathUtils.clamp(
      point.clone().sub(start).dot(direction) / direction.lengthSq(),
      0,
      1,
    );
    const projected = start.clone().addScaledVector(direction, fraction);
    const distanceSquared = projected.distanceToSquared(point);
    if (distanceSquared < closestDistanceSquared) {
      closestDistanceSquared = distanceSquared;
      closestDistanceAlongPath = distanceBeforeSegment + fraction * length;
    }
    distanceBeforeSegment += length;
  });

  return THREE.MathUtils.clamp(closestDistanceAlongPath / totalLength, 0, 1);
}

export function projectFlowLayer3DArrivals(
  arrivals: readonly FlowLayer3DArrival[],
  path: ResolvedFlowPath3D,
  frame: FlowLayer3DFrame,
): FlowLayer3DArrival[] {
  return arrivals.map((arrival) => ({
    ...arrival,
    progress: projectPointOntoPath(
      new THREE.Vector3(...normalizedPointToWorld(arrival.point, frame)),
      path,
    ),
  }));
}
