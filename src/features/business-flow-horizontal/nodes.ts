import type { FlowLayer3DNode } from '@/components/elements/FlowLayer3D';

export type BusinessFlowHorizontalLayoutNode = {
  delay: number;
  icon: 'download' | 'profile' | 'profile-alt' | 'server' | 'graph' | 'vector' | 'intelligence';
  id: string;
  kind: 'collector' | 'relay' | 'terminal';
  x: number;
  y: number;
};

export const businessFlowHorizontalLayoutNodes: readonly BusinessFlowHorizontalLayoutNode[] = [
  { id: 'terminal-1', kind: 'terminal', icon: 'download', x: 37, y: 59, delay: 2.68 },
  { id: 'terminal-2', kind: 'terminal', icon: 'profile', x: 37, y: 155, delay: 2.76 },
  { id: 'terminal-3', kind: 'terminal', icon: 'profile-alt', x: 37, y: 251, delay: 2.72 },
  { id: 'terminal-4', kind: 'terminal', icon: 'download', x: 37, y: 357, delay: 2.8 },
  { id: 'terminal-5', kind: 'terminal', icon: 'profile', x: 37, y: 453, delay: 2.76 },
  { id: 'terminal-6', kind: 'terminal', icon: 'profile-alt', x: 37, y: 549, delay: 2.84 },
  { id: 'relay-1', kind: 'relay', icon: 'server', x: 143, y: 107, delay: 1.68 },
  { id: 'relay-2', kind: 'relay', icon: 'graph', x: 143, y: 304, delay: 1.74 },
  { id: 'relay-3', kind: 'relay', icon: 'vector', x: 143, y: 501, delay: 1.8 },
  { id: 'collector', kind: 'collector', icon: 'intelligence', x: 248, y: 304, delay: 0.68 },
];

export const businessFlowHorizontalLayoutNodeById: Record<string, BusinessFlowHorizontalLayoutNode> =
  Object.fromEntries(businessFlowHorizontalLayoutNodes.map((node) => [node.id, node]));

const roleDimensions = {
  collector: { cardDepth: 48, height: 12, shape: 'hexagon', tier: 0, width: 58 },
  relay: { cardDepth: 48, height: 10, shape: 'square', tier: 1, width: 48 },
  terminal: { cardDepth: 34, height: 8, shape: 'rectangle', tier: 2, width: 30 },
} as const;

export function createBusinessFlowHorizontalNodes({
  auxiliaryIconColor,
  centralIconColor,
  centralIconStrokeOpacity,
  iconSize,
  iconStrokeColor,
  strokeWidth,
}: {
  auxiliaryIconColor: string;
  centralIconColor: string;
  centralIconStrokeOpacity: number;
  iconSize: number;
  iconStrokeColor: string;
  strokeWidth: number;
}): readonly FlowLayer3DNode[] {
  const scale = iconSize / 40;

  return businessFlowHorizontalLayoutNodes.map((node) => {
    const dimensions = roleDimensions[node.kind];
    const central = node.kind !== 'terminal';

    return {
      cardDepth: dimensions.cardDepth * scale,
      height: dimensions.height * scale,
      icon: `${node.icon}.svg`,
      iconColor: central ? centralIconColor : auxiliaryIconColor,
      iconOpacity: central ? 1 : 0.72,
      iconStrokeColor,
      ...(central && {
        iconStrokeOpacity: centralIconStrokeOpacity,
        iconStrokeWidth: strokeWidth,
      }),
      ...(!central && { iconStrokeWidth: strokeWidth / 4 }),
      id: node.id,
      position: [node.x / 320, node.y / 608],
      shape: dimensions.shape,
      tier: dimensions.tier,
      width: dimensions.width * scale,
    };
  });
}
