import type { FlowLayer3DNode } from '@/components/elements/FlowLayer3D';
import type { Node3DResolvedGradient } from '@/components/elements/Node3D';
import type { PillarIconFillMode, PillarIconName } from './components/PillarIcon';
import type { PillarSurroundingIconName } from './components/PillarSurroundingIcon';

export type PillarPoint = readonly [x: number, y: number];

export type BusinessFlowVerticalSatellite = {
  name: PillarSurroundingIconName;
  x: number;
  y: number;
};

export const businessFlowVerticalCentralNodes: readonly {
  id: PillarIconName;
  label: string;
  point: PillarPoint;
}[] = [
  { id: 'server', label: 'Server', point: [20, 50] },
  { id: 'graph', label: 'Graph', point: [40, 50] },
  { id: 'vector', label: 'Vector', point: [60, 50] },
  { id: 'intelligence', label: 'Intelligence', point: [80, 50] },
];

const surroundingIconNames: readonly PillarSurroundingIconName[] = [
  'download',
  'profile',
  'profile-alt',
];

const roleDimensions = {
  central: { cardDepth: 48, height: 10, shape: 'square', tier: 1, width: 48 },
  satellite: { cardDepth: 34, height: 8, shape: 'rectangle', tier: 2, width: 30 },
} as const;

function rowPoint(index: number, count: number, y: number, spacing: number) {
  const inset = 8;
  const availableWidth = 100 - inset * 2;
  const baseX = count === 1 ? 50 : inset + (availableWidth * index) / (count - 1);

  return { x: 50 + (baseX - 50) * spacing, y };
}

export function createBusinessFlowVerticalSatellites(
  requestedTopCount: number,
  requestedBottomCount: number,
  requestedSpacing: number,
): readonly BusinessFlowVerticalSatellite[] {
  const topCount = Math.max(0, Math.floor(requestedTopCount));
  const bottomCount = Math.max(0, Math.floor(requestedBottomCount));
  const spacing = Math.min(1, Math.max(0, requestedSpacing));

  return [
    ...Array.from({ length: topCount }, (_, index) => ({
      name: surroundingIconNames[index % surroundingIconNames.length],
      ...rowPoint(index, topCount, 18, spacing),
    })),
    ...Array.from({ length: bottomCount }, (_, index) => ({
      name: surroundingIconNames[(topCount + index) % surroundingIconNames.length],
      ...rowPoint(index, bottomCount, 82, spacing),
    })),
  ];
}

export function createBusinessFlowVerticalNodes({
  auxiliaryIconColor,
  auxiliaryIconOpacity = 0.72,
  centralIconColor,
  centralIconFillMode,
  centralIconOpacity = 1,
  centralIconStrokeOpacity,
  gradient,
  iconSize,
  iconStrokeColor,
  satellites,
  strokeWidth,
}: {
  auxiliaryIconColor: string;
  auxiliaryIconOpacity?: number;
  centralIconColor: string;
  centralIconFillMode: PillarIconFillMode;
  centralIconOpacity?: number;
  centralIconStrokeOpacity: number;
  gradient: Node3DResolvedGradient;
  iconSize: number;
  iconStrokeColor: string;
  satellites: readonly BusinessFlowVerticalSatellite[];
  strokeWidth: number;
}): readonly FlowLayer3DNode[] {
  const scale = iconSize / 40;

  return [
    ...businessFlowVerticalCentralNodes.map((node) => ({
      cardDepth: roleDimensions.central.cardDepth * scale,
      height: roleDimensions.central.height * scale,
      icon: `${node.id}.svg`,
      iconColor: centralIconColor,
      iconFillMode: centralIconFillMode === 'gradient' ? 'gradient' as const : 'solid' as const,
      iconGradient: gradient,
      iconOpacity: centralIconOpacity,
      iconStrokeColor,
      iconStrokeOpacity: centralIconStrokeOpacity,
      iconStrokeWidth: strokeWidth,
      id: node.id,
      position: [node.point[0] / 100, node.point[1] / 100] as const,
      shape: roleDimensions.central.shape,
      tier: roleDimensions.central.tier,
      width: roleDimensions.central.width * scale,
    })),
    ...satellites.map((satellite, index) => ({
      cardDepth: roleDimensions.satellite.cardDepth * scale,
      height: roleDimensions.satellite.height * scale,
      icon: `${satellite.name}.svg`,
      iconColor: auxiliaryIconColor,
      iconFillMode: 'solid' as const,
      iconOpacity: auxiliaryIconOpacity,
      iconStrokeColor,
      iconStrokeWidth: strokeWidth / 4,
      id: `satellite-${index}`,
      position: [satellite.x / 100, satellite.y / 100] as const,
      shape: roleDimensions.satellite.shape,
      tier: roleDimensions.satellite.tier,
      width: roleDimensions.satellite.width * scale,
    })),
  ];
}
