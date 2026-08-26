import type { FlowPath3DPoint } from '../FlowPath3D/types';
import type {
  FlowLayer3DFrame,
  FlowLayer3DPath,
  FlowLayer3DPoint,
  ResolvedFlowLayer3DPath,
} from './types';

export function normalizedPointToWorld(
  [x, y]: FlowLayer3DPoint,
  { aspectRatio, worldHeight = 20 }: FlowLayer3DFrame,
): FlowPath3DPoint {
  const worldWidth = worldHeight * Math.max(aspectRatio, 0.0001);
  return [(x - 0.5) * worldWidth, 0, (0.5 - y) * worldHeight];
}

export function resolveFlowLayer3DPath(
  route: FlowLayer3DPath,
  frame: FlowLayer3DFrame,
): ResolvedFlowLayer3DPath | null {
  const points = route.points.filter((point, index, source) => (
    index === 0 || point[0] !== source[index - 1][0] || point[1] !== source[index - 1][1]
  ));
  if (points.length < 2) return null;
  return {
    fading: route.fading ?? false,
    id: route.id,
    path: {
      curve: route.curve ?? 0,
      interpolation: 'linear',
      points: points.map((point) => normalizedPointToWorld(point, frame)),
    },
  };
}
