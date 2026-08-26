import * as THREE from 'three';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConnector3DObject } from '../Connector3D/createConnector3DObject';
import { createFlowLayer3DObjects } from './createFlowLayer3DObjects';

vi.mock('../Connector3D/createConnector3DObject', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../Connector3D/createConnector3DObject')>();
  return { ...actual, createConnector3DObject: vi.fn(actual.createConnector3DObject) };
});

const realCreateConnector = vi.mocked(createConnector3DObject).getMockImplementation()!;

afterEach(() => {
  vi.mocked(createConnector3DObject).mockReset();
  vi.mocked(createConnector3DObject).mockImplementation(realCreateConnector);
});

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

  it('disposes earlier connector resources when a later route fails to compose', () => {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial();
    const disposeGeometry = vi.spyOn(geometry, 'dispose');
    const disposeMaterial = vi.spyOn(material, 'dispose');
    const firstConnector = new THREE.Group();
    firstConnector.add(new THREE.Mesh(geometry, material));
    let calls = 0;
    vi.mocked(createConnector3DObject).mockImplementation(() => {
      calls += 1;
      if (calls === 1) return firstConnector;
      throw new Error('second connector failed');
    });

    expect(() => createFlowLayer3DObjects({
      aspectRatio: 1,
      connector: { color: '#fff', opacity: 0.5, stroke: 'dashed', width: 1.25 },
      paths: [
        { id: 'first', points: [[0, 0.5], [1, 0.5]] },
        { id: 'second', points: [[0, 0.25], [1, 0.25]] },
      ],
      worldHeight: 20,
    })).toThrow('second connector failed');

    expect(disposeGeometry).toHaveBeenCalledOnce();
    expect(disposeMaterial).toHaveBeenCalledOnce();
    expect(firstConnector.parent).toBeNull();
  });
});
