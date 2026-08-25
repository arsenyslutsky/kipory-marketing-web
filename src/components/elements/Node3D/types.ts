import type { CSSProperties } from 'react';

export type Node3DMode = 'light' | 'dark';
export type Node3DShape = 'rectangle' | 'circle' | 'square' | 'triangle' | 'hexagon';
export type Node3DProgressMode = 'bar' | 'outline';

export type Node3DProps = {
  assetBasePath?: string;
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
  iconOpacity?: number;
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

export type Node3DSceneOptions = Required<Omit<Node3DProps, 'className' | 'height' | 'width'>> & {
  elements: Node3DSceneElements;
};

export type Node3DSceneController = {
  destroy: () => void;
};
