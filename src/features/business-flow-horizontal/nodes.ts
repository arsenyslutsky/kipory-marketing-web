import type { FlowLayer3DNode } from '@/components/elements/FlowLayer3D';

export const businessFlowHorizontalIllustrationWidth = 320;
export const businessFlowHorizontalIllustrationHeight = 608;
export const businessFlowHorizontalMaxSideNodes = 12;

export type BusinessFlowHorizontalLayoutNode = {
  icon: 'download' | 'profile' | 'profile-alt' | 'server' | 'graph' | 'vector' | 'intelligence';
  id: string;
  kind: 'collector' | 'relay' | 'terminal';
  x: number;
  y: number;
};

const terminalIcons: readonly BusinessFlowHorizontalLayoutNode['icon'][] = [
  'download',
  'profile',
  'profile-alt',
];

const centralLayoutNodes: readonly BusinessFlowHorizontalLayoutNode[] = [
  { id: 'relay-1', kind: 'relay', icon: 'server', x: 143, y: 107 },
  { id: 'relay-2', kind: 'relay', icon: 'graph', x: 143, y: 304 },
  { id: 'relay-3', kind: 'relay', icon: 'vector', x: 143, y: 501 },
  { id: 'collector', kind: 'collector', icon: 'intelligence', x: 248, y: 304 },
];

const roleDimensions = {
  collector: { cardDepth: 48, height: 12, shape: 'hexagon', tier: 0, width: 58 },
  relay: { cardDepth: 48, height: 10, shape: 'square', tier: 1, width: 48 },
  terminal: { cardDepth: 34, height: 8, shape: 'rectangle', tier: 2, width: 30 },
} as const;

function resolveSideNodeCount(requestedCount: number) {
  return Math.min(
    businessFlowHorizontalMaxSideNodes,
    Math.max(0, Math.floor(requestedCount)),
  );
}

function rowY(index: number, count: number) {
  const top = 59;
  const bottom = businessFlowHorizontalIllustrationHeight - top;

  return count === 1 ? businessFlowHorizontalIllustrationHeight / 2 : top + (
    (bottom - top) * index
  ) / (count - 1);
}

export function createBusinessFlowHorizontalLayoutNodes(
  requestedLeftCount = 6,
  requestedRightCount = 3,
): readonly BusinessFlowHorizontalLayoutNode[] {
  const leftCount = resolveSideNodeCount(requestedLeftCount);
  const rightCount = resolveSideNodeCount(requestedRightCount);
  const leftNodes = Array.from({ length: leftCount }, (_, index) => ({
    id: `left-${index + 1}`,
    kind: 'terminal' as const,
    icon: terminalIcons[index % terminalIcons.length],
    x: 37,
    y: rowY(index, leftCount),
  }));
  const rightNodes = Array.from({ length: rightCount }, (_, index) => ({
    id: `right-${index + 1}`,
    kind: 'terminal' as const,
    icon: terminalIcons[(leftCount + index) % terminalIcons.length],
    x: 304,
    y: rowY(index, rightCount),
  }));

  return [...leftNodes, ...rightNodes, ...centralLayoutNodes];
}

export const businessFlowHorizontalLayoutNodes = createBusinessFlowHorizontalLayoutNodes();

export function createBusinessFlowHorizontalNodes({
  auxiliaryIconColor,
  centralIconColor,
  centralIconStrokeOpacity,
  iconSize,
  iconStrokeColor,
  layoutNodes = businessFlowHorizontalLayoutNodes,
  strokeWidth,
}: {
  auxiliaryIconColor: string;
  centralIconColor: string;
  centralIconStrokeOpacity: number;
  iconSize: number;
  iconStrokeColor: string;
  layoutNodes?: readonly BusinessFlowHorizontalLayoutNode[];
  strokeWidth: number;
}): readonly FlowLayer3DNode[] {
  const scale = iconSize / 40;

  return layoutNodes.map((node) => {
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
      position: [
        node.x / businessFlowHorizontalIllustrationWidth,
        node.y / businessFlowHorizontalIllustrationHeight,
      ],
      shape: dimensions.shape,
      tier: dimensions.tier,
      width: dimensions.width * scale,
    };
  });
}
