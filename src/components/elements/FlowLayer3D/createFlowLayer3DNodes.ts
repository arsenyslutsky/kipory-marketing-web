import * as THREE from 'three';
import { defaultColors } from '@/features/business-flow-3d/config';
import { createNode3DObject } from '../Node3D/createNode3DObject';
import { disposeFlowLayer3DObjectResources } from './disposeFlowLayer3DObjectResources';
import { resolveFlowLayer3DNode } from './resolveFlowLayer3DNode';
import type { FlowLayer3DNode, FlowLayer3DNodeStyle } from './types';

export type FlowLayer3DNodes = {
  destroy: () => void;
  group: THREE.Group;
  nodes: THREE.Group[];
};

export function createFlowLayer3DNodes({
  aspectRatio,
  nodeStyle,
  nodes: descriptors,
  renderer,
  viewportHeight,
  worldHeight,
}: {
  aspectRatio: number;
  nodeStyle: FlowLayer3DNodeStyle;
  nodes: readonly FlowLayer3DNode[];
  renderer: THREE.WebGLRenderer;
  viewportHeight: number;
  worldHeight?: number;
}): FlowLayer3DNodes {
  const group = new THREE.Group();
  const nodes: THREE.Group[] = [];
  const theme = defaultColors[nodeStyle.mode];
  let destroyed = false;

  try {
    descriptors.forEach((node) => {
      const resolvedNode = resolveFlowLayer3DNode(node, { aspectRatio, viewportHeight, worldHeight });
      if (!resolvedNode) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Skipping invalid FlowLayer3D node:', node.id);
        }
        return;
      }
      const { glowIntensity, progress, scale = 1, ...nodeOptions } = resolvedNode;
      const nodeObject = createNode3DObject({
        ...nodeOptions,
        assetBasePath: nodeStyle.assetBasePath,
        fogEnabled: false,
        frontGradient: nodeStyle.frontGradient,
        initialGlowIntensity: glowIntensity ?? 0,
        initialProgress: progress,
        isDark: nodeStyle.mode === 'dark',
        isVariant2: true,
        nodeCornerRadius: nodeStyle.nodeCornerRadius,
        outlineOpacity: nodeStyle.outlineOpacity,
        outlineWidth: nodeStyle.outlineWidth,
        progressBarHeight: nodeStyle.progressBarHeight,
        progressMode: nodeStyle.progressMode,
        progressPadding: nodeStyle.progressPadding,
        renderer,
        scale,
        sideXGradient: nodeStyle.sideXGradient,
        sideZGradient: nodeStyle.sideZGradient,
        theme,
      });
      nodes.push(nodeObject);
      group.add(nodeObject);
    });
  } catch (error) {
    disposeFlowLayer3DObjectResources(group);
    group.clear();
    throw error;
  }

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      disposeFlowLayer3DObjectResources(group);
      group.clear();
    },
    group,
    nodes,
  };
}
