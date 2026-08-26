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
