import type { Node3DResolvedGradient } from '@/components/elements/Node3D';

export type NodeAppearanceProps = {
  nodeBodyColor?: string;
  nodeFrontGradientAngle?: number;
  nodeFrontGradientEndColor?: string;
  nodeFrontGradientMidColor?: string;
  nodeFrontGradientStartColor?: string;
  nodeSideXGradientAngle?: number;
  nodeSideXGradientEndColor?: string;
  nodeSideXGradientMidColor?: string;
  nodeSideXGradientStartColor?: string;
  nodeSideZGradientAngle?: number;
  nodeSideZGradientEndColor?: string;
  nodeSideZGradientMidColor?: string;
  nodeSideZGradientStartColor?: string;
};

export type ResolvedNodeAppearance = {
  bodyColor: string;
  frontGradient: Node3DResolvedGradient;
  sideXGradient: Node3DResolvedGradient;
  sideZGradient: Node3DResolvedGradient;
};

export function resolveNodeAppearance(
  props: NodeAppearanceProps,
  defaults: ResolvedNodeAppearance,
): ResolvedNodeAppearance {
  return {
    bodyColor: props.nodeBodyColor ?? defaults.bodyColor,
    frontGradient: {
      angle: props.nodeFrontGradientAngle ?? defaults.frontGradient.angle,
      start: props.nodeFrontGradientStartColor ?? defaults.frontGradient.start,
      mid: props.nodeFrontGradientMidColor ?? defaults.frontGradient.mid,
      end: props.nodeFrontGradientEndColor ?? defaults.frontGradient.end,
    },
    sideXGradient: {
      angle: props.nodeSideXGradientAngle ?? defaults.sideXGradient.angle,
      start: props.nodeSideXGradientStartColor ?? defaults.sideXGradient.start,
      mid: props.nodeSideXGradientMidColor ?? defaults.sideXGradient.mid,
      end: props.nodeSideXGradientEndColor ?? defaults.sideXGradient.end,
    },
    sideZGradient: {
      angle: props.nodeSideZGradientAngle ?? defaults.sideZGradient.angle,
      start: props.nodeSideZGradientStartColor ?? defaults.sideZGradient.start,
      mid: props.nodeSideZGradientMidColor ?? defaults.sideZGradient.mid,
      end: props.nodeSideZGradientEndColor ?? defaults.sideZGradient.end,
    },
  };
}
