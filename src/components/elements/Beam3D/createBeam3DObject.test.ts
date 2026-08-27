import * as THREE from 'three';
import { expect, it } from 'vitest';
import { createBeam3DObject } from './createBeam3DObject';

const colors = {
  beam: '#449c40',
  beamHighlight: '#c9ebc7',
  flare: '#c9ebc7',
  flareStops: ['#fff', '#eee', '#aaa', '#555', '#000'] as const,
  packetCore: '#c9ebc7',
  packetHalo: '#449c40',
};

function createObject(options: {
  packetHaloBlur: number;
  packetHaloOpacity: number;
  packetHaloSize: number;
  trailLength?: number;
}) {
  const start = new THREE.Vector3(0, 0, 0);
  const end = new THREE.Vector3(1, 0, 0);

  return createBeam3DObject({
    ...options,
    colors,
    flareTexture: new THREE.Texture(),
    fogEnabled: false,
    mode: 'dark',
    path: {
      curve: new THREE.LineCurve3(start, end),
      direction: 'forward',
      points: [start, end],
    },
    style: 'ribbon',
  });
}

it('applies packet halo blur, opacity, and size independently', () => {
  const beam = createObject({
    packetHaloBlur: 0.25,
    packetHaloOpacity: 0.4,
    packetHaloSize: 2,
  });

  beam.update({ progress: 0.5, time: 0 });

  expect(beam.packetHalo.material.uniforms.uBlur.value).toBe(0.25);
  expect(beam.packetHalo.material.uniforms.uOpacity.value).toBe(0.4);
  expect(beam.packetHalo.scale.x).toBeCloseTo(1.72);
});

it('supports an exactly disabled trail without changing the existing default', () => {
  const packetOptions = {
    packetHaloBlur: 0,
    packetHaloOpacity: 0.4,
    packetHaloSize: 1,
  };
  const disabledTrail = createObject({ ...packetOptions, trailLength: 0 });
  const defaultTrail = createObject(packetOptions);

  expect(disabledTrail.core.material.uniforms.uTrailLength.value).toBe(0);
  expect(disabledTrail.glow.material.uniforms.uTrailLength.value).toBe(0);
  expect(disabledTrail.aura.material.uniforms.uTrailLength.value).toBe(0);
  expect(defaultTrail.core.material.uniforms.uTrailLength.value).toBe(0.38);
});

it('updates every trail material for a route-specific normalized length', () => {
  const beam = createObject({
    packetHaloBlur: 0,
    packetHaloOpacity: 0.4,
    packetHaloSize: 1,
  });

  beam.setTrailLength(0.25);

  expect(beam.core.material.uniforms.uTrailLength.value).toBe(0.25);
  expect(beam.glow.material.uniforms.uTrailLength.value).toBe(0.25);
  expect(beam.aura.material.uniforms.uTrailLength.value).toBe(0.25);
});
