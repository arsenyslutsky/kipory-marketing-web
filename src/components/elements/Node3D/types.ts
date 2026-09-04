import type { CSSProperties } from 'react';
import type { ResolvedTheme } from '@/theme/theme';

export type Node3DMode = ResolvedTheme;
export type Node3DShape = 'rectangle' | 'circle' | 'square' | 'triangle' | 'hexagon';
export type Node3DProgressMode = 'bar' | 'outline';
export type Node3DIconFillMode = 'solid' | 'gradient';

export type Node3DResolvedGradient = {
  angle: number;
  end: string;
  mid: string;
  start: string;
};

export type Node3DIconStyle = {
  color: string;
  fillMode: Node3DIconFillMode;
  gradient?: Node3DResolvedGradient;
  strokeColor?: string;
  strokeOpacity: number;
  strokeWidth?: number;
};

export type Node3DProps = {
  assetBasePath?: string;
  bodyColor?: string;
  cameraPitch?: number;
  cameraYaw?: number;
  cameraZoom?: number;
  className?: string;
  depth?: number;
  floating?: boolean;
  frontGradientAngle?: number;
  frontGradientEndColor?: string;
  frontGradientMidColor?: string;
  frontGradientStartColor?: string;
  glowIntensity?: number;
  height?: CSSProperties['height'];
  icon?: string;
  iconColor?: string;
  iconOpacity?: number;
  iconStrokeColor?: string;
  iconStrokeOpacity?: number;
  iconStrokeWidth?: number;
  interactive?: boolean;
  mode?: Node3DMode;
  nodeCornerRadius?: number;
  nodeDepth?: number;
  nodeScale?: number;
  outlineOpacity?: number;
  outlineWidth?: number;
  perspectiveEffect?: number;
  progress?: number;
  progressBarHeight?: number;
  progressMode?: Node3DProgressMode;
  progressPadding?: number;
  shape?: Node3DShape;
  showProgress?: boolean;
  sideXGradientAngle?: number;
  sideXGradientEndColor?: string;
  sideXGradientMidColor?: string;
  sideXGradientStartColor?: string;
  sideZGradientAngle?: number;
  sideZGradientEndColor?: string;
  sideZGradientMidColor?: string;
  sideZGradientStartColor?: string;
  width?: CSSProperties['width'];
  nodeWidth?: number;
};

export type Node3DSceneElements = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  cssLayer: HTMLElement;
};

export type Node3DSceneOptions = Required<Omit<Node3DProps,
  'className' | 'height' | 'width' | 'bodyColor' | 'iconColor' | 'iconStrokeColor' | 'iconStrokeOpacity' | 'iconStrokeWidth'
>> & Pick<Node3DProps, 'bodyColor' | 'iconColor' | 'iconStrokeColor' | 'iconStrokeOpacity' | 'iconStrokeWidth'> & {
  elements: Node3DSceneElements;
};

export type Node3DSceneController = {
  destroy: () => void;
};
