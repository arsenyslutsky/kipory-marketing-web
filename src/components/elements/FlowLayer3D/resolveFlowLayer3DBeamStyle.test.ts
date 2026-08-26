import { expect, it } from 'vitest';
import { resolveFlowLayer3DBeamStyle } from './resolveFlowLayer3DBeamStyle';

it('maps independent head-glow controls without changing base beam controls', () => {
  expect(resolveFlowLayer3DBeamStyle({
    beamColor: '#449c40',
    beamHighlightColor: '#c9ebc7',
    beamWidth: 2,
    enabled: true,
    glowIntensity: 1,
    headGlowBlur: 16,
    headGlowOpacity: 0.4,
    headGlowRadius: 64,
    trailLength: 0.2,
  })).toEqual({
    beamWidth: 2,
    glowIntensity: 1,
    packetHaloBlur: 0.5,
    packetHaloOpacity: 0.4,
    packetHaloSize: 2,
    trailLength: 0.2,
  });
});

it('leaves shared defaults unchanged when optional head-glow controls are omitted', () => {
  expect(resolveFlowLayer3DBeamStyle({
    beamColor: '#449c40',
    beamHighlightColor: '#c9ebc7',
    beamWidth: 1,
    enabled: true,
    glowIntensity: 1,
    trailLength: 0.38,
  })).toEqual({
    beamWidth: 1,
    glowIntensity: 1,
    packetHaloBlur: undefined,
    packetHaloOpacity: undefined,
    packetHaloSize: undefined,
    trailLength: 0.38,
  });
});
