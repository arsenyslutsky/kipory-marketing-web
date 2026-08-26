import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createFlowLayer3DObjects } from './createFlowLayer3DObjects';

describe('createFlowLayer3DObjects', () => {
  it('creates Connector3D objects and skips invalid paths', () => {
    const objects = createFlowLayer3DObjects({
      aspectRatio: 1,
      connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
      paths: [
        { id: 'valid', points: [[0, 0.5], [1, 0.5]] },
        { id: 'invalid', points: [[0.5, 0.5], [0.5, 0.5]] },
      ],
      worldHeight: 20,
    });

    expect(objects.connectors).toHaveLength(1);
    expect(objects.connectors[0].userData.flowLayer3DPathId).toBe('valid');
    expect(objects.group).toBeInstanceOf(THREE.Group);

    objects.destroy();

    expect(objects.group.children).toHaveLength(0);
  });
});
