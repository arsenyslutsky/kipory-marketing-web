import type { CSSProperties } from 'react';
import type { ResolvedTheme } from '@/theme/theme';
import type { FlowPath3D, FlowPath3DDirection } from '../FlowPath3D/types';

export type Connector3DStroke = 'solid' | 'dotted' | 'dashed';

export type Connector3DProps = {
  cameraPitch?: number;
  cameraYaw?: number;
  cameraZoom?: number;
  className?: string;
  color?: string;
  connectorWidth?: number;
  direction?: FlowPath3DDirection;
  fading?: boolean;
  height?: CSSProperties['height'];
  interactive?: boolean;
  mode?: ResolvedTheme;
  opacity?: number;
  path?: FlowPath3D;
  pathCurve?: number;
  perspectiveEffect?: number;
  stroke?: Connector3DStroke;
  width?: CSSProperties['width'];
};

export type Connector3DSceneElements = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
};

export type Connector3DSceneOptions = Required<Omit<Connector3DProps, 'className' | 'height' | 'width'>> & {
  elements: Connector3DSceneElements;
};

export type Connector3DSceneController = {
  destroy: () => void;
};
