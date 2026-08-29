import { normalizedPointToWorld } from './resolveFlowLayer3D';
import type {
  FlowLayer3DNode,
  FlowLayer3DNodeFrame,
  ResolvedFlowLayer3DNode,
} from './types';

function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

export function resolveFlowLayer3DNode(
  node: FlowLayer3DNode,
  frame: FlowLayer3DNodeFrame,
): ResolvedFlowLayer3DNode | null {
  const [normalizedX, normalizedY] = node.position;
  const worldHeight = frame.worldHeight ?? 20;

  if (
    !isFiniteNumber(normalizedX)
    || !isFiniteNumber(normalizedY)
    || !isFiniteNumber(node.cardDepth)
    || !isFiniteNumber(node.height)
    || !isFiniteNumber(node.width)
    || node.cardDepth <= 0
    || node.height <= 0
    || node.width <= 0
    || (node.scale !== undefined && !isFiniteNumber(node.scale))
    || !isFiniteNumber(node.tier)
    || !isFiniteNumber(frame.aspectRatio)
    || !isFiniteNumber(frame.viewportHeight)
    || frame.viewportHeight <= 0
    || !isFiniteNumber(worldHeight)
    || worldHeight <= 0
  ) {
    return null;
  }

  const pixelsToWorld = worldHeight / Math.max(frame.viewportHeight, 1);
  const [x, , z] = normalizedPointToWorld(node.position, {
    aspectRatio: frame.aspectRatio,
    worldHeight,
  });

  return {
    ...node,
    cardDepth: node.cardDepth * pixelsToWorld,
    height: node.height * pixelsToWorld,
    position: [x, z],
    width: node.width * pixelsToWorld,
  };
}
