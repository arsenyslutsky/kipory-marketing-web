import type { FlowLayer3DNode } from '@/components/elements/FlowLayer3D';

export const businessCoreNodeFlowMaxAuxiliaryConnections = 24;

export const businessCoreNodeFlowIconOptions = [
  'intelligence',
  'server',
  'graph',
  'vector',
  'download',
  'profile',
  'profile-alt',
] as const;

export type BusinessCoreNodeFlowIcon = (typeof businessCoreNodeFlowIconOptions)[number];
export type BusinessCoreNodeFlowAuxiliaryIcon = BusinessCoreNodeFlowIcon | 'mixed';

export type BusinessCoreNodeFlowSpoke = {
  auxiliaryPoint: readonly [x: number, y: number];
  edgePoint: readonly [x: number, y: number];
  id: string;
};

export type BusinessCoreNodeFlowLayoutNode = {
  icon: BusinessCoreNodeFlowIcon;
  id: string;
  kind: 'auxiliary' | 'core';
  x: number;
  y: number;
};

const auxiliaryIcons: readonly BusinessCoreNodeFlowIcon[] = [
  'download',
  'profile',
  'profile-alt',
];

const roleDimensions = {
  auxiliary: { cardDepth: 34, height: 8, shape: 'rectangle', tier: 2, width: 30 },
  core: { cardDepth: 48, height: 12, shape: 'hexagon', tier: 0, width: 58 },
} as const;

function roundedCoordinate(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function resolveBusinessCoreNodeFlowConnectionCount(requestedCount: number) {
  return Math.min(
    businessCoreNodeFlowMaxAuxiliaryConnections,
    Math.max(0, Math.floor(requestedCount)),
  );
}

export function createBusinessCoreNodeFlowSpokes(
  requestedCount: number,
): readonly BusinessCoreNodeFlowSpoke[] {
  const count = resolveBusinessCoreNodeFlowConnectionCount(requestedCount);

  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);
    const edgeDistance = 50 / Math.max(Math.abs(directionX), Math.abs(directionY));

    return {
      auxiliaryPoint: [
        roundedCoordinate(50 + directionX * 32),
        roundedCoordinate(50 + directionY * 32),
      ],
      edgePoint: [
        roundedCoordinate(50 + directionX * edgeDistance),
        roundedCoordinate(50 + directionY * edgeDistance),
      ],
      id: `auxiliary-${index + 1}`,
    };
  });
}

export function createBusinessCoreNodeFlowLayoutNodes(
  requestedCount = 12,
  showAuxiliaryNodes = true,
  centralIcon: BusinessCoreNodeFlowIcon = 'intelligence',
  auxiliaryIcon: BusinessCoreNodeFlowAuxiliaryIcon = 'mixed',
): readonly BusinessCoreNodeFlowLayoutNode[] {
  const core: BusinessCoreNodeFlowLayoutNode = {
    id: 'core',
    icon: centralIcon,
    kind: 'core',
    x: 50,
    y: 50,
  };

  if (!showAuxiliaryNodes) return [core];

  return [
    core,
    ...createBusinessCoreNodeFlowSpokes(requestedCount).map((spoke, index) => ({
      id: spoke.id,
      icon: auxiliaryIcon === 'mixed'
        ? auxiliaryIcons[index % auxiliaryIcons.length]
        : auxiliaryIcon,
      kind: 'auxiliary' as const,
      x: spoke.auxiliaryPoint[0],
      y: spoke.auxiliaryPoint[1],
    })),
  ];
}

export function createBusinessCoreNodeFlowNodes({
  auxiliaryIconColor,
  centralIconColor,
  centralIconStrokeOpacity,
  iconSize,
  iconStrokeColor,
  layoutNodes,
  strokeWidth,
}: {
  auxiliaryIconColor: string;
  centralIconColor: string;
  centralIconStrokeOpacity: number;
  iconSize: number;
  iconStrokeColor: string;
  layoutNodes: readonly BusinessCoreNodeFlowLayoutNode[];
  strokeWidth: number;
}): readonly FlowLayer3DNode[] {
  const scale = iconSize / 40;

  return layoutNodes.map((node) => {
    const dimensions = roleDimensions[node.kind];
    const central = node.kind === 'core';

    return {
      cardDepth: dimensions.cardDepth * scale,
      height: dimensions.height * scale,
      icon: `${node.icon}.svg`,
      iconColor: central ? centralIconColor : auxiliaryIconColor,
      iconOpacity: central ? 1 : 0.72,
      iconStrokeColor,
      ...(central
        ? {
            iconStrokeOpacity: centralIconStrokeOpacity,
            iconStrokeWidth: strokeWidth,
          }
        : { iconStrokeWidth: strokeWidth / 4 }),
      id: node.id,
      position: [node.x / 100, node.y / 100],
      shape: dimensions.shape,
      tier: dimensions.tier,
      width: dimensions.width * scale,
    };
  });
}
