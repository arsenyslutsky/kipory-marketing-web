import type { CreateBeam3DObjectOptions } from '../Beam3D/createBeam3DObject';
import type { FlowLayer3DBeamStyle } from './types';

export type ResolvedFlowLayer3DBeamStyle = Pick<
  CreateBeam3DObjectOptions,
  | 'beamWidth'
  | 'glowIntensity'
  | 'packetHaloBlur'
  | 'packetHaloOpacity'
  | 'packetHaloSize'
  | 'trailLength'
>;

export function resolveFlowLayer3DBeamStyle(
  style: FlowLayer3DBeamStyle,
): ResolvedFlowLayer3DBeamStyle {
  return {
    beamWidth: style.beamWidth,
    glowIntensity: style.glowIntensity,
    packetHaloBlur: style.headGlowBlur === undefined
      ? undefined
      : Math.min(1, Math.max(0, style.headGlowBlur / 32)),
    packetHaloOpacity: style.headGlowOpacity === undefined
      ? undefined
      : Math.min(1, Math.max(0, style.headGlowOpacity)),
    packetHaloSize: style.headGlowRadius === undefined
      ? undefined
      : Math.min(4, Math.max(0, style.headGlowRadius / 32)),
    trailLength: style.trailLength,
  };
}
