import type { CSSProperties } from 'react';
import type { ResolvedTheme } from '@/theme/theme';
import type { FlowPath3D, FlowPath3DDirection } from '../FlowPath3D/types';

export type Beam3DMode = ResolvedTheme;
export type Beam3DStyle = 'ribbon' | 'tube';
export type PacketCoreShape = 'circle' | 'triangle' | 'arrow';

export type Beam3DColors = {
  beam: string;
  beamHighlight: string;
  flare: string;
  flareStops: readonly [string, string, string, string, string];
  packetCore: string;
  packetHalo: string;
};

export type Beam3DProps = {
  beamColor?: string;
  beamWidth?: number;
  cameraPitch?: number;
  cameraYaw?: number;
  cameraZoom?: number;
  className?: string;
  delayBeforeDissapear?: number;
  direction?: FlowPath3DDirection;
  flareColor?: string;
  glowIntensity?: number;
  height?: CSSProperties['height'];
  highlightColor?: string;
  interactive?: boolean;
  mode?: Beam3DMode;
  packetColor?: string;
  packetCoreShape?: PacketCoreShape;
  packetCoreSize?: number;
  packetHaloBlur?: number;
  packetHaloColor?: string;
  packetHaloSize?: number;
  packetShadow?: number;
  packetVisible?: boolean;
  path?: FlowPath3D;
  perspectiveEffect?: number;
  playing?: boolean;
  progress?: number;
  softness?: number;
  speed?: number;
  startFade?: number;
  style?: Beam3DStyle;
  trailLength?: number;
  visibility?: number;
  width?: CSSProperties['width'];
};

export type Beam3DSceneElements = {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
};

export type Beam3DSceneOptions = Required<Omit<Beam3DProps, 'className' | 'height' | 'width'>> & {
  elements: Beam3DSceneElements;
};

export type Beam3DSceneController = {
  destroy: () => void;
};
